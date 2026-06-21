<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIpWhitelist
{
    public function handle(Request $request, Closure $next): Response
    {
        // CheckRateLimit'ten gelen API key'i al — DB sorgusu yok
        $apiKey = $request->attributes->get('api_key');

        // allowed_ips boşsa herkese izin ver
        if (empty($apiKey->allowed_ips)) {
            return $next($request);
        }

        // İsteği yapan IP listede var mı
        if (!in_array($request->ip(), $apiKey->allowed_ips)) {
            return response()->json([
                'message' => 'Bu IP adresinden erişim izniniz yok.',
                'ip'      => $request->ip(),
            ], 403);
        }

        return $next($request);
    }
}