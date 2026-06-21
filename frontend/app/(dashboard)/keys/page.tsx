// app/(dashboard)/keys/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Clock,
  AlertTriangle,
  X,
  Check,
  Loader2,
  MoreHorizontal,
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

interface ApiKey {
  id: number;
  user_id: number;
  key: string;
  name: string;
  is_active: boolean;
  permissions: Record<string, boolean> | null;
  allowed_ips: string[] | null;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateKeyForm {
  name: string;
  permissions: Record<string, boolean>;
  allowed_ips: string;
  expires_at: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [revealedKey, setRevealedKey] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateKeyForm>({
    name: "",
    permissions: { weather: true, exchange: true, countries: true },
    allowed_ips: "",
    expires_at: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.get("/keys");
      setKeys(res.data);
    } catch {
      toast.error("API key'ler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchKeys();
  }, [token, fetchKeys]);

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        permissions: formData.permissions,
      };

      if (formData.allowed_ips.trim()) {
        payload.allowed_ips = formData.allowed_ips
          .split(",")
          .map((ip) => ip.trim())
          .filter(Boolean);
      }
      if (formData.expires_at) {
        payload.expires_at = formData.expires_at;
      }

      const res = await api.post("/keys", payload);
      setKeys((prev) => [res.data, ...prev]);
      setCreateDialogOpen(false);
      resetForm();
      toast.success("API key oluşturuldu!");
    } catch (err) {
      setFormError(extractApiError(err));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRegenerate(keyId: number) {
    try {
      const res = await api.post(`/keys/${keyId}/regenerate`);
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? res.data.api_key : k)),
      );
      setRevealedKey(keyId);
      toast.success("API key yenilendi!");
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  async function handleDelete() {
    if (!selectedKey) return;
    try {
      await api.delete(`/keys/${selectedKey.id}`);
      setKeys((prev) => prev.filter((k) => k.id !== selectedKey.id));
      setDeleteDialogOpen(false);
      setSelectedKey(null);
      toast.success("API key silindi");
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  async function copyToClipboard(keyValue: string, id: number) {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Kopyalandı!");
    } catch {
      toast.error("Kopyalama başarısız");
    }
  }

  function toggleReveal(id: number) {
    setRevealedKey((prev) => (prev === id ? null : id));
  }

  function resetForm() {
    setFormData({
      name: "",
      permissions: { weather: true, exchange: true, countries: true },
      allowed_ips: "",
      expires_at: "",
    });
    setFormError("");
  }

  function maskKey(key: string) {
    if (key.length <= 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR");
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

  function PermissionsPreview({
    permissions,
  }: {
    permissions: Record<string, boolean> | null;
  }) {
    if (!permissions)
      return <span className="text-zinc-500 text-sm">Tüm API'ler</span>;
    const active = Object.entries(permissions).filter(([, v]) => v);
    if (active.length === 0)
      return <span className="text-zinc-500 text-sm">Yok</span>;
    return (
      <div className="flex gap-1 flex-wrap">
        {active.map(([key]) => (
          <Badge
            key={key}
            variant="outline"
            className="text-xs border-zinc-700 text-zinc-400"
          >
            {key}
          </Badge>
        ))}
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="space-y-6">
      {/* ✅ Dashboard ölçülerine uygun header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">API Keys</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Uygulamalarınızda kullanacağınız API key'lerinizi yönetin.
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
          <span className="hidden sm:inline">Yeni Key</span>
        </Button>
      </div>

      {user?.plan === "free" && keys.length >= 2 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                Free Plan Sınırı
              </p>
              <p className="text-xs text-amber-500/70 mt-0.5">
                Free planda en fazla 3 API key oluşturabilirsiniz. (
                {keys.length}/3)
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : keys.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-12 text-center">
          <Key className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg">Henüz API key yok</h3>
          <p className="text-zinc-500 text-sm mt-2 mb-6">
            İlk API key'inizi oluşturarak başlayın.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Key Oluştur
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium truncate">
                      {apiKey.name}
                    </h3>
                    <StatusBadge isActive={apiKey.is_active} />
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="bg-zinc-950 px-3 py-1.5 rounded-lg text-sm font-mono text-zinc-300 border border-zinc-800">
                      {revealedKey === apiKey.id
                        ? apiKey.key
                        : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleReveal(apiKey.id)}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {revealedKey === apiKey.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {copiedId === apiKey.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(apiKey.created_at)}
                    </span>
                    {apiKey.expires_at && (
                      <span className="flex items-center gap-1 text-amber-400/70">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(apiKey.expires_at)}
                      </span>
                    )}
                    {apiKey.last_used_at && (
                      <span>Son: {formatDate(apiKey.last_used_at)}</span>
                    )}
                    {apiKey.allowed_ips && apiKey.allowed_ips.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {apiKey.allowed_ips.length} IP
                      </span>
                    )}
                  </div>

                  <PermissionsPreview permissions={apiKey.permissions} />
                </div>

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
                      onClick={() => handleRegenerate(apiKey.id)}
                      className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 text-amber-400" />
                      Yenile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedKey(apiKey);
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
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Yeni API Key
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              API key'inize bir isim verin ve ayarları yapılandırın.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateKey} className="space-y-4">
            {formError && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-zinc-300">
                Key Adı *
              </Label>
              <Input
                id="key-name"
                placeholder="Örn: Production App"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">İzinler</Label>
              <div className="space-y-2 bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                {Object.entries(formData.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400 capitalize">
                      {key}
                    </span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: { ...prev.permissions, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-ips" className="text-zinc-300">
                İzin Verilen IP'ler (Opsiyonel)
              </Label>
              <Input
                id="allowed-ips"
                placeholder="192.168.1.1, 10.0.0.1"
                value={formData.allowed_ips}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    allowed_ips: e.target.value,
                  }))
                }
                className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
              />
              <p className="text-xs text-zinc-500">
                Virgülle ayırarak birden fazla IP
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-at" className="text-zinc-300">
                Son Kullanma Tarihi (Opsiyonel)
              </Label>
              <Input
                id="expires-at"
                type="date"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expires_at: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="bg-zinc-950 border-zinc-700 text-white"
              />
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Key'i Sil
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              <strong className="text-zinc-200">{selectedKey?.name}</strong>{" "}
              silinecek. Bu key ile yapılan tüm istekler reddedilecektir.
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
