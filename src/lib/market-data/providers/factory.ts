import "server-only";
import { marketDataConfig } from "../config";
import type { CryptoDataProvider, ForexDataProvider, MarketDataProvider } from "../types";
import { CoinGeckoProvider } from "./coingecko";
import { FrankfurterProvider } from "./frankfurter";
import { TwelveDataProvider } from "./twelve-data";

export function getMarketDataProvider(): MarketDataProvider {
  if (marketDataConfig.providers.market !== "twelve_data") {
    throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${marketDataConfig.providers.market}`);
  }
  // TODO: replace with licensed commercial provider before public launch.
  return new TwelveDataProvider();
}

export function getCryptoDataProvider(): CryptoDataProvider {
  if (marketDataConfig.providers.crypto !== "coingecko") {
    throw new Error(`Unsupported CRYPTO_DATA_PROVIDER: ${marketDataConfig.providers.crypto}`);
  }
  return new CoinGeckoProvider();
}

export function getForexProvider(): ForexDataProvider {
  if (marketDataConfig.providers.forex !== "frankfurter") {
    throw new Error(`Unsupported FOREX_PROVIDER: ${marketDataConfig.providers.forex}`);
  }
  return new FrankfurterProvider();
}
