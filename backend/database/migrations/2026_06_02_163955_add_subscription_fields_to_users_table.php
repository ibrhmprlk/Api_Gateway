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
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['developer', 'admin'])->default('developer')->after('password');
    $table->enum('plan', ['free', 'pro'])->default('free')->after('role');
    $table->enum('subscription_status', ['active', 'canceled', 'past_due'])->default('active')->after('plan');
    $table->timestamp('current_period_end')->nullable()->after('subscription_status');
    $table->timestamp('canceled_at')->nullable()->after('current_period_end');
    $table->string('stripe_customer_id')->nullable()->after('canceled_at');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
 Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['role', 'plan', 'subscription_status', 'current_period_end', 'canceled_at', 'stripe_customer_id']);
});
    }
};
