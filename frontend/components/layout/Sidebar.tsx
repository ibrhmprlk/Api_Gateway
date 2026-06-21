"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Key,
  ScrollText,
  Webhook,
  CreditCard,
  Settings,
  BarChart3,
  ChevronDown,
  LogOut,
  FlaskConical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const developerLinks = [
  { href: "/dashboard", label: "Ana Sayfa", icon: LayoutDashboard },
  { href: "/keys", label: "API Anahtarları", icon: Key },
  { href: "/logs", label: "İstek Günlükleri", icon: ScrollText },
  { href: "/webhooks", label: "Webhooklar", icon: Webhook },
  { href: "/billing", label: "Abonelik", icon: CreditCard },
  { href: "/sandbox", label: "Sandbox", icon: FlaskConical },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];
interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside className="flex flex-col h-full w-64 bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-base tracking-tight">
          API Gateway
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {developerLinks.map((link) => (
          <NavLink
            key={link.href}
            {...link}
            active={pathname === link.href}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Kullanıcı menüsü */}
      <div className="px-3 py-3 border-t border-zinc-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-zinc-900 border-zinc-800"
          >
            <div className="px-2 py-1.5">
              <p className="text-xs text-zinc-500">Oturum:</p>
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-red-400 focus:text-red-400 focus:bg-zinc-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-2 px-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
            <span className="text-xs text-zinc-400">Mevcut Plan</span>
            <Badge
              className={cn(
                "text-xs capitalize py-0",
                user?.plan === "pro"
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  : "bg-zinc-700 text-zinc-400 border-zinc-600",
              )}
              variant="outline"
            >
              {user?.plan ?? "free"}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-indigo-500/15 text-indigo-400 font-medium"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}
