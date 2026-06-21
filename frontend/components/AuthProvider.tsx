"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ✅ Sadece app mount'ta bir kere initialize et
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // ✅ 401 event dinleyici - hızlı logout
  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
      // Hard redirect daha hızlı
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/keys")) {
        window.location.href = "/login";
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [clearAuth, pathname]);

  return children;
}
