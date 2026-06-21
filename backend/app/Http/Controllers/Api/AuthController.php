<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'E-posta veya şifre hatalı.'], 401);
        }

        if ($user->isGoogleUser()) {
            return response()->json(['message' => 'Bu hesap Google ile oluşturulmuştur. Google ile giriş yapın.'], 422);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'       => $user,
            'token'      => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([
            'name'                => $request->name,
            'email'               => $request->email,
            'password'            => Hash::make($request->password),
            'role'                => 'developer',
            'plan'                => 'free',
            'subscription_status' => 'active',
            'auth_provider'       => 'local',
        ]);

        ApiKey::create([
            'user_id'     => $user->id,
            'key'         => 'gw_' . Str::random(40),
            'name'        => 'Default Key',
            'is_active'   => true,
            'permissions' => ['weather' => true, 'exchange' => true, 'countries' => true],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'       => $user,
            'token'      => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Başarıyla çıkış yapıldı.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function googleRedirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            dd('Socialite hatası: ' . $e->getMessage());
        }

        try {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'auth_provider'     => 'google',
                    'auth_provider_id'  => $googleUser->getId(),
                   'email_verified_at' => now(),
                ]);
            } else {
                $user = User::create([
                    'name'                => $googleUser->getName(),
                    'email'               => $googleUser->getEmail(),
                    'password'            => null,
                    'role'                => 'developer',
                    'plan'                => 'free',
                    'subscription_status' => 'active',
                    'auth_provider'       => 'google',
                    'auth_provider_id'    => $googleUser->getId(),
                    'email_verified_at'   => now(),
                ]);

                ApiKey::create([
                    'user_id'     => $user->id,
                    'key'         => 'gw_' . Str::random(40),
                    'name'        => 'Default Key',
                    'is_active'   => true,
                    'permissions' => ['weather' => true, 'exchange' => true, 'countries' => true],
                ]);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect(config('app.frontend_url') . '/auth/callback?token=' . $token);

        } catch (\Exception $e) {
            dd('DB hatası: ' . $e->getMessage());
        }
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.']);
        }

        if ($user->isGoogleUser()) {
            return response()->json(['message' => 'Bu hesap Google ile oluşturulmuştur. Google ile giriş yapın.'], 422);
        }

        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->update(['password' => Hash::make($password)]);
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Şifreniz başarıyla sıfırlandı.']);
        }

        return response()->json(['message' => 'Geçersiz token veya e-posta adresi.'], 422);
    }
}