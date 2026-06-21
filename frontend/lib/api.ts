//Frontend'in Laravel API ile güvenli ve merkezi şekilde haberleşmesini sağlamak için kullanıldı.

//Tüm API istekleri tek yerden yönetiliyor.
//Base URL tanımlanıyor.
//Authorization token otomatik ekleniyor.
//Hata yönetimi merkezi hale geliyor.
//api.ts → Tokenı isteklere ekler.

// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - console.log KALDIRILDI
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }
  return config;
});

// Response interceptor - console.log KALDIRILDI, 401 hızlı logout
api.interceptors.response.use(
  (response) => response, // ✅ Direkt return, log yok
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // ✅ Store'u sync olarak temizle
        const event = new CustomEvent("auth:logout", {
          detail: { silent: true },
        });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const axiosErr = err as {
      response?: {
        data?: { message?: string; errors?: Record<string, string[]> };
      };
      message?: string;
    };
    const data = axiosErr.response?.data;
    if (data?.errors) {
      const firstError = Object.values(data.errors).flat()[0];
      if (firstError) return firstError;
    }
    if (data?.message) return data.message;
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    return (err as Error).message;
  }
  return "An unexpected error occurred. Please try again.";
}

export default api;
