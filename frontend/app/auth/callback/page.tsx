"use client";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

function CallbackContent() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      console.error("Token bulunamadı:", window.location.href);
      router.replace("/login?error=no_token");
      return;
    }

    console.log("Token bulundu:", token.substring(0, 20) + "...");

    const finish = async () => {
      try {
        useAuthStore.getState().setToken(token);
        const { data: user } = await api.get("/user");
        useAuthStore.getState().setUser(user);
        useAuthStore.setState({ isInitialized: true, isInitializing: false });
        router.replace("/dashboard");
      } catch (err) {
        console.error("Auth hatası:", err);
        router.replace("/login?error=auth_failed");
      }
    };

    finish();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400">Giriş işlemini tamamlıyor...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-zinc-950">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
