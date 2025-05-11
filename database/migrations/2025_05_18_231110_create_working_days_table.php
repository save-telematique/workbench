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
        Schema::create('working_days', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('driver_id')->constrained('drivers');
            $table->date('date');
            $table->integer('driving_time')->nullable();
            $table->integer('break_needed_in')->nullable();
            $table->integer('next_break_duration')->nullable();
            $table->integer('remaining_driving_time')->nullable();
            $table->integer('remaining_weekly_driving_time')->nullable();
            $table->integer('weekly_driving_time')->nullable();
            $table->integer('weekly_exceedeed_driving_limit')->default(0)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('working_days');
    }
};
