<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rate Limitiniz Doldu</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #18181b; padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: -0.3px; }
  .header p { color: #a1a1aa; font-size: 13px; margin-top: 4px; }
  .badge { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-top: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
  .body { padding: 32px; }
  .greeting { font-size: 15px; color: #3f3f46; margin-bottom: 16px; }
  .message { font-size: 14px; color: #52525b; line-height: 1.7; margin-bottom: 24px; }
  .info-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
  .info-box p { font-size: 13px; color: #b91c1c; line-height: 1.6; }
  .info-box strong { color: #991b1b; }
  .btn { display: block; text-align: center; background: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 24px; }
  .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
  .footer { padding: 0 32px 32px; text-align: center; }
  .footer p { font-size: 12px; color: #a1a1aa; line-height: 1.6; }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>API Gateway</h1>
        <p>Geliştirici Platformu</p>
        <span class="badge">⚠ Rate Limit Aşıldı</span>
      </div>
      <div class="body">
        <p class="greeting">Merhaba {{ $user->name }},</p>
        <p class="message">
          API key'inizin dakikalık istek limiti doldu. Yeni istekler bir sonraki dakikaya kadar reddedilecek.
        </p>
        <div class="info-box">
          <p>
            <strong>Mevcut Plan:</strong> {{ ucfirst($plan) }}<br>
            <strong>Dakika Limiti:</strong> {{ $limit }} istek/dk<br>
            <strong>Durum:</strong> Limit aşıldı — 429 hatası dönüyor
          </p>
        </div>
        <p class="message">
          Daha yüksek limitlerle kesintisiz çalışmak için Pro plana geçebilirsiniz.
          Pro planda dakikada 600 istek hakkınız olur.
        </p>
        <a href="{{ config('app.frontend_url') }}/billing" class="btn">Pro Plana Geç →</a>
        <hr class="divider">
        <p class="message" style="font-size:13px; color:#71717a;">
          Bu bildirimi almak istemiyorsanız dashboard'unuzdan webhook ayarlarınızı düzenleyebilirsiniz.
        </p>
      </div>
      <div class="footer">
        <p>© {{ date('Y') }} API Gateway. Tüm hakları saklıdır.</p>
      </div>
    </div>
  </div>
</body>
</html>