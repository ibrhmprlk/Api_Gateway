<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Plan;
use App\Models\RequestLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GatewayController extends Controller
{
    public function weather(Request $request)
    {
        $request->validate(['city' => ['required', 'string', 'max:100']]);

        $apiKey = $this->resolveApiKey($request);
        if (!$apiKey) return response()->json(['message' => 'Geçersiz API key.'], 401);
        if (!$this->checkPlanAccess($apiKey, 'weather')) return response()->json(['message' => 'Weather erişimi planınıza dahil değil. Pro\'ya yükseltin.'], 403);

        $city = $request->city;
        $cacheKey = "weather:{$city}";
        $cacheHit = Cache::has($cacheKey);

        $data = Cache::remember($cacheKey, 300, function () use ($city) {
            $response = Http::timeout(15)->get('https://api.openweathermap.org/data/2.5/weather', [
                'q'     => $city,
                'appid' => config('services.openweathermap.key'),
                'units' => 'metric',
                'lang'  => 'tr',
            ]);
            return $response->json();
        });

        $this->logRequest($apiKey, '/gateway/weather', 'GET', 200, $cacheHit);
        return response()->json($data);
    }

    public function exchange(Request $request)
    {
        $request->validate([
            'base'   => ['required', 'string', 'size:3'],
            'target' => ['required', 'string', 'size:3'],
        ]);

        $apiKey = $this->resolveApiKey($request);
        if (!$apiKey) return response()->json(['message' => 'Geçersiz API key.'], 401);
        if (!$this->checkPlanAccess($apiKey, 'exchange')) return response()->json(['message' => 'Exchange erişimi planınıza dahil değil. Pro\'ya yükseltin.'], 403);

        $base     = strtoupper($request->base);
        $target   = strtoupper($request->target);
        $cacheKey = "exchange:{$base}:{$target}";
        $cacheHit = Cache::has($cacheKey);

        $data = Cache::remember($cacheKey, 300, function () use ($base, $target) {
            $response = Http::timeout(15)->get("https://v6.exchangerate-api.com/v6/" . config('services.exchangerate.key') . "/pair/{$base}/{$target}");
            return $response->json();
        });

        $this->logRequest($apiKey, '/gateway/exchange', 'GET', 200, $cacheHit);
        return response()->json($data);
    }

    public function countries(Request $request)
    {
        $request->validate(['name' => ['required', 'string', 'max:100']]);

        $apiKey = $this->resolveApiKey($request);
        if (!$apiKey) return response()->json(['message' => 'Geçersiz API key.'], 401);
        if (!$this->checkPlanAccess($apiKey, 'countries')) return response()->json(['message' => 'Countries erişimi planınıza dahil değil. Pro\'ya yükseltin.'], 403);

        $name     = $request->name;
        $cacheKey = "countries:{$name}";
        $cacheHit = Cache::has($cacheKey);

        $data = Cache::remember($cacheKey, 3600, function () use ($name) {
            $response = Http::timeout(15)->get("https://countriesnow.space/api/v0.1/countries/info", [
                'returns' => 'name,capital,unicodeFlag,currency,dialCode,region,subregion,population,area,flag',
            ]);

            if ($response->failed()) return null;

            $all      = $response->json()['data'] ?? [];
            $filtered = array_values(array_filter($all, fn($c) => stripos($c['name'], $name) !== false));

            return count($filtered) > 0 ? $filtered : null;
        });

        if ($data === null) {
            Cache::forget($cacheKey);
            return response()->json(['error' => 'Ülke bulunamadı', 'message' => 'Geçersiz ülke adı'], 404);
        }

        $this->logRequest($apiKey, '/gateway/countries', 'GET', 200, $cacheHit);
        return response()->json($data);
    }

    private function checkPlanAccess(ApiKey $apiKey, string $feature): bool
    {
        $user = $apiKey->user;
        if (!$user) return false;

        $effectivePlan = ($user->plan === 'pro' && $user->subscription_status === 'active') ? 'pro' : 'free';

        $plan = Plan::whereRaw('LOWER(name) = ?', [$effectivePlan])->first();
        if (!$plan) return false;

        return !empty($plan->api_access[$feature]);
    }

    private function resolveApiKey(Request $request): ?ApiKey
    {
        $keyValue = $request->header('X-API-Key');
        if (!$keyValue) return null;

        $apiKey = ApiKey::where('key', $keyValue)->where('is_active', true)->with('user')->first();
        if (!$apiKey) return null;
        if ($apiKey->expires_at && $apiKey->expires_at->isPast()) return null;

        if (!empty($apiKey->allowed_ips)) {
            if (!in_array($request->ip(), $apiKey->allowed_ips)) return null;
        }

        $apiKey->update(['last_used_at' => now()]);
        return $apiKey;
    }

    private function logRequest(ApiKey $apiKey, string $endpoint, string $method, int $statusCode, bool $cacheHit): void
    {
        RequestLog::create([
            'api_key_id'       => $apiKey->id,
            'user_id'          => $apiKey->user_id,
            'endpoint'         => $endpoint,
            'method'           => $method,
            'status_code'      => $statusCode,
            'cache_hit'        => $cacheHit,
            'ip_address'       => request()->ip(),
            'response_time_ms' => null,
        ]);
    }
}
