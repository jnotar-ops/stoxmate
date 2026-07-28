const intFromEnv = (name: string, fallback: number, minimum = 1) => {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
};

export const marketDataConfig = {
  providers: {
    market: process.env.MARKET_DATA_PROVIDER ?? "twelve_data",
    crypto: process.env.CRYPTO_DATA_PROVIDER ?? "coingecko",
    forex: process.env.FOREX_PROVIDER ?? "frankfurter",
  },
  transport: {
    batchSize: intFromEnv("MARKET_DATA_BATCH_SIZE", 8),
    maxConcurrency: intFromEnv("MARKET_DATA_MAX_CONCURRENCY", 2),
    requestTimeoutMs: intFromEnv("MARKET_DATA_REQUEST_TIMEOUT_MS", 8_000, 100),
    maxRetries: intFromEnv("MARKET_DATA_MAX_RETRIES", 2, 0),
  },
  freshness: {
    asxExpectedDelayMinutes: intFromEnv("ASX_EXPECTED_DELAY_MINUTES", 20),
    asxToleranceMinutes: intFromEnv("ASX_DELAY_TOLERANCE_MINUTES", 10),
    asxStaleAfterMinutes: intFromEnv("ASX_STALE_AFTER_MINUTES", 45),
    generalStaleAfterMinutes: intFromEnv("GENERAL_MARKET_STALE_AFTER_MINUTES", 90),
    cryptoFreshMinutes: intFromEnv("CRYPTO_FRESH_MINUTES", 10),
    cryptoStaleMinutes: intFromEnv("CRYPTO_STALE_MINUTES", 20),
    forexStaleMinutes: intFromEnv("FOREX_STALE_MINUTES", 36 * 60),
    fundamentalsFreshHours: intFromEnv("FUNDAMENTALS_FRESH_HOURS", 36),
    fundamentalsStaleHours: intFromEnv("FUNDAMENTALS_STALE_HOURS", 72),
  },
  schedules: {
    asxTradingMinutes: intFromEnv("ASX_REFRESH_MINUTES", 30),
    globalIndicesMinutes: intFromEnv("GLOBAL_INDICES_REFRESH_MINUTES", 30),
    forexMinutes: intFromEnv("FOREX_REFRESH_MINUTES", 60),
    cryptoMinutes: intFromEnv("CRYPTO_REFRESH_MINUTES", 15),
    fundamentalsHours: intFromEnv("FUNDAMENTALS_REFRESH_HOURS", 24),
    marketStatusMinutes: intFromEnv("MARKET_STATUS_REFRESH_MINUTES", 5),
  },
  demoEnabled: process.env.ENABLE_DEMO_MARKET_DATA === "true" && process.env.NODE_ENV !== "production",
} as const;
