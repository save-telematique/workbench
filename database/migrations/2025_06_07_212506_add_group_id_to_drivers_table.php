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
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'group_id')) {
                $table->uuid('group_id')->nullable()->after('tenant_id');
                
                $table->foreign('group_id')->references('id')->on('groups')->onDelete('set null');
                $table->index(['tenant_id', 'group_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropIndex(['tenant_id', 'group_id']);
            $table->dropColumn('group_id');
        });
    }
};
