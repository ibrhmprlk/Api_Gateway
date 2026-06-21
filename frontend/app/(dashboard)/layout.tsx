"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = useAuthStore((s) => s.token);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    const initialize = useAuthStore.getState().initialize;
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace("/login");
    }
  }, [isInitialized, token, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen bg-zinc-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="flex h-screen bg-zinc-950">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-zinc-900 border-zinc-800"
        >
          <Sidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sadece mobilede hamburger */}
        <header className="flex lg:hidden items-center px-4 h-14 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
