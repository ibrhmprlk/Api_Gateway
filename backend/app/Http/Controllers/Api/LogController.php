<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestLog;
use App\Models\UsageStat;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Kullanıcının istek loglarını listeler
     * Filtreleme yapılabilir: endpoint, status_code, tarih aralığı
     * Sayfalama var — her sayfada 20 kayıt
     *
     * GET /api/logs
     * GET /api/logs?endpoint=/gateway/weather
     * GET /api/logs?status_code=200
     * GET /api/logs?from=2026-01-01&to=2026-12-31
     */
    public function index(Request $request)
    {
        $query = RequestLog::where('user_id', $request->user()->id)
            ->latest('created_at');

        // Endpoint filtresi — örn: ?endpoint=/gateway/weather
        if ($request->filled('endpoint')) {
            $query->where('endpoint', $request->endpoint);
        }

        // Status code filtresi — örn: ?status_code=429
        if ($request->filled('status_code')) {
            $query->where('status_code', $request->status_code);
        }

        // Tarih aralığı filtresi
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        // Cache hit filtresi — sadece cache'den gelenleri göster
        if ($request->filled('cache_hit')) {
            $query->where('cache_hit', (bool) $request->cache_hit);
        }

        // Sayfalama — her sayfada 20 kayıt
        return response()->json(
            $query->paginate(20)
        );
    }

    /**
     * Kullanıcının günlük kullanım istatistiklerini döndürür
     * usage_stats tablosundan gelir — her gece scheduled job doldurur
     * Dashboard'daki grafik bu veriyi kullanır
     *
     * GET /api/logs/stats
     * GET /api/logs/stats?days=30
     */
    public function stats(Request $request)
    {
        // Kaç günlük veri istendiği — varsayılan 30 gün
        $days = $request->get('days', 30);

        $stats = UsageStat::where('user_id', $request->user()->id)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        // Özet istatistikler — toplam, başarı oranı vs.
        $summary = [
            'total_requests'  => $stats->sum('request_count'),
            'total_success'   => $stats->sum('success_count'),
            'total_errors'    => $stats->sum('error_count'),
            'total_cache_hits'=> $stats->sum('cache_hit_count'),
            // Başarı oranı — toplam istek 0 ise sıfıra bölme hatası almamak için kontrol
            'success_rate'    => $stats->sum('request_count') > 0
                ? round(($stats->sum('success_count') / $stats->sum('request_count')) * 100, 2)
                : 0,
        ];

        return response()->json([
            'summary' => $summary,
            'daily'   => $stats,
        ]);
    }
}