"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import NotificationBell from "@/components/NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = useAuthStore((s) => s.token);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace("/login");
    }
  }, [isInitialized, token, router]);

  if (isInitializing) return <DashboardSkeleton />;
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
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-zinc-800 bg-zinc-950 shrink-0 relative z-50">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-zinc-950">
      <div className="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col p-4 gap-3">
        <div className="h-8 w-32 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 bg-zinc-800 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-zinc-900 border-b border-zinc-800 animate-pulse lg:hidden" />
        <div className="p-8 space-y-4">
          <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
