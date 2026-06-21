<?php
namespace App\Jobs;

use App\Mail\LimitWarningMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendLimitWarningMail implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 120];

    public function __construct(
        public User $user,
        public string $planName,
        public int $usagePercent,
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)
            ->send(new LimitWarningMail(
                user: $this->user,
                planName: $this->planName,
                usagePercent: $this->usagePercent,
            ));
    }
}