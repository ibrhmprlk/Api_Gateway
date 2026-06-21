<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Kullanıcının profil bilgilerini döndürür
     * Next.js profil sayfasında gösterilir
     *
     * GET /api/profile
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Profil bilgilerini günceller
     * İsim ve email güncellenebilir
     * Email değiştirilirse email_verified_at sıfırlanır
     *
     * PUT /api/profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => ['sometimes', 'string', 'max:255'],
            // Email unique olmalı ama mevcut kullanıcı hariç
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        // Email değiştirilmişse doğrulama sıfırla
        if ($request->filled('email') && $request->email !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profil güncellendi.',
            'user'    => $user->fresh(), // güncel veriyi döndür
        ]);
    }

    /**
     * Şifre değiştirir
     * Mevcut şifre doğrulanmadan yeni şifre kabul edilmez
     *
     * PUT /api/profile/password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        // Google kullanıcısının şifresi yok, değiştiremez
        if ($user->auth_provider === 'google') {
            return response()->json([
                'message' => 'Google ile giriş yapan hesaplarda şifre değiştirilemez.'
            ], 422);
        }

        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mevcut şifreniz hatalı.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Şifreniz güncellendi. Lütfen tekrar giriş yapın.'
        ]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        // Google kullanıcısıysa şifre kontrolü yapma, direkt sil
        if ($user->auth_provider !== 'google') {
            $request->validate([
                'password' => ['required', 'string'],
            ]);

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Şifreniz hatalı.'
                ], 422);
            }
        }

        // Kullanıcıya ait ilişkili verileri sil
        $user->apiKeys()->delete();
        $user->webhooks()->delete();

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Hesabınız silindi.'
        ]);
    }
}