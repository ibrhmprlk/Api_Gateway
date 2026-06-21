<?php
namespace App\Mail;

use App\Models\User;
use App\Models\Webhook;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WebhookFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Webhook $webhook,
        public int $attempt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Webhook gönderilemedi',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.webhook-failed',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}