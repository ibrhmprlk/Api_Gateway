<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'webhook_id',
        'payload',
        'status_code',
        'success',
        'attempt',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'success' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function webhook()
    {
        return $this->belongsTo(Webhook::class);
    }
}