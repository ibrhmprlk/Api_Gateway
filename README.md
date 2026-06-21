<div align="center">

# 🔐 API Gateway

**A full-stack SaaS platform for secure API key management, usage tracking, and subscription billing.**

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

---

🇬🇧 [English](#-english) &nbsp;|&nbsp; 🇹🇷 [Türkçe](#-türkçe)

</div>

---

## 🇬🇧 English

### What is this?

API Gateway is a full-stack SaaS platform where developers can register, obtain API keys automatically, access third-party services (weather, exchange rates, countries) through a unified gateway, monitor usage in real time, and manage their subscription plan. Admins have a separate panel for user management, plan configuration, and platform-wide analytics.

---

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, PHP 8.3 |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Database | PostgreSQL 16 (Supabase) |
| Cache & Queue | Redis, Laravel Queue |
| Real-time | Pusher + Laravel Echo |
| Payments | Stripe API (test mode) |
| Auth | Laravel Sanctum + Google OAuth (Socialite) |
| Documentation | Swagger / OpenAPI |
| Local Dev | Docker + Compose, Nginx |
| Deployment | Render.com (API) + Netlify (Frontend) |

---

### Architecture

```
Browser
  └─ Next.js Frontend (Netlify)
      /  |  /dashboard  |  /keys  |  /logs  |  /webhooks  |  /billing  |  /docs
      │  HTTP/JSON + Bearer token
      ▼
 Laravel API (Render.com)
      Auth | Keys | Gateway | Webhooks | Admin | Billing
       │          │              │              │
       ▼          ▼              ▼              ▼
  Supabase   Redis Cache   Laravel Queue    Pusher
  (PostgreSQL) (responses)  (webhooks/mail) (real-time)
                                  │
                                  ▼
           External APIs — OpenWeatherMap · ExchangeRate · RestCountries
```

---

### Features

#### Developer
- Register and instantly receive an auto-generated API key (`gw_` prefixed)
- Choose Free or Pro plan and pay via Stripe
- Access weather, exchange rate, and country APIs through a single gateway
- Configure per-key endpoint permissions (JSON-based)
- Set IP whitelist restrictions per key
- Rotate or revoke keys at any time
- Define webhook URLs for limit breach and error notifications
- View a real-time usage chart on the dashboard (Pusher + Laravel Echo)
- Filter and inspect request logs by endpoint and status code
- Test any endpoint directly in the browser via the Sandbox page

#### Admin
- List, manage, and suspend developer accounts
- Update plan limits and pricing
- View all request logs across all users
- Inspect daily `usage_stats` summaries
- Revenue and active user analytics
- Control which external APIs are enabled

---

### Core Modules

**API Key Management**
Auto-generated on registration. Supports rotation, revocation, optional expiry, IP whitelist, and per-endpoint JSON permission flags.

**Rate Limiting & Logging**
Laravel throttle middleware enforces per-minute request limits. Every request is written to `request_logs`. Daily summaries are aggregated into `usage_stats`. A `429` response is returned when the limit is exceeded.

**Webhook System**
Developers define their own webhook URLs. Laravel Queue dispatches async POST notifications on limit breach or error. Full delivery log with success/failure history is stored.

**Subscription & Billing**
Free tier: 60 req/min. Pro tier: 600 req/min. Stripe handles payment, with full upgrade, downgrade, and cancellation flows. Tracks `subscription_status` and `current_period_end`.

**Cache Layer**
Redis caches weather and exchange rate responses for 5 minutes. Prevents redundant external API calls. Hit/miss status is logged per request.

**Email Notifications**
All emails are dispatched via Laravel Queue: rate limit warnings, plan change confirmations, webhook failure alerts, and password reset links.

---

### External APIs

| Service | Data |
|---|---|
| OpenWeatherMap | Current weather by city |
| ExchangeRate API | Live currency exchange rates |
| RestCountries | Country information |

All responses cached in Redis (5 min TTL).

---

### Pages

| Route | Description |
|---|---|
| `/` | Landing page — features, pricing, CTA |
| `/register` · `/login` | Authentication (email + Google OAuth) |
| `/forgot-password` · `/reset-password` | Password reset flow |
| `/docs` | Swagger UI — all endpoints documented |
| `/sandbox` | Live API testing with a test key |
| `/dashboard` | Real-time chart, summary stats, recent requests |
| `/keys` | Key list, permissions, IP rules, rotation |
| `/logs` | Request history — filter by endpoint and status |
| `/webhooks` | Define URLs, view delivery logs, send test events |
| `/billing` | Plan selection, Stripe checkout, subscription management |
| `/settings` | Profile and password management |
| `/admin/users` | User list, plan changes, suspension |
| `/admin/stats` | Usage summaries, revenue, active users |
| `/admin/logs` | All users' request logs |
| `/admin/plans` | Edit plan limits and pricing |

---

### Database Tables

`users` · `api_keys` · `request_logs` · `usage_stats` · `webhooks` · `webhook_logs` · `plans`

---

### Local Development

```bash
# 1. Clone
git clone https://github.com/your-username/api-gateway.git
cd api-gateway

# 2. Start Docker services
docker compose up -d

# 3. Backend setup
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan queue:work

# 4. Frontend setup
cd ../frontend
npm install
npm run dev
```

---

### Environment Variables

```env
# App
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database — Supabase → Settings → Database
DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=postgres
DB_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Stripe — dashboard.stripe.com → Developers → API Keys
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pusher — pusher.com → App Keys
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=eu

# Google OAuth — console.cloud.google.com → Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# External APIs
OPENWEATHER_API_KEY=       # openweathermap.org
EXCHANGERATE_API_KEY=      # exchangerate-api.com

# Mail — mailtrap.io (sandbox) or any SMTP in production
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

---

### License

MIT

---

<br>

## 🇹🇷 Türkçe

### Bu Nedir?

API Gateway, geliştiricilerin kayıt olup otomatik API key aldığı, hava durumu, döviz kurları ve ülke verilerine tek bir gateway üzerinden güvenli erişim sağladığı, kullanımını gerçek zamanlı takip ettiği ve abonelik planlarını yönettiği full-stack bir SaaS platformudur. Admin paneli üzerinden kullanıcı yönetimi, plan konfigürasyonu ve platform geneli analitik de sağlanmaktadır.

---

### Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | Laravel 11, PHP 8.3 |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Veritabanı | PostgreSQL 16 (Supabase) |
| Cache & Queue | Redis, Laravel Queue |
| Gerçek Zamanlı | Pusher + Laravel Echo |
| Ödeme | Stripe API (test modu) |
| Kimlik Doğrulama | Laravel Sanctum + Google OAuth (Socialite) |
| Dökümantasyon | Swagger / OpenAPI |
| Yerel Geliştirme | Docker + Compose, Nginx |
| Deploy | Render.com (API) + Netlify (Frontend) |

---

### Mimari

```
Tarayıcı
  └─ Next.js Frontend (Netlify)
      /  |  /dashboard  |  /keys  |  /logs  |  /webhooks  |  /billing  |  /docs
      │  HTTP/JSON + Bearer token
      ▼
 Laravel API (Render.com)
      Auth | Keys | Gateway | Webhooks | Admin | Billing
       │          │              │              │
       ▼          ▼              ▼              ▼
  Supabase   Redis Cache   Laravel Queue    Pusher
 (PostgreSQL) (yanıtlar)  (webhook/mail)  (gerçek zamanlı)
                                  │
                                  ▼
       Harici API'ler — OpenWeatherMap · ExchangeRate · RestCountries
```

---

### Özellikler

#### Geliştirici
- Kayıt olunca otomatik API key üretimi (`gw_` önekli UUID)
- Free veya Pro plan seçimi, Stripe ile ödeme
- Hava durumu, döviz ve ülke API'lerine tek gateway üzerinden erişim
- Key bazlı endpoint izin sistemi (JSON tabanlı)
- Key başına IP whitelist tanımlama
- Key yenileme ve iptal
- Webhook URL tanımlama — limit veya hata bildirimlerini al
- Dashboard'da gerçek zamanlı kullanım grafiği (Pusher + Laravel Echo)
- İstek loglarını endpoint ve durum koduna göre filtrele
- Sandbox sayfasında test key ile API'leri tarayıcıdan dene

#### Admin
- Geliştirici hesaplarını listele, yönet, askıya al
- Plan limitlerini ve fiyatlandırmayı güncelle
- Tüm kullanıcıların request loglarını görüntüle
- Günlük `usage_stats` özetlerini incele
- Gelir ve aktif kullanıcı analitiği
- Hangi harici API'lerin aktif olduğunu yönet

---

### Temel Modüller

**API Key Yönetimi**
Kayıtta otomatik üretilir. Yenileme, iptal, opsiyonel son kullanma tarihi, IP whitelist ve endpoint bazlı JSON izin flagleri desteklenir.

**Rate Limiting & Loglama**
Laravel throttle middleware dakika bazlı istek limitini uygular. Her istek `request_logs` tablosuna yazılır. Günlük özetler `usage_stats` tablosuna aktarılır. Limit aşımında `429` yanıtı döner.

**Webhook Sistemi**
Geliştirici kendi webhook URL'ini tanımlar. Laravel Queue, limit dolduğunda veya hata oluştuğunda asenkron POST bildirimi gönderir. Teslim geçmişi (başarı/hata) loglanır.

**Abonelik & Ödeme**
Free: 60 istek/dk. Pro: 600 istek/dk. Stripe ile ödeme alınır; yükseltme, düşürme ve iptal akışları tam olarak desteklenir. `subscription_status` ve `current_period_end` takip edilir.

**Cache Katmanı**
Redis, hava durumu ve döviz kuru yanıtlarını 5 dakika cache'ler. Gereksiz harici API çağrılarını engeller. Her istekte hit/miss durumu loglanır.

**Email Bildirimleri**
Tüm emailler Laravel Queue ile asenkron gönderilir: limit uyarısı, plan değişikliği onayı, webhook hata bildirimi, şifre sıfırlama.

---

### Harici API'ler

| Servis | Veri |
|---|---|
| OpenWeatherMap | Şehre göre anlık hava durumu |
| ExchangeRate API | Canlı döviz kurları |
| RestCountries | Ülke bilgileri |

Tüm yanıtlar Redis'te cache'lenir (5 dk TTL).

---

### Sayfalar

| Rota | Açıklama |
|---|---|
| `/` | Landing — özellikler, planlar, CTA |
| `/register` · `/login` | Kimlik doğrulama (email + Google OAuth) |
| `/forgot-password` · `/reset-password` | Şifre sıfırlama akışı |
| `/docs` | Swagger UI — tüm endpointler dökümante edilmiş |
| `/sandbox` | Test key ile canlı API testi |
| `/dashboard` | Gerçek zamanlı grafik, özet istatistikler, son istekler |
| `/keys` | Key listesi, izinler, IP kuralları, yenileme |
| `/logs` | İstek geçmişi — endpoint ve durum koduna göre filtre |
| `/webhooks` | URL tanımla, teslim logları, test eventi gönder |
| `/billing` | Plan seçimi, Stripe ödeme, abonelik yönetimi |
| `/settings` | Profil ve şifre yönetimi |
| `/admin/users` | Kullanıcı listesi, plan güncelleme, askıya alma |
| `/admin/stats` | Kullanım özetleri, gelir, aktif kullanıcılar |
| `/admin/logs` | Tüm kullanıcıların istek logları |
| `/admin/plans` | Plan limitlerini ve fiyatları düzenle |

---

### Veritabanı Tabloları

`users` · `api_keys` · `request_logs` · `usage_stats` · `webhooks` · `webhook_logs` · `plans`

---

### Yerel Geliştirme

```bash
# 1. Klonla
git clone https://github.com/your-username/api-gateway.git
cd api-gateway

# 2. Docker servislerini başlat
docker compose up -d

# 3. Backend kurulumu
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan queue:work

# 4. Frontend kurulumu
cd ../frontend
npm install
npm run dev
```

---

### Ortam Değişkenleri

```env
# Uygulama
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Veritabanı — Supabase → Settings → Database
DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=postgres
DB_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Stripe — dashboard.stripe.com → Developers → API Keys
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pusher — pusher.com → App Keys
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=eu

# Google OAuth — console.cloud.google.com → Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Harici API'ler
OPENWEATHER_API_KEY=       # openweathermap.org
EXCHANGERATE_API_KEY=      # exchangerate-api.com

# Mail — geliştirmede Mailtrap, prodüksiyonda gerçek SMTP
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

---

### Lisans

MIT
