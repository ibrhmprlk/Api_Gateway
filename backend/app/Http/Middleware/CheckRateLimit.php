<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\RequestLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckRateLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $keyValue = $request->header('X-API-Key');

        if (!$keyValue) {
            return response()->json([
                'message' => 'API key gerekli. Header\'a X-API-Key ekleyin.'
            ], 401);
        }

        $apiKey = ApiKey::where('key', $keyValue)
            ->where('is_active', true)
            ->first();

        if (!$apiKey) {
            return response()->json([
                'message' => 'Geçersiz veya pasif API key.'
            ], 401);
        }

        // Sonraki middleware'e API key'i taşı — tekrar DB sorgusu atmasın
        $request->attributes->set('api_key', $apiKey);

        $limit = $apiKey->user->getRateLimit();
        $cacheKey = "rate_limit:{$apiKey->id}";
        $requestCount = (int) Cache::get($cacheKey, 0);

        if ($requestCount >= $limit) {
            $this->triggerLimitWebhook($apiKey);

            RequestLog::create([
                'api_key_id'  => $apiKey->id,
                'user_id'     => $apiKey->user_id,
                'endpoint'    => $request->path(),
                'method'      => $request->method(),
                'status_code' => 429,
                'ip_address'  => $request->ip(),
                'cache_hit'   => false,
            ]);

            return response()->json([
                'message'     => 'Rate limit aşıldı. Dakikada ' . $limit . ' istek yapabilirsiniz.',
                'limit'       => $limit,
                'retry_after' => 60,
            ], 429);
        }

        if ($requestCount === 0) {
            Cache::put($cacheKey, 1, 60);
        } else {
            Cache::increment($cacheKey);
        }

        return $next($request);
    }

    private function triggerLimitWebhook(ApiKey $apiKey): void
    {
        $webhooks = $apiKey->user
            ->webhooks()
            ->where('event', 'limit_reached')
            ->where('is_active', true)
            ->get();

        foreach ($webhooks as $webhook) {
            \App\Jobs\DispatchWebhook::dispatch($webhook, [
                'event'      => 'limit_reached',
                'api_key_id' => $apiKey->id,
                'message'    => 'Rate limitiniz doldu.',
                'timestamp'  => now()->toISOString(),
            ]);
        }
    }
}