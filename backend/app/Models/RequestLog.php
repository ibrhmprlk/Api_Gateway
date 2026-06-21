<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'api_key_id',
        'user_id',
        'endpoint',
        'method',
        'status_code',
        'response_time_ms',
        'ip_address',
        'cache_hit',
    ];

    protected function casts(): array
    {
        return [
            'cache_hit' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class);
    }
}