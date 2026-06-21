<?php

namespace App\Console\Commands;

use App\Models\RequestLog;
use App\Models\UsageStat;
use App\Models\User;
use Illuminate\Console\Command;

class GenerateUsageStats extends Command
{
    /**
     * Komutun adı ve açıklaması
     * php artisan stats:generate ile çalıştırılabilir
     */
    protected $signature = 'stats:generate {--date= : Hangi gün için oluşturulsun, boşsa dün}';
    protected $description = 'Günlük kullanım istatistiklerini request_logs tablosundan hesaplayıp usage_stats tablosuna yazar';

    /**
     * Her gece çalışır — bir önceki günün loglarını özetler
     * usage_stats tablosu admin panelinde ve
     * developer dashboard'unda grafik için kullanılır
     */
    public function handle(): void
    {
        // Hangi gün için hesaplanacak
        // --date parametresi verilmemişse dünü al
        $date = $this->option('date')
            ? now()->parse($this->option('date'))->toDateString()
            : now()->subDay()->toDateString();

        $this->info("📊 {$date} için istatistikler hesaplanıyor...");

        // Developer rolündeki tüm kullanıcıları al
        // Her kullanıcı için ayrı özet oluşturulacak
        $users = User::where('role', 'developer')->get();

        $count = 0;

        foreach ($users as $user) {

            // O gün bu kullanıcının yaptığı tüm istekleri al
            $logs = RequestLog::where('user_id', $user->id)
                ->whereDate('created_at', $date)
                ->get();

            // O gün hiç istek yoksa kayıt oluşturma
            if ($logs->isEmpty()) {
                continue;
            }

            // İstatistikleri hesapla
            $requestCount  = $logs->count();
            $successCount  = $logs->where('status_code', '>=', 200)
                                  ->where('status_code', '<', 300)
                                  ->count();
            $errorCount    = $logs->where('status_code', '>=', 400)->count();
            $cacheHitCount = $logs->where('cache_hit', true)->count();

            // Ortalama yanıt süresi — null olmayanların ortalaması
            $avgResponseMs = $logs->whereNotNull('response_time_ms')
                                  ->avg('response_time_ms') ?? 0;

            // updateOrCreate — aynı gün için tekrar çalışırsa günceller
            // user_id + date kombinasyonu unique olduğu için çakışmaz
            UsageStat::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'date'    => $date,
                ],
                [
                    'request_count'   => $requestCount,
                    'success_count'   => $successCount,
                    'error_count'     => $errorCount,
                    'cache_hit_count' => $cacheHitCount,
                    'avg_response_ms' => (int) round($avgResponseMs),
                ]
            );

            $count++;
        }

        $this->info("✅ {$count} kullanıcı için istatistikler oluşturuldu.");
    }
}