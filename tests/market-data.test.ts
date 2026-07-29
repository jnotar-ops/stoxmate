import assert from "node:assert/strict";
import test from "node:test";
import asxSuccess from "./fixtures/twelve-asx-success.json";
import indexSuccess from "./fixtures/twelve-index-success.json";
import forexSuccess from "./fixtures/twelve-forex-success.json";
import commoditySuccess from "./fixtures/twelve-commodity-success.json";
import marketstackEodSuccess from "./fixtures/marketstack-eod-success.json";
import coinGeckoSuccess from "./fixtures/coingecko-success.json";
import invalidKey from "./fixtures/invalid-api-key.json";
import rateLimit from "./fixtures/rate-limit.json";
import unsupported from "./fixtures/unsupported-symbol.json";
import malformed from "./fixtures/malformed-payload.json";
import { calculateFreshnessStatus, staleCopy } from "../src/lib/market-data/freshness";
import { mapCoinGeckoMarket, mapMarketstackEodQuote, mapTwelveDataQuote } from "../src/lib/market-data/mappers";
import { ASX_SESSION, calculateMarketStatus } from "../src/lib/market-data/market-status";
import { getInstrument, getInstrumentByProviderSymbol, getInstruments } from "../src/lib/market-data/registry";
import { classifyProviderError, ProviderHttpError } from "../src/lib/market-data/providers/http";
import { toPublicIngestionError } from "../src/lib/market-data/route-errors";
import { calculatePercentageChange } from "../src/lib/market-data/validation";

const fetchedAt = new Date("2026-07-28T04:31:00.000Z");

test("canonical registry contains the complete Phase 1 universe and provider IDs", () => {
  assert.equal(getInstruments("EQUITY").length, 20);
  assert.equal(getInstrument("BTC")?.providerSymbol, "bitcoin");
  assert.equal(getInstrumentByProviderSymbol("ripple")?.canonicalSymbol, "XRP");
  assert.equal(getInstrument("IRON_ORE")?.status, "UNAVAILABLE_PENDING_PROVIDER");
});

test("Twelve Data maps ASX, index, forex and commodity fixtures", () => {
  const cases = [
    [asxSuccess, getInstrument("BHP")!],
    [indexSuccess, getInstrument("SP500")!],
    [forexSuccess, getInstrument("AUDUSD")!],
    [commoditySuccess, getInstrument("GOLD")!],
  ] as const;
  for (const [fixture, instrument] of cases) {
    const mapped = mapTwelveDataQuote(fixture, instrument, fetchedAt);
    assert.ok(mapped.record);
    assert.equal(mapped.record.canonicalSymbol, instrument.canonicalSymbol);
    assert.equal(mapped.record.currency, instrument.currency);
    assert.notEqual(mapped.record.rawPayloadHash, null);
  }
  const asx = mapTwelveDataQuote(asxSuccess, getInstrument("BHP")!, fetchedAt);
  assert.equal(asx.record?.delayClassification, "delayed_15_20min");
  assert.equal(asx.record?.licenseTier, "personal_beta");
  assert.notEqual(asx.record?.freshnessStatus, "FRESH");
});

test("CoinGecko mapping uses asset IDs and AUD market values", () => {
  const mapped = mapCoinGeckoMarket(coinGeckoSuccess[0], getInstrument("BTC")!, fetchedAt);
  assert.equal(mapped.record?.canonicalSymbol, "BTC");
  assert.equal(mapped.record?.currency, "AUD");
  assert.equal(mapped.record?.price, "183456.12");
  assert.equal(mapped.record?.marketCap, "3650123456789");
});

test("Marketstack maps ASX EOD rows with end-of-day provenance", () => {
  const raw = marketstackEodSuccess.data[0];
  const instrument = { ...getInstrument("BHP")!, providerSymbol: "BHP.AX" };
  const mapped = mapMarketstackEodQuote(raw, instrument, new Date("2026-07-28T06:00:00.000Z"));
  assert.ok(mapped.record);
  assert.equal(mapped.record.canonicalSymbol, "BHP");
  assert.equal(mapped.record.price, "41.67");
  assert.equal(mapped.record.provider, "marketstack");
  assert.equal(mapped.record.delayClassification, "end_of_day");
  assert.equal(mapped.record.delayMinutes, null);
  assert.equal(mapped.record.marketStatus, "CLOSED");
  assert.equal(mapped.record.freshnessStatus, "FRESH");
});

test("Marketstack rejects mismatched exchanges", () => {
  const instrument = { ...getInstrument("BHP")!, providerSymbol: "BHP.AX" };
  const raw = {
    ...marketstackEodSuccess.data[0],
    exchange: "XNYS",
    exchange_code: "NYSE",
  };
  const mapped = mapMarketstackEodQuote(raw, instrument, new Date("2026-07-28T06:00:00.000Z"));
  assert.equal(mapped.error?.code, "EXCHANGE_MISMATCH");
});

test("provider errors inside HTTP 200 responses are classified without retries for auth/symbol failures", () => {
  assert.equal(mapTwelveDataQuote(invalidKey, getInstrument("BHP")!, fetchedAt).error?.code, "INVALID_API_KEY");
  assert.equal(mapTwelveDataQuote(invalidKey, getInstrument("BHP")!, fetchedAt).error?.retryable, false);
  assert.equal(mapTwelveDataQuote(rateLimit, getInstrument("BHP")!, fetchedAt).error?.retryable, true);
  assert.equal(mapTwelveDataQuote(unsupported, getInstrument("BHP")!, fetchedAt).error?.retryable, false);
  assert.equal(mapTwelveDataQuote(malformed, getInstrument("BHP")!, fetchedAt).error?.code, "MALFORMED_PAYLOAD");
});

test("unsupported CoinGecko IDs fail only that instrument (partial-batch behavior)", () => {
  const btc = mapCoinGeckoMarket(coinGeckoSuccess[0], getInstrument("BTC")!, fetchedAt);
  const eth = mapCoinGeckoMarket(undefined, getInstrument("ETH")!, fetchedAt);
  const records = [btc, eth].flatMap((result) => result.record ? [result.record] : []);
  const errors = [btc, eth].flatMap((result) => result.error ? [result.error] : []);
  assert.equal(records.length, 1);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, "UNSUPPORTED_SYMBOL");
});

test("percentage changes are decimal-safe and null fundamentals remain null", () => {
  assert.deepEqual(calculatePercentageChange("42.50", "42.00"), {
    absoluteChange: "0.5",
    percentageChange: "1.1904761904761904762",
  });
  const fundamentals = { peRatio: null, eps: null, dividendYield: null };
  assert.equal(fundamentals.peRatio, null);
  assert.equal(fundamentals.eps, null);
});

test("freshness and stale fallback keep old values visible with an explicit state", () => {
  const status = calculateFreshnessStatus({
    assetClass: "CRYPTO",
    providerTimestamp: new Date("2026-07-28T04:00:00.000Z"),
    fetchedAt: new Date("2026-07-28T04:01:00.000Z"),
    now: fetchedAt,
    delayClassification: "real_time",
  });
  assert.equal(status, "STALE");
  assert.equal(staleCopy(status), "Latest provider refresh unavailable");
});

test("end-of-day freshness tolerates a normal weekend but eventually becomes stale", () => {
  const base = {
    assetClass: "EQUITY" as const,
    providerTimestamp: new Date("2026-07-24T00:00:00.000Z"),
    fetchedAt: new Date("2026-07-24T07:00:00.000Z"),
    delayClassification: "end_of_day" as const,
  };
  assert.equal(calculateFreshnessStatus({ ...base, now: new Date("2026-07-27T06:00:00.000Z") }), "FRESH");
  assert.equal(calculateFreshnessStatus({ ...base, now: new Date("2026-07-29T06:00:00.000Z") }), "STALE");
});

test("ASX sessions handle weekends, holidays and daylight-saving offsets", () => {
  assert.equal(calculateMarketStatus(new Date("2026-01-15T00:30:00.000Z")), "OPEN");
  assert.equal(calculateMarketStatus(new Date("2026-07-15T00:30:00.000Z")), "OPEN");
  assert.equal(calculateMarketStatus(new Date("2026-07-18T00:30:00.000Z")), "CLOSED");
  const holidaySession = { ...ASX_SESSION, holidays: new Set(["2026-07-15"]) };
  assert.equal(calculateMarketStatus(new Date("2026-07-15T00:30:00.000Z"), holidaySession), "CLOSED");
});

test("retry classification retries transient failures only", () => {
  assert.deepEqual(
    classifyProviderError(new ProviderHttpError("rate limited", 429, true)),
    { code: "RATE_LIMITED", message: "rate limited", retryable: true },
  );
  assert.equal(classifyProviderError(new ProviderHttpError("forbidden", 403, false)).retryable, false);
  const timeout = new Error("aborted");
  timeout.name = "AbortError";
  assert.equal(classifyProviderError(timeout).retryable, true);
});

test("ingestion route errors expose nested diagnostics without leaking connection URLs", () => {
  const cause = Object.assign(
    new Error("getaddrinfo ENOTFOUND base at postgresql://user:password@base/db"),
    { code: "ENOTFOUND", hostname: "base" },
  );
  const error = new Error("Failed query: insert into ingestion_runs", { cause });
  assert.deepEqual(toPublicIngestionError(error), {
    message: "Failed query: insert into ingestion_runs",
    cause: {
      message: "getaddrinfo ENOTFOUND base at [redacted-url]",
      code: "ENOTFOUND",
      hostname: "base",
    },
  });
});
