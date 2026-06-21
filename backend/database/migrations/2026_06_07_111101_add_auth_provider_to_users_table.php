<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // local = normal kayıt, google = Google OAuth ile kayıt
            $table->string('auth_provider')->default('local')->after('stripe_customer_id');
            // Google'dan gelen unique kullanıcı ID'si
            $table->string('auth_provider_id')->nullable()->after('auth_provider');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['auth_provider', 'auth_provider_id']);
        });
    }
};