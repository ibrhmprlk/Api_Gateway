<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageStat extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'date',
        'request_count',
        'success_count',
        'error_count',
        'cache_hit_count',
        'avg_response_ms',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}