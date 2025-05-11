<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ActivitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activities = [
            [
                'id' => 0,
                'name' => 'Repos',
                'parent_id' => null,
                'color' => 'red',
            ],
            [
                'id' => 1,
                'name' => 'Disponibilité',
                'parent_id' => null,
                'color' => 'gray',
            ],
            [
                'id' => 2,
                'name' => 'Travail',
                'parent_id' => null,
                'color' => 'yellow',
            ],
            [
                'id' => 3,
                'name' => 'Conduite',
                'parent_id' => null,
                'color' => 'green',
            ],

            [
                'id' => 100,
                'name' => 'Carte retirée',
                'parent_id' => null,
                'color' => null,
            ],
        ];

        foreach ($activities as $activity) {
            Activity::create($activity);
        }
    }
}
