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
        Schema::create('data_point_types', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary(); // Not auto-incrementing, managed by seeder/logic
            $table->string('name');
            $table->string('unit')->nullable();
            $table->enum('category', ['ATOMIC', 'COMPOSITE'])->default('ATOMIC');
            $table->jsonb('processing_steps');
            $table->text('description')->nullable();
            $table->timestamps(); // Kept as per last agreement for potential future dynamic management
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_point_types');
    }
};
