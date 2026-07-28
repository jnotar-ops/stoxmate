# StoxMate market-data providers

Last verified: 2026-07-28

This register separates technical API access from permission to display, cache,
store, or redistribute data. Founder approval is required before the closed
beta becomes public or paid.

## Provider register

| Provider | Categories | Phase 1 plan | Commercial use | Redistribution | Delay / cadence | Attribution | Storage / caching |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Twelve Data | ASX equities, global indices, available commodities | Basic/free personal tier, 800 credits/day and 8 credits/second | Not confirmed; closed beta only | Not licensed | ASX expected ~15–20 minutes; ingested conservatively | Required in API/UI | Founder must confirm plan terms |
| CoinGecko | BTC, ETH, SOL, XRP in AUD | Free/demo unless `COINGECKO_API_KEY` selects Pro | Treated as permitted for this closed-beta scale by the Phase 1 brief | Founder must confirm before public launch | 15-minute ingestion; freshness thresholds 10/20 minutes | “Crypto market data provided by CoinGecko” | Founder must confirm selected account terms |
| Frankfurter | AUD/USD, AUD/NZD, AUD/EUR, AUD/GBP, AUD/JPY, AUD/CNY | Free, keyless v2 API | Frankfurter states commercial use is permitted; underlying source terms still apply | Confirm underlying provider terms | Daily reference rates, checked hourly on trading days | “Foreign-exchange reference rates provided by Frankfurter” | Cache daily reference observations |

Relevant primary documentation:

- Twelve Data `/quote` and batching documentation: each symbol consumes one API
  credit even when batched.
- CoinGecko `/coins/markets`: `ids` lookup with `vs_currency=aud`.
- Frankfurter v2 `/rates`: keyless daily reference rates with base/quote filters.

## Closed-beta restrictions

- Every ASX screen renders `LegalComplianceFooter`.
- `licenseTier = personal_beta` is stored for Twelve Data quotes and provider
  metadata.
- ASX values are labelled `delayed_15_20min`, never real-time.
- The API exposes attribution and timestamps without exposing raw payloads.
- The provider factory contains the required commercial-upgrade TODO.

## Founder confirmations still required

1. Confirm Twelve Data permits the exact invite-only beta audience, display,
   caching duration, database storage, and screenshots.
2. Confirm CoinGecko account tier, attribution wording, storage, and
   redistribution rights.
3. Confirm the underlying central-bank-provider terms selected by Frankfurter.
4. Approve a paid ASX redistribution licence before any public or paid launch.
5. Confirm whether Twelve Data free-tier index and commodity symbols are
   enabled on the actual account.

## Known unavailable or deferred data

- Iron ore and lithium: `UNAVAILABLE_PENDING_PROVIDER`; no quote is fabricated.
- Twelve Data fundamentals: adapter contract and nullable storage are present,
  but the Phase 1 free-tier implementation returns `PLAN_RESTRICTION`.
- Historical storage is daily (`1D`) only; intraday history is deliberately
  excluded.
- A maintained ASX holiday set or exchange-calendar provider is still required
  for comprehensive holiday coverage. The service supports injecting holidays
  and handles the Australia/Sydney IANA zone and daylight saving.
