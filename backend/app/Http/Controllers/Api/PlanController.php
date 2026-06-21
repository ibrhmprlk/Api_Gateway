<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = Plan::all(['id', 'name', 'rate_limit_per_minute', 'api_access', 'price_monthly', 'stripe_price_id']);
        return response()->json($plans);
    }

public function current(): JsonResponse
{
    $user = auth()->user();
    $plan = Plan::whereRaw('LOWER(name) = ?', [$user->plan])->first();

    return response()->json([
        'plan'                => $plan,
        'user_plan'           => $user->plan,
        'subscription_status' => $user->subscription_status,
        'current_period_end'  => $user->current_period_end,
    ]);
}
}