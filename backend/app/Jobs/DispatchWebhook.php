<?php

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WebhookLog;
use App\Events\WebhookTriggered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class DispatchWebhook implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 120];

    public function __construct(
        public Webhook $webhook,
        public array $payload,
    ) {}

    public function handle(): void
    {
        $signature = hash_hmac(
            'sha256',
            json_encode($this->payload),
            $this->webhook->secret
        );

        $attempt = $this->attempts();

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type'        => 'application/json',
                    'X-Webhook-Signature' => $signature,
                    'X-Webhook-Event'     => $this->payload['event'],
                ])
                ->post($this->webhook->url, $this->payload);

            WebhookLog::create([
                'webhook_id'  => $this->webhook->id,
                'payload'     => $this->payload,
                'status_code' => $response->status(),
                'success'     => $response->successful(),
                'attempt'     => $attempt,
            ]);

            $this->webhook->update([
                'last_triggered_at' => now(),
            ]);

        } catch (\Exception $e) {
            WebhookLog::create([
                'webhook_id'  => $this->webhook->id,
                'payload'     => $this->payload,
                'status_code' => null,
                'success'     => false,
                'attempt'     => $attempt,
            ]);

            // ✅ Başarısızlık bildirimi
            broadcast(new WebhookTriggered($this->webhook, 'request.failed', $this->webhook->user_id));

            throw $e;
        }
    }
}