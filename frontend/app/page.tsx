"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Zap,
  Key,
  BarChart3,
  Webhook,
  Globe,
  ArrowRight,
  Check,
  Lock,
} from "lucide-react";
import api from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  rate_limit_per_minute: number;
  price_monthly: string;
  api_access: Record<string, boolean>;
  stripe_price_id: string | null;
}

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api
      .get("/plans")
      .then((res) => setPlans(res.data))
      .catch(() => {});
  }, []);

  const freePlan = plans.find((p) => p.name.toLowerCase() === "free");
  const proPlan = plans.find((p) => p.name.toLowerCase() === "pro");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800/50 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">API Gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6">
          <Zap className="w-3 h-3" />
          Hız limiti, webhooklar ve gerçek zamanlı analitik
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          API'leriniz için
          <br />
          <span className="text-indigo-400">tam kontrol</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          API anahtarlarını yönetin, kullanımı gerçek zamanlı izleyin, hız
          limitleri belirleyin ve webhook bildirimleri alın — hepsi tek bir
          platformda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ücretsiz Başla
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hero code snippet */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-xs text-zinc-500">terminal</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-1">
              <div>
                <span className="text-zinc-500">$</span>{" "}
                <span className="text-emerald-400">curl</span>{" "}
                <span className="text-zinc-300">
                  https://api.yourdomain.com/gateway/weather
                </span>
              </div>
              <div>
                <span className="text-zinc-500">&nbsp;&nbsp;</span>
                <span className="text-amber-400">-H</span>{" "}
                <span className="text-blue-400">
                  &quot;X-API-Key: gw_your_key_here&quot;
                </span>
              </div>
              <div className="mt-2 text-zinc-500">
                # Yanıt: 200 OK — Redis'te önbelleklendi ⚡
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            İhtiyacınız Olan Her Şey
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Laravel, Next.js ve Redis ile oluşturulmuş eksiksiz bir API yönetim
            platformu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <f.icon className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Basit Fiyatlandırma
          </h2>
          <p className="text-zinc-500">
            Ücretsiz başlayın, ihtiyacınız olduğunda yükseltin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Ücretsiz */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Ücretsiz</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  $
                  {freePlan
                    ? Number(freePlan.price_monthly).toFixed(2)
                    : "0.00"}
                </span>
                <span className="text-zinc-500 text-sm ml-1">/ ay</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {freePlan ? (
                <>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {freePlan.rate_limit_per_minute} istek / dakika
                  </li>
                  {Object.entries(freePlan.api_access || {}).map(
                    ([key, enabled]) => (
                      <li
                        key={key}
                        className="flex items-center gap-2 text-sm text-zinc-400"
                      >
                        <Check
                          className={`w-4 h-4 shrink-0 ${enabled ? "text-emerald-400" : "text-zinc-600"}`}
                        />
                        <span className={enabled ? "" : "text-zinc-600"}>
                          {key}
                        </span>
                      </li>
                    ),
                  )}
                </>
              ) : (
                freePlanFallback.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-zinc-400"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/register"
              className="block text-center border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-6 relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium">
                Popüler
              </span>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-indigo-300">Pro</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  ${proPlan ? Number(proPlan.price_monthly).toFixed(2) : "9.99"}
                </span>
                <span className="text-zinc-500 text-sm ml-1">/ ay</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {proPlan ? (
                <>
                  <li className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    {proPlan.rate_limit_per_minute} istek / dakika
                  </li>
                  {Object.entries(proPlan.api_access || {}).map(
                    ([key, enabled]) => (
                      <li
                        key={key}
                        className="flex items-center gap-2 text-sm text-zinc-400"
                      >
                        <Check
                          className={`w-4 h-4 shrink-0 ${enabled ? "text-indigo-400" : "text-zinc-600"}`}
                        />
                        <span className={enabled ? "" : "text-zinc-600"}>
                          {key}
                        </span>
                      </li>
                    ),
                  )}
                </>
              ) : (
                proPlanFallback.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-zinc-400"
                  >
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/register"
              className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Pro ile Başla
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Key,
    title: "API Anahtar Yönetimi",
    desc: "Uç nokta bazında izinler ve IP beyaz listesi ile API anahtarları oluşturun, döndürün ve iptal edin.",
  },
  {
    icon: Zap,
    title: "Hız Limiti",
    desc: "API'lerinizi dakika başı hız limitleri ile koruyun. Yüksek performans için Redis destekli.",
  },
  {
    icon: BarChart3,
    title: "Gerçek Zamanlı Analitik",
    desc: "İstekleri, yanıt sürelerini, önbellek isabetlerini ve hata oranlarını gerçek zamanlı izleyin.",
  },
  {
    icon: Webhook,
    title: "Webhook Bildirimleri",
    desc: "Hız limitlerine ulaşıldığında veya istekler başarısız olduğunda bildirim alın. Güvenlik için HMAC imzalı.",
  },
  {
    icon: Globe,
    title: "Harici API Proxy",
    desc: "Hava durumu, döviz ve ülke verisi API'lerini dahili Redis önbellekleme ile proxy edin.",
  },
  {
    icon: Lock,
    title: "Varsayılan Olarak Güvenli",
    desc: "Google OAuth, Sanctum token kimlik doğrulama, IP beyaz listesi ve HMAC webhook imzaları.",
  },
];

// API çağrısı başarısız olursa gösterilecek fallback veriler
const freePlanFallback = [
  "60 istek / dakika",
  "Hava durumu API erişimi",
  "İstek kayıtları",
  "Webhook bildirimleri",
];

const proPlanFallback = [
  "600 istek / dakika",
  "Tüm API'lere erişim",
  "Gelişmiş analitik",
  "Öncelikli destek",
  "Stripe fatura yönetimi",
];
