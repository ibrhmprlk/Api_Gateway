<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\Api\GatewayController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PlanController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;

// Stripe webhook — auth middleware'den muaf
Route::post('/billing/webhook', [BillingController::class, 'webhook']);

// Plans — public, landing page'den token olmadan çekilir
Route::get('/plans', [PlanController::class, 'index']);

Route::middleware('auth:sanctum')->post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-logs', [DashboardController::class, 'recentLogs']);

    Route::get('/plans/current', [PlanController::class, 'current']);

    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    Route::get('/keys', [ApiKeyController::class, 'index']);
    Route::post('/keys', [ApiKeyController::class, 'store']);
    Route::get('/keys/{apiKey}', [ApiKeyController::class, 'show']);
    Route::put('/keys/{apiKey}', [ApiKeyController::class, 'update']);
    Route::delete('/keys/{apiKey}', [ApiKeyController::class, 'destroy']);
    Route::post('/keys/{apiKey}/regenerate', [ApiKeyController::class, 'regenerate']);

    Route::get('/logs', [LogController::class, 'index']);
    Route::get('/logs/stats', [LogController::class, 'stats']);

    Route::get('/webhooks', [WebhookController::class, 'index']);
    Route::post('/webhooks', [WebhookController::class, 'store']);
    Route::put('/webhooks/{webhook}', [WebhookController::class, 'update']);
    Route::delete('/webhooks/{webhook}', [WebhookController::class, 'destroy']);
    Route::post('/webhooks/{webhook}/test', [WebhookController::class, 'test']);
    Route::get('/webhooks/{webhook}/logs', [WebhookController::class, 'logs']);

    Route::get('/billing', [BillingController::class, 'index']);
    Route::post('/billing/checkout', [BillingController::class, 'checkout']);
    Route::post('/billing/cancel', [BillingController::class, 'cancel']);
    Route::post('/billing/reactivate', [BillingController::class, 'reactivate']);
});

Route::prefix('gateway')->middleware(['rate.limit', 'ip.whitelist'])->group(function () {
    Route::get('/weather', [GatewayController::class, 'weather']);
    Route::get('/exchange', [GatewayController::class, 'exchange']);
    Route::get('/countries', [GatewayController::class, 'countries']);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);