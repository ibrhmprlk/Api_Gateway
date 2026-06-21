<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Plan;
use App\Models\RequestLog;
use App\Models\UsageStat;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $user = auth()->user();

        // Toplam istek (tüm zamanlar)
        $totalRequests = RequestLog::where('user_id', $user->id)->count();

        // Bugünkü istekler
        $todayRequests = RequestLog::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        // Aktif API key sayısı
        $activeKeys = ApiKey::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        // Toplam key sayısı
        $totalKeys = ApiKey::where('user_id', $user->id)->count();

        // Plan bilgisi — plans tablosundan çek
       $plan = Plan::whereRaw('LOWER(name) = ?', [$user->plan ?? 'free'])->first();
        $planLimit = $plan?->rate_limit_per_minute ?? 60;

        // Son 7 gün günlük istek sayısı (grafik için)
        $dailyStats = RequestLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => (int) $item->count,
            ]);

        // Son 7 günü doldur (veri yoksa 0)
        $chartData = collect(range(6, 0))->map(function ($daysAgo) use ($dailyStats) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');
            $stat = $dailyStats->firstWhere('date', $date);
            return [
                'date' => $date,
                'count' => $stat ? $stat['count'] : 0,
            ];
        });

        // Son 30 günlük usage_stats (varsa)
        $usageStats = UsageStat::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30))
            ->orderBy('date')
            ->get(['date', 'request_count', 'success_count', 'error_count']);

        return response()->json([
            'total_requests' => $totalRequests,
            'today_requests' => $todayRequests,
            'active_keys' => $activeKeys,
            'total_keys' => $totalKeys,
            'plan' => $user->plan ?? 'free',
            'plan_limit' => $planLimit,
            'subscription_status' => $user->subscription_status,
            'chart_data' => $chartData,
            'usage_stats' => $usageStats,
        ]);
    }

    public function recentLogs(): JsonResponse
    {
        $user = auth()->user();

        $logs = RequestLog::where('user_id', $user->id)
            ->with('apiKey:id,name')
            ->latest()
            ->limit(10)
            ->get([
                'id',
                'api_key_id',
                'endpoint',
                'method',
                'status_code',
                'response_time_ms',
                'created_at',
            ]);

        return response()->json($logs);
    }
}