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
     *
     * GET /api/keys
     */
    public function index(Request $request)
    {
        $keys = $request->user()
            ->apiKeys()
            ->latest()
            ->get();

        return response()->json($keys);
    }

    /**
     * Yeni API key oluşturur
     * Permissions planına göre otomatik set edilir
     *
     * POST /api/keys
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'allowed_ips' => ['nullable', 'array'],
            'expires_at'  => ['nullable', 'date', 'after:today'],
        ]);

        $user     = $request->user();
        $keyCount = $user->apiKeys()->count();

        if ($user->plan === 'free' && $keyCount >= 3) {
            return response()->json([
                'message' => 'Free planda en fazla 3 API key oluşturabilirsiniz. Pro plana geçin.'
            ], 403);
        }

        $isPro = $user->plan === 'pro' && $user->subscription_status === 'active';

        $permissions = $isPro
            ? ['weather' => true, 'exchange' => true, 'countries' => true]
            : ['weather' => true, 'exchange' => false, 'countries' => false];

        $apiKey = ApiKey::create([
            'user_id'     => $user->id,
            'key'         => 'gw_' . Str::random(40),
            'name'        => $request->name,
            'is_active'   => true,
            'permissions' => $permissions,
            'allowed_ips' => $request->allowed_ips,
            'expires_at'  => $request->expires_at,
        ]);

        return response()->json($apiKey, 201);
    }

    /**
     * Belirli bir key'in detayını gösterir
     *
     * GET /api/keys/{id}
     */
    public function show(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        return response()->json($apiKey);
    }

    /**
     * Key'i günceller
     *
     * PUT /api/keys/{id}
     */
    public function update(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'allowed_ips' => ['sometimes', 'nullable', 'array'],
            'expires_at'  => ['sometimes', 'nullable', 'date'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);

        $apiKey->update($request->only(['name', 'allowed_ips', 'expires_at', 'is_active']));

        return response()->json($apiKey);
    }

    /**
     * Key'i yeniler
     *
     * POST /api/keys/{id}/regenerate
     */
    public function regenerate(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $apiKey->update([
            'key'          => 'gw_' . Str::random(40),
            'last_used_at' => null,
        ]);

        return response()->json([
            'message' => 'API key yenilendi.',
            'api_key' => $apiKey,
        ]);
    }

    /**
     * Key'i siler
     *
     * DELETE /api/keys/{id}
     */
    public function destroy(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $apiKey->delete();

        return response()->json(['message' => 'API key silindi.']);
    }
}
