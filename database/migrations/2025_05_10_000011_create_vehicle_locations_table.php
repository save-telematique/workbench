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
        Schema::create('vehicle_locations', function (Blueprint $table) {
            $table->id('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained();
            $table->decimal('latitude', 11, 8);
            $table->decimal('longitude', 11, 8);
            $table->integer('speed');
            $table->integer('heading');
            $table->integer('satellites');
            $table->boolean('ignition');
            $table->boolean('moving');
            $table->integer('altitude');
            $table->text('address')->nullable();
            $table->json('address_details')->nullable();
            $table->dateTime('recorded_at');
            $table->foreignId('device_message_id')->nullable();
            $table->timestamps();

            // Indexes for efficient queries
            $table->index('recorded_at');
            $table->index(['vehicle_id', 'recorded_at']); // Compound index for vehicle-specific time queries
            $table->index(['latitude', 'longitude']); // Spatial queries
            $table->index('moving'); // Filter moving vehicles
            $table->index('ignition'); // Filter vehicles with ignition on
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_locations');
    }
}; 