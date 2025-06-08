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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('severity')->default('info'); // info, warning, error, success
            $table->json('metadata')->nullable(); // For flexible data like links, images, etc.
            $table->string('alertable_type');
            $table->string('alertable_id'); // Using string to accommodate both UUIDs and integers
            $table->uuid('tenant_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['alertable_type', 'alertable_id']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['severity']);
            $table->index(['is_active', 'created_at']);
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
}; 