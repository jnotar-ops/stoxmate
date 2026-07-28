import { marketDataConfig } from "../config";

export class ProviderHttpError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryable: boolean,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ProviderHttpError";
  }
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function classifyProviderError(error: unknown): { code: string; message: string; retryable: boolean } {
  if (error instanceof ProviderHttpError) {
    if (error.status === 401) return { code: "INVALID_API_KEY", message: error.message, retryable: false };
    if (error.status === 403) return { code: "PERMISSION_DENIED", message: error.message, retryable: false };
    if (error.status === 404) return { code: "UNSUPPORTED_SYMBOL", message: error.message, retryable: false };
    if (error.status === 429) return { code: "RATE_LIMITED", message: error.message, retryable: true };
    return { code: `HTTP_${error.status ?? "NETWORK"}`, message: error.message, retryable: error.retryable };
  }
  if (error instanceof Error && error.name === "AbortError") {
    return { code: "TIMEOUT", message: "Provider request timed out", retryable: true };
  }
  return { code: "PROVIDER_ERROR", message: error instanceof Error ? error.message : "Unknown provider error", retryable: false };
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchProviderJson<T>(
  url: string,
  init: RequestInit = {},
  retries = marketDataConfig.transport.maxRetries,
): Promise<T> {
  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), marketDataConfig.transport.requestTimeoutMs);
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) {
        const retryAfterSeconds = Number(response.headers.get("retry-after"));
        const retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1_000 : undefined;
        throw new ProviderHttpError(
          `Provider returned HTTP ${response.status}`,
          response.status,
          isRetryableStatus(response.status),
          retryAfterMs,
        );
      }
      return (await response.json()) as T;
    } catch (error) {
      const classified = classifyProviderError(error);
      if (!classified.retryable || attempt >= retries) throw error;
      const retryAfterMs = error instanceof ProviderHttpError ? error.retryAfterMs : undefined;
      const waitMs = retryAfterMs ?? Math.min(4_000, 250 * 2 ** attempt + Math.floor(Math.random() * 100));
      attempt += 1;
      await delay(waitMs);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function mapWithConcurrency<T, R>(
  values: T[],
  worker: (value: T) => Promise<R>,
  concurrency = marketDataConfig.transport.maxConcurrency,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(Math.max(1, concurrency), values.length) }, async () => {
    while (cursor < values.length) {
      const current = cursor++;
      results[current] = await worker(values[current]);
    }
  });
  await Promise.all(runners);
  return results;
}
