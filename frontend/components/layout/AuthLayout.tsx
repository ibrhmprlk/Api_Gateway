"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sol panel — sadece büyük ekranda görünür */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            API Gateway
          </span>
        </Link>

        {/* Orta içerik */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
              Güvenli · Hızlı · Güvenilir
            </p>
            <h2 className="text-3xl font-bold text-white leading-snug">
              API katmanınız,
              <br />
              tam kontrolünüzde.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              API anahtarlarınızı yönetin, kullanımı gerçek zamanlı takip edin
              ve harici API'lere bağlanın — hepsi tek bir panelden.
            </p>
          </div>

          {/* Stat kartları */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "İstek / gün", value: "2.4M+" },
              { label: "Çalışma süresi", value: "99.9%" },
              { label: "Ort. gecikme", value: "38ms" },
              { label: "Aktif key", value: "12K+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50"
              >
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alt */}
        <p className="text-zinc-600 text-xs">
          © {new Date().getFullYear()} API Gateway. Tüm hakları saklıdır.
        </p>
      </div>

      {/* Sağ panel — form alanı */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Mobilde logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            API Gateway
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-zinc-400 text-sm mt-1">{description}</p>
            )}
          </div>

          {/* Form içeriği */}
          {children}
        </div>
      </div>
    </div>
  );
}
