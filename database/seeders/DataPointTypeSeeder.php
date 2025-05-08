<?php

namespace Database\Seeders;

use App\Enum\DataPointDataType;
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

            // Determine DataPointDataType based on the old processing_steps logic
            $dataType = DataPointDataType::STRING; // Default to STRING
            $atomicProcessingSteps = null; // For atomic types, processing_steps will be replaced by 'type'

            switch ($field) {
                case MessageFields::TOTAL_ODOMETER:
                case MessageFields::ENGINE_TEMPERATURE:
                case MessageFields::PCB_TEMPERATURE:
                    $dataType = DataPointDataType::INTEGER;
                    break;
                case MessageFields::IGNITION:
                case MessageFields::MOVEMENT:
                    $dataType = DataPointDataType::BOOLEAN;
                    break;
                case MessageFields::FUEL_LEVEL_PERCENT:
                case MessageFields::ADBLUE_LEVEL_PERCENT:
                case MessageFields::FUEL_LEVEL_LITERS:
                case MessageFields::EXTERNAL_VOLTAGE:
                case MessageFields::BATTERY_VOLTAGE:
                    $dataType = DataPointDataType::FLOAT;
                    break;
                case MessageFields::GPS_DATA:
                case MessageFields::DEVICE_DATA:
                    $dataType = DataPointDataType::JSON;
                    break;
                default:
                    $dataType = DataPointDataType::RAW;
                    break;
            }

            DataPointType::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'type' => $dataType, 
                    'category' => 'ATOMIC',
                    'processing_steps' => $atomicProcessingSteps,
                    'description' => trim($comment) ?: null,
                    'unit' => null,
                ]
            );
        }

        DataPointType::updateOrCreate(
            ['id' => 1000001],
            [
                'name' => 'Odomètre Kilomètres',
                'type' => DataPointDataType::FLOAT,
                'unit' => 'km',
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    [
                        'logic' => 'GET_LATEST_FROM_SOURCE',
                        'source_data_point_type_id' => MessageFields::TOTAL_ODOMETER->value,
                    ],
                    [
                        'logic' => 'MULTIPLY_BY',
                        'multiplier' => 0.001,
                    ],
                ],
                'description' => 'Alias pour l\'odomètre total. Source en mètres, affiché en km.',
            ]
        );
        
        DataPointType::updateOrCreate(
            ['id' => 1000002],
            [
                'name' => 'État du Contact (Booléen)',
                'type' => DataPointDataType::BOOLEAN, // Final type is boolean
                'unit' => null,
                'category' => 'COMPOSITE',
                'processing_steps' => [
                    [
                        'logic' => 'GET_LATEST_FROM_SOURCE',
                        'source_data_point_type_id' => MessageFields::IGNITION->value,
                    ]
                ],
                'description' => 'Alias pour l\'état du contact, déjà en booléen.',
            ]
        );
    }
}
