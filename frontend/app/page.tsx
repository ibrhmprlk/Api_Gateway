"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Key,
  Zap,
  ArrowUpRight,
  AlertCircle,
  Settings,
  Webhook,
  FileText,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Stats {
  total_requests: number;
  today_requests: number;
  active_keys: number;
  total_keys: number;
  plan: string;
  plan_limit: number;
  subscription_status: string | null;
  chart_data: { date: string; count: number }[];
}

interface Log {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Stats>("/dashboard/stats"),
      api.get<Log[]>("/dashboard/recent-logs"),
    ])
      .then(([s, l]) => {
        setStats(s.data);
        setLogs(l.data);
      })
      .finally(() => setReady(true));
  }, []);

  const usagePercent = stats
    ? Math.min((stats.today_requests / stats.plan_limit) * 100, 100)
    : 0;

  const isPro = stats?.plan === "pro";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Ana Sayfa
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {user?.name ? `Merhaba, ${user.name}` : "Tekrar hoş geldiniz"}
          </p>
        </div>
        <Link
          href="/keys"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Key className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Key</span>
        </Link>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Toplam İstek"
          value={stats?.total_requests ?? 0}
          icon={<Activity className="w-4 h-4" />}
          color="indigo"
          loading={!ready}
        />
        <StatCard
          label="Bugün"
          value={stats?.today_requests ?? 0}
          icon={<Zap className="w-4 h-4" />}
          color="emerald"
          loading={!ready}
        />
        <StatCard
          label="Aktif Key'ler"
          value={stats?.active_keys ?? 0}
          icon={<Key className="w-4 h-4" />}
          color="amber"
          suffix={`/ ${stats?.total_keys ?? 0}`}
          loading={!ready}
        />
        <StatCard
          label="Plan"
          value={(stats?.plan ?? "free").toUpperCase()}
          icon={<AlertCircle className="w-4 h-4" />}
          color="purple"
          loading={!ready}
          action={
            !isPro ? (
              <Link
                href="/billing"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Yükselt →
              </Link>
            ) : undefined
          }
        />
      </div>

      {/* Free plan uyarısı */}
      {ready && !isPro && stats && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                Ücretsiz Plan — {stats.plan_limit} Talep/Dakika
              </p>
              <p className="text-xs text-amber-500/70 mt-0.5">
                Dakikada 600 istek işleme ve öncelikli destek için Pro sürüme
                yükseltin.
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 text-center"
          >
            Pro'ya yükseltin
          </Link>
        </div>
      )}

      {/* Usage bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">
            Bugünkü Toplam İstek
          </span>
          <span className="text-sm text-zinc-500">
            {stats?.today_requests ?? 0} / {stats?.plan_limit ?? 60} istek
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
              usagePercent >= 95
                ? "bg-red-500"
                : usagePercent >= 80
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{
              width: ready ? `${usagePercent}%` : "0%",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-zinc-600">
            Dakika başı limit: {stats?.plan_limit ?? 60} istek
          </p>
          <p className="text-xs text-zinc-500 font-medium">
            %{Math.round(usagePercent)}
          </p>
        </div>
      </div>

      {/* Hızlı linkler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink
          href="/keys"
          icon={<Key className="w-5 h-5" />}
          label="API Key'ler"
          desc="Key yönetimi"
        />
        <QuickLink
          href="/logs"
          icon={<FileText className="w-5 h-5" />}
          label="Loglar"
          desc="Geçmişi görüntüle"
        />
        <QuickLink
          href="/webhooks"
          icon={<Webhook className="w-5 h-5" />}
          label="Webhook'lar"
          desc="Bildirimler"
        />
        <QuickLink
          href="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Ayarlar"
          desc="Profil & daha fazlası"
        />
      </div>

      {/* Grafik — Son 7 gün */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Son 7 Gün</h3>
        {ready && stats?.chart_data ? (
          <div className="flex items-end gap-1.5 h-32 md:h-40">
            {stats.chart_data.map((day, i) => {
              const max = Math.max(...stats.chart_data.map((d) => d.count), 1);
              const h = (day.count / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex items-end justify-center h-24 md:h-32">
                    <div
                      className="w-full bg-indigo-500/60 hover:bg-indigo-400 rounded-t transition-all duration-500 cursor-pointer group relative"
                      style={{ height: `${Math.max(h, 3)}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-200 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {day.count}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "narrow",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-32 md:h-40">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-24 md:h-32 flex items-end">
                  <div
                    className="w-full bg-zinc-800 rounded-t animate-pulse"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                </div>
                <div className="w-3 h-2 bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Son istekler tablosu */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Son İstekler</h3>
          <Link
            href="/logs"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
          >
            Tümünü görüntüle <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
                  Uç Nokta
                </th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide w-20">
                  Metot
                </th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide w-20">
                  Durum
                </th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide w-24 hidden sm:table-cell">
                  Gecikme
                </th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide w-24 hidden md:table-cell">
                  Zaman
                </th>
              </tr>
            </thead>
            <tbody>
              {!ready ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/40">
                    <td className="px-4 py-3">
                      <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-48" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-12" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-10" />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-14" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-16" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-zinc-600 text-sm"
                  >
                    Henüz hiçbir istek gelmedi — API anahtarınızı kullanmaya
                    başlayın
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs truncate max-w-[140px] md:max-w-xs">
                      {log.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      <MethodBadge method={log.method} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge code={log.status_code} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                      {log.response_time_ms}ms
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs hidden md:table-cell">
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Alt bileşenler ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color = "indigo",
  suffix,
  action,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "purple";
  suffix?: string;
  action?: React.ReactNode;
  loading?: boolean;
}) {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`p-1.5 rounded-md ${colors[color]}`}>{icon}</span>
        {action}
      </div>
      {loading ? (
        <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse mb-1" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg md:text-xl font-bold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          {suffix && <span className="text-xs text-zinc-600">{suffix}</span>}
        </div>
      )}
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-3 transition-colors group"
    >
      <span className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
          {label}
        </p>
        <p className="text-xs text-zinc-600">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-zinc-500 transition-colors shrink-0" />
    </Link>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-400",
    POST: "bg-blue-500/10 text-blue-400",
    PUT: "bg-amber-500/10 text-amber-400",
    PATCH: "bg-amber-500/10 text-amber-400",
    DELETE: "bg-red-500/10 text-red-400",
  };
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${colors[method] ?? "bg-zinc-700/50 text-zinc-400"}`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const color =
    code < 300
      ? "bg-emerald-500/10 text-emerald-400"
      : code < 400
      ? "bg-amber-500/10 text-amber-400"
      : "bg-red-500/10 text-red-400";
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${color}`}
    >
      {code}
    </span>
  );
}
