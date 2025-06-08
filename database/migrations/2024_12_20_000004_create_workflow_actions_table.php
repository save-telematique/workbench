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
        Schema::create('workflow_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained()->onDelete('cascade');
            $table->string('action_type'); // Ex: 'create_alert', 'send_notification', 'update_field', 'webhook'
            $table->string('target_model')->nullable(); // Ex: 'Vehicle', 'Driver' - quand l'action modifie un modèle
            $table->json('parameters'); // Configuration de l'action
            $table->integer('order')->default(0); // Ordre d'exécution
            $table->boolean('stop_on_error')->default(false); // Arrêter le workflow en cas d'erreur
            $table->timestamps();

            $table->index(['workflow_id', 'order']);
            $table->index('action_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_actions');
    }
}; 