import { create } from "zustand";
import api from "@/lib/api"; // ✅ Static import - dynamic import kaldırıldı

interface User {
  id: number;
  name: string;
  email: string;
  role: "developer" | "admin";
  plan: "free" | "pro";
  subscription_status: "active" | "canceled" | "past_due";
  auth_provider: "local" | "google";
  current_period_end: string | null;
  canceled_at: string | null;
  stripe_customer_id: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  isInitialized: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  logout: () => void;
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ token });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: true,
      isInitializing: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: true,
      isInitializing: false,
    });
  },

  initialize: async () => {
    if (get().isInitialized) return;

    if (typeof window === "undefined") {
      set({ isLoading: false, isInitializing: false, isInitialized: true });
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      set({
        token: null,
        user: null,
        isLoading: false,
        isInitializing: false,
        isInitialized: true,
      });
      return;
    }

    set({ token, isLoading: true, isInitializing: true, isInitialized: false });

    try {
      // ✅ Static import - await import("@/lib/api") KALDIRILDI
      const { data: user } = await api.get("/user");
      set({
        user,
        isLoading: false,
        isInitializing: false,
        isInitialized: true,
      });
    } catch {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isLoading: false,
        isInitializing: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // ✅ Static import
      const { data } = await api.post("/login", credentials);
      const { token, user } = data;
      localStorage.setItem("token", token);
      set({ token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true });
    try {
      // ✅ Static import
      const { data } = await api.post("/register", credentials);
      const { token, user } = data;
      localStorage.setItem("token", token);
      set({ token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
