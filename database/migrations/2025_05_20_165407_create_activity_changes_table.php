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
        Schema::create('activity_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('working_day_id')->constrained('working_days');
            $table->foreignUuid('vehicle_id')->constrained('vehicles');
            $table->dateTime('recorded_at');
            $table->foreignId('activity_id')->constrained('activities');
            $table->enum('type', ['manual', 'automatic', 'qr'])->default('automatic');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_changes');
    }
};
