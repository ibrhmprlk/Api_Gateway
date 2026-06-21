// app/(dashboard)/logs/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ScrollText,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  HardDrive,
  Search,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api, { extractApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Log {
  id: number;
  api_key_id: number;
  user_id: number;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  ip_address: string | null;
  cache_hit: boolean;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface LogsResponse {
  data: Log[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function LogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.token);

  const [logs, setLogs] = useState<Log[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    endpoint: searchParams.get("endpoint") || "",
    status_code: searchParams.get("status_code") || "",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    cache_hit: searchParams.get("cache_hit") || "",
  });

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const fetchLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (filters.endpoint) params.set("endpoint", filters.endpoint);
        if (filters.status_code) params.set("status_code", filters.status_code);
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.cache_hit) params.set("cache_hit", filters.cache_hit);

        const res = await api.get<LogsResponse>(`/logs?${params.toString()}`);
        setLogs(res.data.data);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
        });
      } catch (err) {
        toast.error("Loglar yüklenemedi: " + extractApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    if (token) fetchLogs();
  }, [token, fetchLogs]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    fetchLogs(1);
  }

  function clearFilters() {
    setFilters({
      endpoint: "",
      status_code: "",
      from: "",
      to: "",
      cache_hit: "",
    });
    fetchLogs(1);
  }

  function goToPage(page: number) {
    if (pagination && page >= 1 && page <= pagination.last_page) {
      fetchLogs(page);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function StatusBadge({ code }: { code: number }) {
    if (code >= 200 && code < 300)
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {code}
        </Badge>
      );
    if (code >= 400)
      return (
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          {code}
        </Badge>
      );
    return (
      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
        {code}
      </Badge>
    );
  }

  function MethodBadge({ method }: { method: string }) {
    const colors: Record<string, string> = {
      GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      PATCH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      <Badge
        className={`${colors[method] || "bg-zinc-700 text-zinc-400 border-zinc-600"} border`}
        variant="outline"
      >
        {method}
      </Badge>
    );
  }

  const hasFilters = Object.values(filters).some((v) => v !== "");

  if (!token) return null;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            İstek Logları
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            API isteklerinizin geçmişini görüntüleyin ve filtreleyin.
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Filtreler</span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 ml-auto h-7 px-2"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Uç nokta ara..."
              value={filters.endpoint}
              onChange={(e) => handleFilterChange("endpoint", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9 bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
            />
          </div>

          <Select
            value={filters.status_code}
            onValueChange={(value) => handleFilterChange("status_code", value)}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white text-sm">
              <SelectValue placeholder="Durum Kodu" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="200">200 Başarılı</SelectItem>
              <SelectItem value="201">201 Oluşturuldu</SelectItem>
              <SelectItem value="400">400 Hatalı İstek</SelectItem>
              <SelectItem value="401">401 Yetkisiz</SelectItem>
              <SelectItem value="403">403 Yasaklı</SelectItem>
              <SelectItem value="404">404 Bulunamadı</SelectItem>
              <SelectItem value="429">429 Çok Fazla İstek</SelectItem>
              <SelectItem value="500">500 Sunucu Hatası</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
            className="bg-zinc-950 border-zinc-700 text-white text-sm"
          />

          <Input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
            className="bg-zinc-950 border-zinc-700 text-white text-sm"
          />

          <Select
            value={filters.cache_hit}
            onValueChange={(value) => handleFilterChange("cache_hit", value)}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white text-sm">
              <SelectValue placeholder="Önbellek" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="1">Önbellekten Geldi</SelectItem>
              <SelectItem value="0">Önbelleksiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={applyFilters}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtrele
        </Button>
      </div>

      {/* Yükleniyor */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-12 text-center">
          <ScrollText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">Henüz log yok</h3>
          <p className="text-zinc-500 text-sm mt-2">
            API istekleri yaptıkça burada görünecek.
          </p>
        </div>
      ) : (
        <>
          {/* Log Tablosu */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Uç Nokta
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-20">
                      Metot
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-24">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-24 hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Gecikme
                      </span>
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-24 hidden md:table-cell">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        Önbellek
                      </span>
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-32 hidden lg:table-cell">
                      IP Adresi
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide w-36">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-zinc-300 font-mono text-xs truncate max-w-[200px] md:max-w-xs block">
                          {log.endpoint}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge code={log.status_code} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                        {log.response_time_ms
                          ? `${log.response_time_ms}ms`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {log.cache_hit ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            Evet
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-700 text-zinc-400 border-zinc-600 text-xs">
                            Hayır
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell font-mono">
                        {log.ip_address || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sayfalama */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {pagination.from}-{pagination.to} / {pagination.total} kayıt
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-zinc-400">
                  {pagination.current_page} / {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
