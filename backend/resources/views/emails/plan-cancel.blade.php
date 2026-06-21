<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abonelik İptali</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #18181b; padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 20px; font-weight: 600; }
  .header p { color: #a1a1aa; font-size: 13px; margin-top: 4px; }
  .badge { display: inline-block; background: #71717a; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-top: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
  .body { padding: 32px; }
  .greeting { font-size: 15px; color: #3f3f46; margin-bottom: 16px; }
  .message { font-size: 14px; color: #52525b; line-height: 1.7; margin-bottom: 24px; }
  .info-box { background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
  .info-box p { font-size: 13px; color: #52525b; line-height: 1.6; }
  .info-box strong { color: #3f3f46; }
  .btn { display: block; text-align: center; background: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 24px; }
  .footer { padding: 0 32px 32px; text-align: center; }
  .footer p { font-size: 12px; color: #a1a1aa; }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>API Gateway</h1>
        <p>Geliştirici Platformu</p>
        <span class="badge">Abonelik İptal Edildi</span>
      </div>
      <div class="body">
        <p class="greeting">Merhaba {{ $user->name }},</p>
        <p class="message">
          Pro aboneliğiniz iptal edildi. Mevcut dönem sonuna kadar Pro özelliklerini kullanmaya devam edebilirsiniz.
        </p>
        <div class="info-box">
          <p>
            <strong>İptal Tarihi:</strong> {{ $user->canceled_at->format('d.m.Y') }}<br>
            <strong>Erişim Sona Erme:</strong> {{ $user->current_period_end?->format('d.m.Y') ?? 'Dönem sonu' }}<br>
            <strong>Sonraki Plan:</strong> Free
          </p>
        </div>
        <p class="message">
          Fikrinizi değiştirirseniz dönem bitmeden tekrar Pro plana geçebilirsiniz.
        </p>
        <a href="{{ config('app.frontend_url') }}/billing" class="btn">Aboneliği Yenile →</a>
      </div>
      <div class="footer">
        <p>© {{ date('Y') }} API Gateway.</p>
      </div>
    </div>
  </div>
</body>
</html>