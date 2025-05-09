<?php

namespace Tests;

use App\Models\DeviceDataPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function beforeRefreshingDatabase()
    {
        $models = [
            DeviceDataPoint::class,
        ];

        // Drop tables for models using HasHyperTable trait
        foreach ($models as $model) {
            $instance = new $model();
            $tableName = $instance->getTable();
            DB::statement("DROP TABLE IF EXISTS {$tableName};");
        }
    }
}
