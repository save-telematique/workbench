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
        Schema::create('device_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('device_id')->constrained();
            $table->json('message');
            $table->string('ip');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            // Index for better performance
            $table->index('processed_at');
        });

        Schema::table('vehicle_locations', function (Blueprint $table) {
            $table->foreign('device_message_id')->references('id')->on('device_messages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_messages');
    }
}; 