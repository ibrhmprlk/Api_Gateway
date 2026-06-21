"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Trash2, Webhook, CreditCard, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePusher } from "@/hooks/usePusher";
import { Button } from "@/components/ui/button";

const EVENT_ICONS = {
  webhook: Webhook,
  billing: CreditCard,
  system: AlertCircle,
};

export default function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const { subscribe } = usePusher(user?.id ? `private-user.${user.id}` : "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const unsubWebhook = subscribe("webhook.triggered", (data: any) => {
      addNotification({
        id: crypto.randomUUID(),
        type: "webhook",
        title: "Webhook Tetiklendi",
        message: `${data.event || "test"} event'i gönderildi.`,
        read: false,
        created_at: new Date().toISOString(),
        data,
      });
    });
    return () => {
      unsubWebhook();
    };
  }, [subscribe, user?.id, addNotification]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-zinc-400 hover:text-white hover:bg-zinc-800 relative"
        onClick={() => {
          console.log("bell clicked, open:", !open);
          setOpen((v) => !v);
        }}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            <span className="text-sm font-medium text-white">Bildirimler</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-zinc-500 text-sm">
                Bildirim yok
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = EVENT_ICONS[notification.type] || AlertCircle;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-zinc-800 transition-colors ${
                      !notification.read ? "bg-zinc-800/30" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div
                      className={`mt-0.5 shrink-0 ${notification.read ? "text-zinc-600" : "text-indigo-400"}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {new Date(notification.created_at).toLocaleTimeString(
                          "tr-TR",
                        )}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-zinc-600 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
