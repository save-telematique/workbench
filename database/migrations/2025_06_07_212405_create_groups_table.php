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
        Schema::create('groups', function (Blueprint $table) {
            $table->uuid('id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color', 7)->nullable(); // Hex color code
            $table->uuid('parent_id')->nullable();
            $table->uuid('tenant_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->primary('id');
            
            $table->foreign('parent_id')->references('id')->on('groups')->onDelete('set null');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->index(['tenant_id', 'parent_id']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
