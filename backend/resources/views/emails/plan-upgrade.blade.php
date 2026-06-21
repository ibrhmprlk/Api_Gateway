<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pro Plana Geçtiniz</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #18181b; padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 20px; font-weight: 600; }
  .header p { color: #a1a1aa; font-size: 13px; margin-top: 4px; }
  .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-top: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
  .body { padding: 32px; }
  .greeting { font-size: 15px; color: #3f3f46; margin-bottom: 16px; }
  .message { font-size: 14px; color: #52525b; line-height: 1.7; margin-bottom: 24px; }
  .features { background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .features p { font-size: 13px; color: #3f3f46; font-weight: 600; margin-bottom: 12px; }
  .feature-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #52525b; margin-bottom: 8px; }
  .feature-item::before { content: "✓"; color: #22c55e; font-weight: 700; }
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
        <span class="badge">🎉 Pro Plan Aktif</span>
      </div>
      <div class="body">
        <p class="greeting">Merhaba {{ $user->name }},</p>
        <p class="message">
          Pro plana geçişiniz başarıyla tamamlandı. Artık tüm Pro özelliklerinden yararlanabilirsiniz.
        </p>
        <div class="features">
          <p>Pro Plan Avantajları</p>
          <div class="feature-item">Dakikada 600 API isteği</div>
          <div class="feature-item">Tüm API'lere erişim</div>
          <div class="feature-item">Sınırsız webhook</div>
          <div class="feature-item">Öncelikli destek</div>
        </div>
        <a href="{{ config('app.frontend_url') }}/dashboard" class="btn">Dashboard'a Git →</a>
      </div>
      <div class="footer">
        <p>© {{ date('Y') }} API Gateway.</p>
      </div>
    </div>
  </div>
</body>
</html>