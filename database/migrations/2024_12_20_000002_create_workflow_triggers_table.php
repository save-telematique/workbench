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
        Schema::create('workflow_triggers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained()->onDelete('cascade');
            $table->string('event_type'); // Ex: 'vehicle_entered_geofence', 'driver_activity_changed', 'fuel_level_low'
            $table->string('source_model'); // Ex: 'Vehicle', 'Driver', 'DeviceMessage'
            $table->json('event_data')->nullable(); // Configuration spécifique au déclencheur
            $table->integer('order')->default(0); // Ordre d'exécution
            $table->timestamps();

            $table->index(['workflow_id', 'event_type']);
            $table->index('source_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_triggers');
    }
}; 