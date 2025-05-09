<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function beforeRefreshingDatabase()
    {
        // Find all models using the HasHyperTable trait
        $models = collect(get_declared_classes())
            ->filter(function ($class) {
                return is_subclass_of($class, \Illuminate\Database\Eloquent\Model::class) &&
                       in_array(\App\Traits\HasHyperTable::class, class_uses_recursive($class));
            })
            ->values()
            ->all();
        
        // Drop tables for models using HasHyperTable trait
        foreach ($models as $model) {
            $instance = new $model();
            $tableName = $instance->getTable();
            DB::statement("DROP TABLE IF EXISTS {$tableName};");
        }
    }
}
