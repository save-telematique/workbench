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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained();
            $table->foreignId('vehicle_type_id')->constrained();
            $table->foreignId('vehicle_model_id')->constrained();
            $table->string('registration');
            $table->string('vin');
            $table->string('country', 2);
            $table->decimal('odometer', 10, 2)->nullable();
            $table->foreignId('current_vehicle_location_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
