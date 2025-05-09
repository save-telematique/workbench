<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('device_data_points', function (Blueprint $table) {
            $table->foreignId('device_message_id')->constrained('device_messages')->cascadeOnDelete();
            $table->foreignUuid('device_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignUuid('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('data_point_type_id')->constrained('data_point_types')->cascadeOnDelete();
            $table->jsonb('value');
            $table->timestamptz('recorded_at');
        });

        // Enable TimescaleDB extension if not already enabled
        DB::statement('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
        // Convert the table to a hypertable
        DB::statement("SELECT create_hypertable('device_data_points', by_range('recorded_at'));");

        Schema::table('device_data_points', function (Blueprint $table) {
            $table->index(['recorded_at', 'device_id', 'data_point_type_id'], 'idx_device_type_recorded_at');
            $table->index(['recorded_at', 'vehicle_id', 'data_point_type_id'], 'idx_vehicle_type_recorded_at');
            $table->index(['recorded_at', 'device_message_id'], 'idx_device_message_recorded_at');
            $table->index(['recorded_at', 'data_point_type_id'], 'idx_type_recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_data_points');
    }
};
