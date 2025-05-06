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
        Schema::create('devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained();
            $table->foreignId('device_type_id')->constrained();
            $table->foreignUuid('vehicle_id')->nullable()->constrained();
            $table->string('firmware_version')->nullable();
            $table->string('serial_number');
            $table->string('sim_number')->nullable();
            $table->string('imei')->index()->unique();
            $table->dateTime('last_contact_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
