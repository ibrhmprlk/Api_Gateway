"use client";

import { useEffect, useRef, useState } from "react";
import {
  Cloud,
  DollarSign,
  Globe,
  Play,
  Loader2,
  Key,
  ChevronDown,
  CheckCircle2,
  XCircle,
  FlaskConical,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  is_active: boolean;
  permissions: {
    weather?: boolean;
    exchange?: boolean;
    countries?: boolean;
  };
}

type Tab = "weather" | "exchange" | "countries";

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] =
  [
    {
      id: "weather",
      label: "Hava Durumu",
      icon: <Cloud className="w-4 h-4" />,
      color: "indigo",
    },
    {
      id: "exchange",
      label: "Döviz Kuru",
      icon: <DollarSign className="w-4 h-4" />,
      color: "emerald",
    },
    {
      id: "countries",
      label: "Ülke Bilgisi",
      icon: <Globe className="w-4 h-4" />,
      color: "amber",
    },
  ];

export default function SandboxPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [keysLoading, setKeysLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("weather");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const [city, setCity] = useState("Istanbul");
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("TRY");
  const [country, setCountry] = useState("Turkey");

  // Dropdown dışına tıklama ile kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    api
      .get<ApiKey[]>("/keys")
      .then((res) => {
        const active = res.data.filter((k) => k.is_active);
        setKeys(active);
        if (active.length > 0) setSelectedKey(active[0]);
      })
      .catch(() => toast.error("API key'ler yüklenemedi"))
      .finally(() => setKeysLoading(false));
  }, []);

  async function handleSend() {
    if (!selectedKey) {
      toast.error("Önce bir API key seçin");
      return;
    }

    const permKey = activeTab;
    if (!selectedKey.permissions[permKey]) {
      toast.error(`Seçili key'in ${activeTab} izni kapalı`);
      return;
    }

    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    setElapsed(null);

    const paramsMap: Record<Tab, string> = {
      weather: `city=${encodeURIComponent(city)}`,
      exchange: `base=${base}&target=${target}`,
      countries: `name=${encodeURIComponent(country)}`,
    };
    const params = paramsMap[activeTab];

    const start = performance.now();

    try {
      const res = await api.get(`/gateway/${activeTab}?${params}`, {
        headers: { "X-API-Key": selectedKey.key },
        validateStatus: () => true,
      });
      const ms = Math.round(performance.now() - start);
      setResponse(res.data);
      setStatusCode(res.status);
      setElapsed(ms);
    } catch {
      toast.error("İstek gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  const tabColors: Record<Tab, string> = {
    weather: "indigo",
    exchange: "emerald",
    countries: "amber",
  };

  const color = tabColors[activeTab];

  const colorMap: Record<string, string> = {
    indigo: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
    emerald: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    amber: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl md:text-2xl font-bold text-white">Sandbox</h1>
        </div>
        <p className="text-zinc-500 text-sm mt-0.5">
          API key'lerinizi kullanarak endpoint'leri tarayıcıdan test edin.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">
              API Key
            </label>
            {keysLoading ? (
              <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
            ) : keys.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Aktif API key bulunamadı.{" "}
                <a href="/keys" className="text-indigo-400 hover:underline">
                  Key oluşturun →
                </a>
              </p>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 hover:border-zinc-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-500" />
                    {selectedKey ? (
                      <span>
                        <span className="font-medium">{selectedKey.name}</span>
                        <span className="text-zinc-500 ml-2 font-mono text-xs">
                          {selectedKey.key.slice(0, 12)}...
                        </span>
                      </span>
                    ) : (
                      "Key seçin"
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
                    {keys.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => {
                          setSelectedKey(k);
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors text-left"
                      >
                        <Key className="w-4 h-4 text-zinc-500 shrink-0" />
                        <div>
                          <p className="font-medium">{k.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">
                            {k.key.slice(0, 20)}...
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedKey && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {(["weather", "exchange", "countries"] as const).map((p) => (
                  <span
                    key={p}
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      selectedKey.permissions[p]
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-zinc-700 text-zinc-600 bg-zinc-800"
                    }`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3 block">
              Endpoint
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResponse(null);
                    setStatusCode(null);
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? colorMap[tab.color]
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3 block">
              Parametreler
            </label>

            {activeTab === "weather" && (
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Şehir
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Istanbul"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {activeTab === "exchange" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">
                    Kaynak
                  </label>
                  <input
                    value={base}
                    onChange={(e) => setBase(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">
                    Hedef
                  </label>
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value.toUpperCase())}
                    placeholder="TRY"
                    maxLength={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {activeTab === "countries" && (
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Ülke Adı
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Turkey"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={loading || !selectedKey}
              className={`w-full mt-4 text-white ${
                color === "indigo"
                  ? "bg-indigo-600 hover:bg-indigo-500"
                  : color === "emerald"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              İsteği Gönder
            </Button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-300">Yanıt</span>
            {statusCode !== null && (
              <div className="flex items-center gap-2">
                {elapsed !== null && (
                  <span className="text-xs text-zinc-500">{elapsed}ms</span>
                )}
                <Badge
                  className={
                    statusCode < 300
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : statusCode < 500
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                  }
                >
                  {statusCode < 300 ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {statusCode}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-auto min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : response ? (
              <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <FlaskConical className="w-10 h-10 text-zinc-700" />
                <p className="text-sm text-zinc-600">
                  Bir endpoint seçin ve &quot;İsteği Gönder&quot; butonuna
                  tıklayın
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
