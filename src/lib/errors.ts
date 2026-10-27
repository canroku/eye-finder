import { apiUrl } from "@/lib/api";

export type ErrorCode =
  | "timeout"
  | "storage"
  | "network"
  | "pipeline"
  | "photo"
  | "validation"
  | "api"
  | "unknown";

export class AppError extends Error {
  code: ErrorCode;
  status?: number;

  constructor(message: string, code: ErrorCode = "unknown", status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function getUserErrorMessage(err: unknown): string {
  if (err instanceof AppError) {
    return err.message;
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    if (err.name === "TimeoutError" || msg.includes("zaman aşımı")) {
      return "İşlem zaman aşımına uğradı. Fotoğraf sayısını azalt veya Ayarlar → Sistemi Sıfırla ile temizle.";
    }
    if (msg.includes("indexeddb") || msg.includes("storage")) {
      return "Yerel depolama hatası. Ayarlar → Sistemi Sıfırla ile temizleyip tekrar dene.";
    }
    if (msg.includes("fotoğraf") || msg.includes("photo")) {
      return "Fotoğraf işlenemedi. Daha küçük veya farklı bir görsel dene.";
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) {
      return "Bağlantı hatası. İnternetini kontrol et — yerel analiz yine de denenebilir.";
    }
    if (msg.includes("rate limit")) {
      return "Çok fazla istek gönderildi. Bir dakika bekleyip tekrar dene.";
    }

    return err.message || "Beklenmeyen bir hata oluştu.";
  }

  return "Beklenmeyen bir hata oluştu. Sayfayı yenileyip tekrar dene.";
}

export function classifyError(err: unknown): ErrorCode {
  if (err instanceof AppError) return err.code;
  if (err instanceof Error) {
    if (err.name === "TimeoutError" || err.message.includes("zaman aşımı")) return "timeout";
    if (err.message.toLowerCase().includes("indexeddb")) return "storage";
    if (err.message.toLowerCase().includes("fotoğraf")) return "photo";
    if (err.message.toLowerCase().includes("fetch")) return "network";
  }
  return "unknown";
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(url), {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AppError("Sunucuya bağlanılamadı — çevrimdışı olabilirsin.", "network");
  }

  let data: { error?: string; ok?: boolean } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* boş gövde */
  }

  if (res.status === 429) {
    throw new AppError("Çok fazla istek. Lütfen kısa süre sonra tekrar dene.", "api", 429);
  }

  if (!res.ok) {
    throw new AppError(data.error ?? `Sunucu hatası (${res.status})`, "api", res.status);
  }

  return data as T;
}

export async function apiGet<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(url), { cache: "no-store", credentials: "include" });
  } catch {
    throw new AppError("Veri yüklenemedi — bağlantını kontrol et.", "network");
  }

  if (!res.ok) {
    throw new AppError(`Sunucu hatası (${res.status})`, "api", res.status);
  }

  return res.json() as Promise<T>;
}
