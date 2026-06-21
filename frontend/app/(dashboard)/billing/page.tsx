"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  AlertTriangle,
  Crown,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Ban,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api, { extractApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  rate_limit_per_minute: number;
  price_monthly: string;
  api_access: Record<string, boolean>;
  stripe_price_id: string | null;
}

interface BillingInfo {
  plan: Plan | null;
  user_plan: "free" | "pro";
  subscription_status: "active" | "canceled" | "past_due" | null;
  current_period_end: string | null;
  canceled_at: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.token);

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const hasHandledRedirect = useRef(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  async function loadData() {
    try {
      const [billingRes, plansRes] = await Promise.all([
        api.get("/plans/current"),
        api.get("/plans"),
      ]);
      setBilling(billingRes.data);
      setPlans(plansRes.data);
    } catch {
      toast.error("Veriler yüklenemedi");
    }
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (hasHandledRedirect.current) return;
    if (!success && !canceled) return;
    hasHandledRedirect.current = true;
    window.history.replaceState({}, "", "/billing");
    if (success === "true") {
      toast.success("Ödemeniz başarıyla tamamlandı! Pro plana geçtiniz.");
      loadData();
    }
    if (canceled === "true") {
      toast.info("Ödeme işlemi iptal edildi.");
    }
  }, [success, canceled]);

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await api.post("/billing/checkout");
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error(extractApiError(err));
      setCheckoutLoading(false);
    }
  }

  async function handleReactivate() {
    setReactivateLoading(true);
    try {
      const res = await api.post("/billing/reactivate");
      toast.success(res.data.message);
      await loadData();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setReactivateLoading(false);
    }
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const res = await api.post("/billing/cancel");
      toast.success(res.data.message);
      await loadData();
      setCancelDialogOpen(false);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setCancelLoading(false);
    }
  }

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function StatusBadge({ status }: { status: string | null }) {
    if (!status) return null;
    const configs: Record<string, { label: string; className: string }> = {
      active: {
        label: "Aktif",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      },
      canceled: {
        label: "İptal Edildi",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      past_due: {
        label: "Ödeme Bekliyor",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
      },
    };
    const config = configs[status] || configs.active;
    return (
      <Badge className={config.className}>
        {status === "active" && <Check className="w-3 h-3 mr-1" />}
        {status === "canceled" && <Ban className="w-3 h-3 mr-1" />}
        {status === "past_due" && <AlertTriangle className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    );
  }

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const isPro = billing?.user_plan === "pro";
  const isCanceled = billing?.subscription_status === "canceled";
  const hasActiveSubscription =
    billing?.subscription_status === "active" && isPro;
  const currentPlan = billing?.plan;
  const freePlan = plans.find((p) => p.name.toLowerCase() === "free");
  const proPlan = plans.find((p) => p.name.toLowerCase() === "pro");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Billing</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Planınızı yönetin ve fatura bilgilerinizi görüntüleyin.
        </p>
      </div>

      {/* Mevcut plan özeti */}
      <div
        className={`border rounded-xl p-6 ${isPro ? "bg-gradient-to-br from-indigo-950/50 to-purple-950/30 border-indigo-500/20" : "bg-zinc-900/50 border-zinc-800"}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${isPro ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-500"}`}
            >
              {isPro ? (
                <Crown className="w-7 h-7" />
              ) : (
                <Zap className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white capitalize">
                  {billing?.user_plan || "free"} Plan
                </h2>
                {billing?.subscription_status && (
                  <StatusBadge status={billing.subscription_status} />
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-0.5">
                {isPro
                  ? "Tüm özelliklere sınırsız erişim."
                  : "Temel özelliklerle başlayın."}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-2xl font-bold text-white">
              $
              {currentPlan
                ? Number(currentPlan.price_monthly).toFixed(2)
                : "0.00"}
              <span className="text-sm font-normal text-zinc-500">/ay</span>
            </span>
            {isPro && billing?.current_period_end && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {isCanceled
                  ? `Pro erişimi ${formatDate(billing.current_period_end)} tarihine kadar`
                  : `Sonraki ödeme: ${formatDate(billing.current_period_end)}`}
              </span>
            )}
          </div>
        </div>

        {isPro && (
          <div className="mt-6 pt-6 border-t border-zinc-800/50 flex flex-wrap gap-3">
            {isCanceled ? (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-amber-400">
                  Aboneliğiniz dönem sonunda iptal edilecek.
                </span>
                <Button
                  onClick={handleReactivate}
                  disabled={reactivateLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                >
                  {reactivateLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yeniden Aktifleştir
                    </>
                  )}
                </Button>
              </div>
            ) : hasActiveSubscription ? (
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                className="border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
              >
                <Ban className="w-4 h-4 mr-2" />
                Aboneliği İptal Et
              </Button>
            ) : (
              <span className="text-sm text-zinc-500">
                Abonelik durumunuz güncelleniyor...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Plan kartları */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Free Plan */}
        <div
          className={`border rounded-xl p-6 ${!isPro ? "bg-zinc-900/50 border-zinc-700" : "bg-zinc-900/30 border-zinc-800 opacity-70"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-zinc-500" />
              <h3 className="text-white font-semibold">Free</h3>
            </div>
            {!isPro && (
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                Mevcut Plan
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-white mb-6">
            ${freePlan ? Number(freePlan.price_monthly).toFixed(2) : "0.00"}
            <span className="text-sm font-normal text-zinc-500">/ay</span>
          </p>
          <ul className="space-y-3">
            {freePlan && (
              <>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300">
                    {freePlan.rate_limit_per_minute} istek / dakika
                  </span>
                </li>
                {Object.entries(freePlan.api_access || {}).map(
                  ([api, enabled]) => (
                    <li key={api} className="flex items-center gap-3 text-sm">
                      {enabled ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600 shrink-0" />
                      )}
                      <span
                        className={enabled ? "text-zinc-300" : "text-zinc-600"}
                      >
                        {api}
                      </span>
                    </li>
                  ),
                )}
              </>
            )}
          </ul>
          {!isPro && (
            <div className="mt-6">
              <Button
                disabled
                variant="outline"
                className="w-full border-zinc-700 text-zinc-500 cursor-default"
              >
                <Check className="w-4 h-4 mr-2" />
                Kullanılıyor
              </Button>
            </div>
          )}
        </div>

        {/* Pro Plan */}
        <div
          className={`border rounded-xl p-6 relative overflow-hidden ${isPro ? "bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border-indigo-500/30" : "bg-zinc-900/50 border-zinc-800 hover:border-indigo-500/30 transition-colors"}`}
        >
          {isPro && (
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white font-semibold">Pro</h3>
              </div>
              {isPro && (
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Mevcut Plan
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-white mb-6">
              ${proPlan ? Number(proPlan.price_monthly).toFixed(2) : "9.99"}
              <span className="text-sm font-normal text-zinc-500">/ay</span>
            </p>
            <ul className="space-y-3">
              {proPlan && (
                <>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-zinc-300">
                      {proPlan.rate_limit_per_minute} istek / dakika
                    </span>
                  </li>
                  {Object.entries(proPlan.api_access || {}).map(
                    ([api, enabled]) => (
                      <li key={api} className="flex items-center gap-3 text-sm">
                        {enabled ? (
                          <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-zinc-600 shrink-0" />
                        )}
                        <span
                          className={
                            enabled ? "text-zinc-300" : "text-zinc-600"
                          }
                        >
                          {api}
                        </span>
                      </li>
                    ),
                  )}
                </>
              )}
            </ul>
            {!isPro && (
              <div className="mt-6">
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Pro'ya Yükselt
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Aboneliği İptal Et
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Aboneliğiniz dönem sonuna kadar (
              <strong className="text-zinc-200">
                {formatDate(billing?.current_period_end)}
              </strong>
              ) aktif kalacak. Bu tarihten sonra Free plana düşeceksiniz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Vazgeç
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {cancelLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  İptal Et
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
