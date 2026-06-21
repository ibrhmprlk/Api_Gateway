<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Notifications\CustomResetPassword;
class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;
   public function sendPasswordResetNotification($token): void
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * Check if user registered with Google
     */
  
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'plan',
        'subscription_status',
        'current_period_end',
        'canceled_at',
        'stripe_customer_id',
        // Google OAuth için eklendi
        'auth_provider',
        'auth_provider_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'current_period_end' => 'datetime',
            'canceled_at'        => 'datetime',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

    public function requestLogs()
    {
        return $this->hasMany(RequestLog::class);
    }

    public function usageStats()
    {
        return $this->hasMany(UsageStat::class);
    }

    public function webhooks()
    {
        return $this->hasMany(Webhook::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPro(): bool
    {
        return $this->plan === 'pro';
    }
public function getRateLimit(): int
{
    $plan = \App\Models\Plan::whereRaw('LOWER(name) = ?', [$this->plan ?? 'free'])->first();
    return $plan?->rate_limit_per_minute ?? 60;
}

    // Google ile kayıt olan kullanıcının şifresi yoktur
    public function isGoogleUser(): bool
    {
        return $this->auth_provider === 'google';
    }

    // Şifre sıfırlama sadece local kayıtlı kullanıcılara açık
    public function canResetPassword(): bool
    {
        return $this->auth_provider === 'local';
    }
}