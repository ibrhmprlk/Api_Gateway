"use client";

import { useEffect, useRef, useCallback } from "react";
import Pusher, { Channel } from "pusher-js";
import { useAuthStore } from "@/store/authStore";

export function usePusher(channelName: string) {
  const token = useAuthStore((s) => s.token);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!token || !channelName) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    pusherRef.current = pusher;
    channelRef.current = pusher.subscribe(channelName);

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      pusherRef.current = null;
      channelRef.current = null;
    };
  }, [token, channelName]);

  const subscribe = useCallback(
    (eventName: string, callback: (data: any) => void) => {
      if (!channelRef.current) return () => {};

      channelRef.current.bind(eventName, callback);

      return () => {
        channelRef.current?.unbind(eventName, callback);
      };
    },
    [],
  );

  return { subscribe, pusher: pusherRef.current };
}
