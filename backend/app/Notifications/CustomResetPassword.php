<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends ResetPassword
{
    protected function resetUrl($notifiable)
    {
        return config('app.frontend_url') . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Şifre Sıfırlama')
            ->line('Bu e-postayı, hesabınız için şifre sıfırlama talebinde bulunulduğu için alıyorsunuz.')
            ->action('Şifremi Sıfırla', $this->resetUrl($notifiable))
            ->line('Bu şifre sıfırlama bağlantısı ' . config('auth.passwords.users.expire') . ' dakika içinde geçerliliğini yitirecektir.')
            ->line('Eğer şifre sıfırlama talebinde bulunmadıysanız, herhangi bir işlem yapmanıza gerek yoktur.');
    }
}