<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    /**
     * Kullanıcının tüm API key'lerini listeler
     * Her kullanıcı sadece kendi key'lerini görebilir
     *
     * GET /api/keys
     */
    public function index(Request $request)
    {
        // auth:sanctum middleware'den gelen kullanıcıya ait key'leri getir
        $keys = $request->user()
            ->apiKeys()
            ->latest() // en yeni önce
            ->get();

        return response()->json($keys);
    }

    /**
     * Yeni API key oluşturur
     * Key formatı: gw_ prefix + 40 karakter rastgele string
     * Örnek: gw_xK9mP2qR...
     *
     * POST /api/keys
     */
    public function store(Request $request)
    {
        $request->validate([
            // Key'e kullanıcı tanımlı bir isim verilmeli
            'name' => ['required', 'string', 'max:255'],

            // Hangi API'lere erişim olacak — opsiyonel
            // Örnek: {"weather": true, "exchange": false, "countries": true}
            'permissions' => ['nullable', 'array'],

            // IP kısıtlaması — opsiyonel
            // Örnek: ["192.168.1.1", "10.0.0.1"]
            'allowed_ips' => ['nullable', 'array'],

            // Key'in son kullanım tarihi — opsiyonel
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        // Free plan kullanıcısı en fazla 3 key oluşturabilir
        $keyCount = $request->user()->apiKeys()->count();
        if ($request->user()->plan === 'free' && $keyCount >= 3) {
            return response()->json([
                'message' => 'Free planda en fazla 3 API key oluşturabilirsiniz. Pro plana geçin.'
            ], 403); // 403 = Forbidden
        }

        $apiKey = ApiKey::create([
            'user_id' => $request->user()->id,
            // gw_ prefix ile başlayan benzersiz key üret
            'key' => 'gw_' . Str::random(40),
            'name' => $request->name,
            'is_active' => true,
            // izinler verilmemişse tüm API'lere erişim aç
            'permissions' => $request->permissions ?? [
                'weather' => true,
                'exchange' => true,
                'countries' => true,
            ],
            'allowed_ips' => $request->allowed_ips,
            'expires_at' => $request->expires_at,
        ]);

        return response()->json($apiKey, 201); // 201 = Created
    }

    /**
     * Belirli bir key'in detayını gösterir
     *
     * GET /api/keys/{id}
     */
    public function show(Request $request, ApiKey $apiKey)
    {
        // Başkasının key'ine erişmeye çalışıyorsa engelle
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu işlem için yetkiniz yok.'
            ], 403);
        }

        return response()->json($apiKey);
    }

    /**
     * Key'i günceller
     * İsim, izinler, IP kısıtlaması güncellenebilir
     *
     * PUT /api/keys/{id}
     */
    public function update(Request $request, ApiKey $apiKey)
    {
        // Yetki kontrolü
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu işlem için yetkiniz yok.'
            ], 403);
        }

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'permissions' => ['sometimes', 'array'],
            'allowed_ips' => ['sometimes', 'nullable', 'array'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $apiKey->update($request->only([
            'name', 'permissions', 'allowed_ips', 'expires_at', 'is_active'
        ]));

        return response()->json($apiKey);
    }

    /**
     * Key'i yeniler — eski key geçersiz olur, yeni key üretilir
     * Güvenlik ihlali şüphesi olduğunda kullanılır
     *
     * POST /api/keys/{id}/regenerate
     */
    public function regenerate(Request $request, ApiKey $apiKey)
    {
        // Yetki kontrolü
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu işlem için yetkiniz yok.'
            ], 403);
        }

        // Yeni key üret, eskisinin üzerine yaz
        $apiKey->update([
            'key' => 'gw_' . Str::random(40),
            'last_used_at' => null, // kullanım geçmişini sıfırla
        ]);

        return response()->json([
            'message' => 'API key yenilendi.',
            'api_key' => $apiKey,
        ]);
    }

    /**
     * Key'i siler
     * Silinince o key ile yapılan tüm istekler reddedilir
     *
     * DELETE /api/keys/{id}
     */
    public function destroy(Request $request, ApiKey $apiKey)
    {
        // Yetki kontrolü
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu işlem için yetkiniz yok.'
            ], 403);
        }

        $apiKey->delete();

        return response()->json([
            'message' => 'API key silindi.'
        ]);
    }
}