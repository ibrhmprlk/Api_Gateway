// app/(dashboard)/webhooks/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Webhook,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  X,
  Check,
  Loader2,
  MoreHorizontal,
  Send,
  FileText,
  Activity,
  Globe,
  Zap,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api, { extractApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface WebhookLog {
  id: number;
  webhook_id: number;
  payload: Record<string, unknown> | null;
  status_code: number | null;
  success: boolean;
  attempt: number;
  created_at: string;
}

interface Webhook {
  id: number;
  user_id: number;
  url: string;
  event: "limit_reached" | "key_expired" | "request_failed";
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  logs?: WebhookLog[];
}

interface CreateWebhookForm {
  url: string;
  event: "limit_reached" | "key_expired" | "request_failed";
}

const EVENT_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Zap }
> = {
  limit_reached: { label: "Limit Aşıldı", color: "amber", icon: AlertTriangle },
  key_expired: { label: "Key Süresi Doldu", color: "rose", icon: Key },
  request_failed: { label: "İstek Başarısız", color: "red", icon: X },
  test: { label: "Test", color: "blue", icon: Send },
};

export default function WebhooksPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{
    status_code: number;
    success: boolean;
    message: string;
  } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState<CreateWebhookForm>({
    url: "",
    event: "limit_reached",
  });
  const [editFormData, setEditFormData] = useState<{
    url: string;
    event: string;
    is_active: boolean;
  }>({
    url: "",
    event: "limit_reached",
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get("/webhooks");
      setWebhooks(res.data);
    } catch {
      toast.error("Webhook'lar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchWebhooks();
  }, [token, fetchWebhooks]);

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const res = await api.post("/webhooks", formData);
      setWebhooks((prev) => [res.data, ...prev]);
      setCreateDialogOpen(false);
      resetForm();
      toast.success("Webhook oluşturuldu!");
    } catch (err) {
      setFormError(extractApiError(err));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWebhook) return;
    setFormError("");
    setFormLoading(true);

    try {
      const payload: Record<string, unknown> = {};
      if (editFormData.url !== selectedWebhook.url)
        payload.url = editFormData.url;
      if (editFormData.event !== selectedWebhook.event)
        payload.event = editFormData.event;
      if (editFormData.is_active !== selectedWebhook.is_active)
        payload.is_active = editFormData.is_active;

      if (Object.keys(payload).length === 0) {
        setEditDialogOpen(false);
        setFormLoading(false);
        return;
      }

      const res = await api.put(`/webhooks/${selectedWebhook.id}`, payload);
      setWebhooks((prev) =>
        prev.map((w) => (w.id === selectedWebhook.id ? res.data : w)),
      );
      setEditDialogOpen(false);
      setSelectedWebhook(null);
      toast.success("Webhook güncellendi!");
    } catch (err) {
      setFormError(extractApiError(err));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedWebhook) return;
    try {
      await api.delete(`/webhooks/${selectedWebhook.id}`);
      setWebhooks((prev) => prev.filter((w) => w.id !== selectedWebhook.id));
      setDeleteDialogOpen(false);
      setSelectedWebhook(null);
      toast.success("Webhook silindi");
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  async function handleTestWebhook() {
    if (!selectedWebhook) return;
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await api.post(`/webhooks/${selectedWebhook.id}/test`);
      setTestResult({
        status_code: res.data.status_code,
        success: res.data.success,
        message: res.data.message,
      });
      toast.success(
        res.data.success
          ? "Test başarılı!"
          : "Test tamamlandı (başarısız yanıt)",
      );
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setTestLoading(false);
    }
  }

  async function handleToggleActive(webhook: Webhook) {
    try {
      const res = await api.put(`/webhooks/${webhook.id}`, {
        is_active: !webhook.is_active,
      });
      setWebhooks((prev) =>
        prev.map((w) => (w.id === webhook.id ? res.data : w)),
      );
      toast.success(
        webhook.is_active ? "Webhook pasife alındı" : "Webhook aktifleştirildi",
      );
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  async function fetchLogs(webhookId: number) {
    try {
      const res = await api.get(`/webhooks/${webhookId}/logs`);
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === webhookId ? { ...w, logs: res.data.data || res.data } : w,
        ),
      );
    } catch (err) {
      toast.error("Log'lar yüklenemedi");
    }
  }

  async function copyToClipboard(text: string, id: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Kopyalandı!");
    } catch {
      toast.error("Kopyalama başarısız");
    }
  }

  function toggleRevealSecret(id: number) {
    setRevealedSecret((prev) => (prev === id ? null : id));
  }

  function toggleLogs(id: number) {
    if (expandedLogs === id) {
      setExpandedLogs(null);
    } else {
      setExpandedLogs(id);
      const webhook = webhooks.find((w) => w.id === id);
      if (!webhook?.logs) {
        fetchLogs(id);
      }
    }
  }

  function resetForm() {
    setFormData({
      url: "",
      event: "limit_reached",
    });
    setFormError("");
  }

  function openEditDialog(webhook: Webhook) {
    setSelectedWebhook(webhook);
    setEditFormData({
      url: webhook.url,
      event: webhook.event,
      is_active: webhook.is_active,
    });
    setEditDialogOpen(true);
  }

  function openTestDialog(webhook: Webhook) {
    setSelectedWebhook(webhook);
    setTestResult(null);
    setTestDialogOpen(true);
  }

  function openLogsDialog(webhook: Webhook) {
    setSelectedWebhook(webhook);
    setLogsDialogOpen(true);
    if (!webhook.logs) {
      fetchLogs(webhook.id);
    }
  }

  function maskSecret(secret: string) {
    if (secret.length <= 12) return secret;
    return `${secret.slice(0, 8)}...${secret.slice(-4)}`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function StatusBadge({ isActive }: { isActive: boolean }) {
    return isActive ? (
      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
        <Check className="w-3 h-3 mr-1" />
        Aktif
      </Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
        <X className="w-3 h-3 mr-1" />
        Pasif
      </Badge>
    );
  }

  function EventBadge({ event }: { event: string }) {
    const config = EVENT_CONFIG[event] || EVENT_CONFIG.request_failed;
    const Icon = config.icon;
    const colorMap: Record<string, string> = {
      amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      red: "bg-red-500/10 text-red-400 border-red-500/20",
      blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };

    return (
      <Badge className={`${colorMap[config.color]} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }

  if (!token) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            API event'lerinde otomatik bildirim almak için webhook'larınızı
            yönetin.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Webhook</span>
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
        <Webhook className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-zinc-300 font-medium">Webhook Güvenliği</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Her webhook için benzersiz bir secret üretilir. Gelen isteklerde{" "}
            <code className="text-zinc-400 bg-zinc-950 px-1 py-0.5 rounded text-xs">
              X-Webhook-Signature
            </code>{" "}
            header'ını HMAC-SHA256 ile doğrulayarak isteğin bizden geldiğinden
            emin olabilirsiniz.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-12 text-center">
          <Webhook className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">Henüz webhook yok</h3>
          <p className="text-zinc-500 text-sm mt-2 mb-6">
            İlk webhook'unuzu oluşturarak event bildirimleri almaya başlayın.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Webhook Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-medium truncate">
                        {webhook.url}
                      </h3>
                      <StatusBadge isActive={webhook.is_active} />
                      <EventBadge event={webhook.event} />
                    </div>

                    {/* Secret */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        Secret:
                      </span>
                      <code className="bg-zinc-950 px-3 py-1.5 rounded-lg text-sm font-mono text-zinc-300 border border-zinc-800">
                        {revealedSecret === webhook.id
                          ? webhook.secret
                          : maskSecret(webhook.secret)}
                      </code>
                      <button
                        onClick={() => toggleRevealSecret(webhook.id)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {revealedSecret === webhook.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(webhook.secret, webhook.id)
                        }
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {copiedId === webhook.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(webhook.created_at)}
                      </span>
                      {webhook.logs && webhook.logs.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          {webhook.logs.length} log
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => handleToggleActive(webhook)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-800 text-zinc-200"
                      >
                        <DropdownMenuItem
                          onClick={() => openTestDialog(webhook)}
                          className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800"
                        >
                          <Send className="w-4 h-4 mr-2 text-emerald-400" />
                          Test Et
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(webhook)}
                          className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800"
                        >
                          <RefreshCw className="w-4 h-4 mr-2 text-amber-400" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setDeleteDialogOpen(true);
                          }}
                          className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Expandable Logs Preview */}
                <button
                  onClick={() => toggleLogs(webhook.id)}
                  className="mt-4 flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {expandedLogs === webhook.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <FileText className="w-3.5 h-3.5" />
                  Log Geçmişi
                  {webhook.logs && (
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                      {webhook.logs.length}
                    </span>
                  )}
                </button>

                {expandedLogs === webhook.id && (
                  <div className="mt-3 space-y-2">
                    {webhook.logs ? (
                      webhook.logs.length === 0 ? (
                        <p className="text-xs text-zinc-600 py-2">
                          Henüz log kaydı yok.
                        </p>
                      ) : (
                        webhook.logs.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between bg-zinc-950/50 rounded-lg px-3 py-2 border border-zinc-800/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  log.success ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              />
                              <span className="text-xs text-zinc-400">
                                {log.attempt}. deneme
                              </span>
                              {log.status_code && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    log.status_code >= 200 &&
                                    log.status_code < 300
                                      ? "border-emerald-500/30 text-emerald-400"
                                      : "border-red-500/30 text-red-400"
                                  }`}
                                >
                                  {log.status_code}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-zinc-600">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        ))
                      )
                    ) : (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
                        <span className="text-xs text-zinc-600">
                          Yükleniyor...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Yeni Webhook
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Event bildirimlerinin gönderileceği URL ve event tipini
              belirleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWebhook} className="space-y-4">
            {formError && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-zinc-300">
                Webhook URL *
              </Label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-600 shrink-0" />
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://myapp.com/webhook"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  required
                  className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Bildirimlerin POST olarak gönderileceği adres.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Event Tipi *</Label>
              <div className="space-y-2 bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                {Object.entries(EVENT_CONFIG)
                  .filter(([key]) => key !== "test")
                  .map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.event === key
                            ? "bg-zinc-800/50 border border-zinc-700"
                            : "hover:bg-zinc-800/30 border border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="event"
                          value={key}
                          checked={formData.event === key}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              event: e.target.value as Webhook["event"],
                            }))
                          }
                          className="sr-only"
                        />
                        <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300">
                            {config.label}
                          </p>
                          <p className="text-xs text-zinc-600">
                            {key === "limit_reached" && "Rate limit dolduğunda"}
                            {key === "key_expired" &&
                              "API key süresi dolduğunda"}
                            {key === "request_failed" &&
                              "İstek başarısız olduğunda"}
                          </p>
                        </div>
                        {formData.event === key && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "Oluştur"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Webhook Düzenle
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Webhook URL, event tipi veya aktif/pasif durumunu değiştirin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateWebhook} className="space-y-4">
            {formError && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-zinc-300">
                Webhook URL
              </Label>
              <Input
                id="edit-url"
                type="url"
                value={editFormData.url}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                className="bg-zinc-950 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Event Tipi</Label>
              <div className="space-y-2 bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                {Object.entries(EVENT_CONFIG)
                  .filter(([key]) => key !== "test")
                  .map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          editFormData.event === key
                            ? "bg-zinc-800/50 border border-zinc-700"
                            : "hover:bg-zinc-800/30 border border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="edit-event"
                          value={key}
                          checked={editFormData.event === key}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              event: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300">
                            {config.label}
                          </p>
                        </div>
                        {editFormData.event === key && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-950 rounded-lg p-3 border border-zinc-800">
              <div className="space-y-0.5">
                <Label className="text-zinc-300 text-sm">Aktif</Label>
                <p className="text-xs text-zinc-500">
                  Pasif webhook'lar event bildirimi göndermez.
                </p>
              </div>
              <Switch
                checked={editFormData.is_active}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({ ...prev, is_active: checked }))
                }
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  "Güncelle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Webhook Testi
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              <code className="text-zinc-300 bg-zinc-950 px-1 rounded">
                {selectedWebhook?.url}
              </code>{" "}
              adresine test payload'ı gönder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {testResult && (
              <div
                className={`rounded-lg p-3 border ${
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      testResult.success ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {testResult.success ? "Başarılı" : "Başarısız"}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      testResult.status_code >= 200 &&
                      testResult.status_code < 300
                        ? "border-emerald-500/30 text-emerald-400"
                        : "border-red-500/30 text-red-400"
                    }`}
                  >
                    {testResult.status_code}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{testResult.message}</p>
              </div>
            )}

            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2 font-medium">
                Test Payload:
              </p>
              <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
                {JSON.stringify(
                  {
                    event: "test",
                    message: "Bu bir test bildirimidir.",
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setTestDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Kapat
            </Button>
            <Button
              onClick={handleTestWebhook}
              disabled={testLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {testLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Test Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Webhook'u Sil
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              <code className="text-zinc-200 bg-zinc-950 px-1 rounded">
                {selectedWebhook?.url}
              </code>{" "}
              silinecek. Bu webhook bir daha tetiklenmeyecek ve ilgili log'lar
              da silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              İptal
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
