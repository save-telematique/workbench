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
        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained()->onDelete('cascade');
            $table->string('triggered_by'); // Ex: 'VehicleEnteredGeofence', 'DriverActivityChanged'
            $table->json('trigger_data'); // Données qui ont déclenché le workflow
            $table->string('status'); // Ex: 'pending', 'running', 'completed', 'failed'
            $table->json('execution_log')->nullable(); // Log des étapes d'exécution
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['workflow_id', 'status']);
            $table->index(['triggered_by', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_executions');
    }
}; 