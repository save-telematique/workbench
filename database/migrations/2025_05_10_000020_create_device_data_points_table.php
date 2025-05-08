<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('device_data_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_message_id')->constrained('device_messages')->cascadeOnDelete();
            $table->foreignUuid('device_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignUuid('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('data_point_type_id')->constrained('data_point_types')->cascadeOnDelete();
            $table->jsonb('value');
            $table->timestamp('recorded_at');

            // No created_at / updated_at as per decision

            $table->index(['device_id', 'data_point_type_id', 'recorded_at'], 'idx_device_type_recorded_at');
            $table->index(['vehicle_id', 'data_point_type_id', 'recorded_at'], 'idx_vehicle_type_recorded_at');
            $table->index(['data_point_type_id', 'recorded_at'], 'idx_type_recorded_at');
            $table->index('recorded_at');
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
