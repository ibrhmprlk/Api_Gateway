<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanCancelMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $planName,
        public string $periodEnd,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aboneliğiniz iptal edildi',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.plan-cancel',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}