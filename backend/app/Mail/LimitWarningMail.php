<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LimitWarningMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $planName,
        public int $usagePercent,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "API limitinizin %{$this->usagePercent}'ini kullandınız",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.limit-warning',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}