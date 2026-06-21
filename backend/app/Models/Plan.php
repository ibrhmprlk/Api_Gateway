<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Plan extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'rate_limit_per_minute',
        'api_access',
        'price_monthly',
        'stripe_price_id',
    ];

    protected function casts(): array
    {
        return [
            'api_access' => 'array',
            'price_monthly' => 'decimal:2',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class, 'plan', 'name');
    }
}