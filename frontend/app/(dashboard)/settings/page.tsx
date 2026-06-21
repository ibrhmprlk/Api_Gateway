"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Trash2,
  AlertTriangle,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Save,
  KeyRound,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  plan: string;
  auth_provider: string;
  created_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isGoogleUser = profile?.auth_provider === "google";

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setName(res.data.name || "");
      setEmail(res.data.email || "");
    } catch {
      toast.error("Profil bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (name !== profile?.name) payload.name = name;
      if (email !== profile?.email) payload.email = email;

      if (Object.keys(payload).length === 0) {
        toast.info("Değişiklik yok.");
        setProfileSaving(false);
        return;
      }

      const res = await api.put("/profile", payload);
      setProfile(res.data.user);
      toast.success(res.data.message);

      if (payload.email) {
        toast.info(
          "Email adresiniz değişti. Lütfen yeni email'inizi doğrulayın.",
        );
      }
    } catch (err) {
      setProfileError(extractApiError(err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put("/profile/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 2000);
    } catch (err) {
      setPasswordError(extractApiError(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.delete("/profile", {
        data: isGoogleUser ? {} : { password: deletePassword },
      });
      toast.success("Hesabınız silindi.");
      logout();
      router.push("/login");
    } catch (err) {
      setDeleteError(extractApiError(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Ayarlar</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin.
        </p>
      </div>

      {/* Profil Özeti */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white font-semibold truncate">
                {profile?.name}
              </h2>
              {!isGoogleUser &&
                (profile?.email_verified_at ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Doğrulanmamış
                  </Badge>
                ))}
              {/* Google kullanıcısı rozeti */}
              {isGoogleUser && (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                  Google Hesabı
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500 truncate">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600">
              <span className="capitalize">{profile?.plan} plan</span>
              <span>•</span>
              <span>Kayıt: {formatDate(profile?.created_at || null)}</span>
            </div>
          </div>
        </div>

        {/* Google kullanıcısı bilgi notu */}
        {isGoogleUser && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            Bu hesap Google ile oluşturulmuştur. Şifre değiştirme işlemi mevcut
            değil.
          </div>
        )}
      </div>

      {/* Profil Bilgileri */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-500" />
          <h3 className="text-white font-medium text-sm">Profil Bilgileri</h3>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
          {profileError && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {profileError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300 text-sm">
              Ad Soyad
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-700 text-white"
                placeholder="Adınız"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              Email Adresi
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-zinc-950 border-zinc-700 text-white"
                placeholder="ornek@email.com"
                disabled={isGoogleUser}
              />
            </div>
            {isGoogleUser && (
              <p className="text-xs text-zinc-600">
                Google hesaplarında email değiştirilemez.
              </p>
            )}
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              disabled={profileSaving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Şifre Değiştir — sadece local kullanıcılara göster */}
      {!isGoogleUser && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-zinc-500" />
            <h3 className="text-white font-medium text-sm">Şifre Değiştir</h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-5 space-y-4">
            {passwordError && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {passwordError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Mevcut Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-700 text-white"
                  placeholder="Mevcut şifreniz"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Yeni Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-700 text-white"
                  placeholder="En az 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">
                Yeni Şifre (Tekrar)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-700 text-white"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={passwordSaving}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Şifreyi Değiştir
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tehlikeli Bölge */}
      <div className="border border-red-500/20 rounded-xl bg-red-950/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-500/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-red-400 font-medium text-sm">Tehlikeli Bölge</h3>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white text-sm font-medium">Hesabı Sil</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Tüm API key'ler, webhook'lar ve loglar kalıcı olarak silinir. Bu
                işlem geri alınamaz.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDeletePassword("");
                setDeleteError("");
                setDeleteDialogOpen(true);
              }}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hesabı Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Hesap Silme Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-red-500/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Hesabı Sil
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bu işlem <strong className="text-red-400">geri alınamaz</strong>.
              Tüm API key'leriniz, webhook'larınız ve loglarınız kalıcı olarak
              silinecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {deleteError && (
              <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {deleteError}
              </div>
            )}

            {/* Google kullanıcısı şifre girmez */}
            {!isGoogleUser && (
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Şifrenizi Onaylayın
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-zinc-950 border-zinc-700 text-white"
                    placeholder="Mevcut şifreniz"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                  >
                    {showDeletePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isGoogleUser && (
              <p className="text-sm text-zinc-400">
                Google hesabınızla oluşturulan bu hesabı silmek istediğinizden
                emin misiniz?
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Vazgeç
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || (!isGoogleUser && !deletePassword)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Kalıcı Olarak Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
