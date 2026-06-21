<?php
namespace App\Jobs;

use App\Mail\WebhookFailedMail;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendWebhookFailedMail implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 120];

    public function __construct(
        public User $user,
        public Webhook $webhook,
        public int $attempt,
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)
            ->send(new WebhookFailedMail(
                user: $this->user,
                webhook: $this->webhook,
                attempt: $this->attempt,
            ));
    }
}