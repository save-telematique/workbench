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
        Schema::create('workflow_conditions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained()->onDelete('cascade');
            $table->string('field_path'); // Ex: 'vehicle.current_location.speed', 'driver.driving_time'
            $table->string('operator'); // Ex: 'equals', 'greater_than', 'less_than', 'contains', 'in_geofence'
            $table->json('value'); // Valeur de comparaison (peut être un array, string, number, etc.)
            $table->string('logical_operator')->default('AND'); // AND, OR
            $table->integer('group_id')->default(0); // Pour grouper les conditions
            $table->integer('order')->default(0); // Ordre d'évaluation
            $table->timestamps();

            $table->index(['workflow_id', 'group_id']);
            $table->index('field_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_conditions');
    }
}; 