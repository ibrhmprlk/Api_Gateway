<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LimitReachedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $planName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'API limitiniz doldu',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.limit-reached',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}