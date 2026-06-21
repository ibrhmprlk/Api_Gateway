<?php
namespace App\Jobs;

use App\Mail\PlanUpgradeMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendPlanUpgradeMail implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [60, 120];

    public function __construct(
        public User $user,
        public string $newPlan,
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)
            ->send(new PlanUpgradeMail(
                user: $this->user,
                newPlan: $this->newPlan,
            ));
    }
}