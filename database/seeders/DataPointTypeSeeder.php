<?php

namespace Database\Seeders;

use App\Enum\MessageFields;
use App\Models\DataPointType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DataPointTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding DataPointTypes...');

        // Helper to create a descriptive name from enum case name
        $formatName = function (string $caseName): string {
            return Str::of($caseName)->replace('_', ' ')->title()->toString();
        };

        $enumFileContent = file_get_contents(app_path('Enum/MessageFields.php'));
        preg_match_all('/case\s+([A-Z0-9_]+)\s*=\s*\"([^\"]+)\";(?:\s*\/\/\s*(.+))?/', $enumFileContent, $matches, PREG_SET_ORDER);

        $parsedEnumCases = [];
        foreach ($matches as $match) {
            $parsedEnumCases[$match[1]] = [
                'value' => $match[2],
                'comment' => $match[3] ?? '' // Comment is optional
            ];
        }

        foreach (MessageFields::cases() as $field) {
            $caseName = $field->name; // ex: GPS_DATA
            $id = $field->value; // Use int value directly
            $name = $formatName($caseName);
            $comment = $parsedEnumCases[$caseName]['comment'] ?? '';

            // Specific overrides for known types
            $processingSteps = match ($field) {
                MessageFields::TOTAL_ODOMETER => [[ 'operation' => 'CAST_TO_INTEGER' ]], // meters to km
                MessageFields::IGNITION, MessageFields::MOVEMENT => [[ 'operation' => 'CAST_TO_BOOLEAN', 'true_values' => ['1'], 'false_values' => ['0'] ]],
                MessageFields::FUEL_LEVEL_PERCENT, MessageFields::ADBLUE_LEVEL_PERCENT => [[ 'operation' => 'CAST_TO_FLOAT' ]], // Often percentages are float
                MessageFields::FUEL_LEVEL_LITERS => [[ 'operation' => 'CAST_TO_FLOAT' ]],
                MessageFields::ENGINE_TEMPERATURE, MessageFields::PCB_TEMPERATURE => [[ 'operation' => 'CAST_TO_INTEGER' ]], // Assuming integer temperatures
                MessageFields::EXTERNAL_VOLTAGE, MessageFields::BATTERY_VOLTAGE => [[ 'operation' => 'CAST_TO_FLOAT' ]], // Voltages with decimals
                default => [],
            };

            DataPointType::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'category' => 'ATOMIC',
                    'processing_steps' => $processingSteps,
                    'description' => trim($comment) ?: null,
                ]
            );
        }

        $this->command->info('Finished seeding ATOMIC DataPointTypes.');

        // Seed COMPOSITE types (examples)
        DataPointType::updateOrCreate(
            ['id' => 1000001],
            [
                'name' => 'Odomètre Kilomètres',
                'unit' => 'km',
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    'logic' => 'GET_LATEST_FROM_SOURCE',
                    'source_data_point_type_id' => MessageFields::TOTAL_ODOMETER->value, // Use int value directly
                ],
                'description' => 'Alias pour l\'odomètre total, déjà converti en kilomètres.',
            ]
        );
        
        DataPointType::updateOrCreate(
            ['id' => 1000002],
            [
                'name' => 'État du Contact (Booléen)',
                'unit' => null,
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    'logic' => 'GET_LATEST_FROM_SOURCE',
                    'source_data_point_type_id' => MessageFields::IGNITION->value, // Use int value directly
                ],
                'description' => 'Alias pour l\'état du contact, déjà en booléen.',
            ]
        );

        $this->command->info('Finished seeding COMPOSITE DataPointTypes.');
    }
}
