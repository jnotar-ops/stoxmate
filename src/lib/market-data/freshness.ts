import { marketDataConfig } from "./config";
import type { AssetClass, DelayClassification, FreshnessStatus } from "./types";

export interface FreshnessInput {
  assetClass: AssetClass;
  providerTimestamp: Date | null;
  fetchedAt: Date;
  now?: Date;
  delayClassification: DelayClassification;
  delayMinutes?: number | null;
}

export function calculateFreshnessStatus(input: FreshnessInput): FreshnessStatus {
  if (input.delayClassification === "unavailable") return "UNAVAILABLE";

  const now = input.now ?? new Date();
  const reference = input.providerTimestamp ?? input.fetchedAt;
  const ageMinutes = Math.max(0, (now.getTime() - reference.getTime()) / 60_000);

  if (input.assetClass === "CRYPTO") {
    if (ageMinutes <= marketDataConfig.freshness.cryptoFreshMinutes) return "FRESH";
    return ageMinutes > marketDataConfig.freshness.cryptoStaleMinutes ? "STALE" : "DELAYED";
  }

  if (input.assetClass === "FOREX") {
    return ageMinutes <= marketDataConfig.freshness.forexStaleMinutes ? "FRESH" : "STALE";
  }

  if (input.delayClassification === "delayed_15_20min") {
    const expected = input.delayMinutes ?? marketDataConfig.freshness.asxExpectedDelayMinutes;
    if (ageMinutes <= expected + marketDataConfig.freshness.asxToleranceMinutes) return "DELAYED";
    return ageMinutes > marketDataConfig.freshness.asxStaleAfterMinutes ? "STALE" : "DELAYED";
  }

  return ageMinutes <= marketDataConfig.freshness.generalStaleAfterMinutes ? "FRESH" : "STALE";
}

export function staleCopy(status: FreshnessStatus): string | null {
  if (status === "STALE") return "Latest provider refresh unavailable";
  if (status === "UNAVAILABLE") return "Data unavailable from the configured provider";
  return null;
}
