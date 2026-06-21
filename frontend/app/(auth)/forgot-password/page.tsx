"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck, Globe } from "lucide-react"; // Chrome
import api, { extractApiError } from "@/lib/api";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = "idle" | "sent" | "google_user";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/forgot-password", { email });
      setState("sent");
    } catch (err: any) {
      // Laravel backend Google kullanıcısı için özel mesaj döner
      const msg: string = err?.response?.data?.message ?? "";
      if (
        err?.response?.status === 422 &&
        msg.toLowerCase().includes("google")
      ) {
        setState("google_user");
      } else {
        setError(extractApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Google kullanıcısı uyarısı ────────────────────────────────────────────
  if (state === "google_user") {
    return (
      <AuthLayout title="Google account detected" description="">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Globe className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm text-zinc-300 font-medium">
                Bu hesap Google oturum açma özelliğini kullanıyor.
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                <span className="text-white">{email}</span> Google'a
                kayıtlıydınız. Google hesabınızın şifresini sıfırlayamazsınız —
                lütfen bunun yerine Google ile oturum açın.
              </p>
            </div>
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/auth/google/redirect`}
          >
            <Button className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-medium flex items-center gap-2">
              <GoogleIcon />
              Google ile devam et
            </Button>
          </a>

          <p className="text-center text-sm text-zinc-500">
            <button
              onClick={() => {
                setState("idle");
                setEmail("");
              }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Farklı bir e-posta deneyin
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── Mail gönderildi ───────────────────────────────────────────────────────
  if (state === "sent") {
    return (
      <AuthLayout title="Check your email" description="">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/15 flex items-center justify-center">
              <MailCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm text-zinc-400 text-center leading-relaxed">
              Sıfırlama bağlantısı gönderdik.{" "}
              <span className="text-white font-medium">{email}</span>. Gelen
              kutunuzu kontrol edin ve talimatları izleyin.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={() => setState("idle")}
          >
            Farklı bir e-posta deneyin
          </Button>

          <p className="text-center text-sm text-zinc-500">
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Oturum açmak için geri dön
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── Ana form ──────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Parolanızı mı unuttunuz?"
      description="E-posta adresinizi girin, size sıfırlama bağlantısı göndereceğiz. 
      ⚠️TEST MODU: Reset emailleri Mailtrap Sandbox'a düşmektedir."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-300 text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
          />
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            "Sıfırlama Bağlantısını Gönder"
          )}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Oturum açmak için geri dön
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
