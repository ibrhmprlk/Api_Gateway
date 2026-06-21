<?php
namespace App\Jobs;

use App\Mail\LimitReachedMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendLimitReachedMail implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 120];

    public function __construct(
        public User $user,
        public string $planName,
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)
            ->send(new LimitReachedMail(
                user: $this->user,
                planName: $this->planName,
            ));
    }
}