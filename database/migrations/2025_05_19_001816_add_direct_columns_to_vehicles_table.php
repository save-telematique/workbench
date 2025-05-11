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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignUuid('current_driver_id')->nullable()->before('created_at');
            $table->foreignId('current_working_session_id')->nullable()->before('created_at');

            $table->foreign('current_driver_id')->references('id')->on('drivers');
            $table->foreign('current_working_session_id')->references('id')->on('working_sessions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['current_vehicle_location_id']);
            $table->dropForeign(['current_driver_id']);
            $table->dropForeign(['current_work_session_id']);
            $table->dropColumn(['current_vehicle_location_id', 'current_driver_id', 'current_work_session_id']);
        });
    }
};
