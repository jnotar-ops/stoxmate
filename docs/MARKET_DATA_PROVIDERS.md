# StoxMate market-data providers

Last verified: 2026-07-28

This register separates technical API access from permission to display, cache,
store, or redistribute data. Founder approval is required before the closed
beta becomes public or paid.

## Provider register

| Provider | Categories | Phase 1 plan | Commercial use | Delay / cadence | Attribution |
| --- | --- | --- | --- | --- | --- |
| Marketstack | ASX equities | Free evaluation tier, 100 billed symbol-requests/month | No | End-of-day only | “End-of-day equity data provided by Marketstack” |
| Twelve Data | Standby adapter only | Basic/free personal tier | No | Not active; ASX unavailable on the tested account | Retained for a future upgraded account |
| CoinGecko | BTC, ETH, SOL, XRP in AUD | Free/demo unless `COINGECKO_API_KEY` selects Pro | Founder must confirm | Daily Hobby cron | “Crypto market data provided by CoinGecko” |
| Frankfurter | Six AUD reference pairs | Free, keyless v2 API | Frankfurter states commercial use is permitted; source terms still apply | Daily reference rates | “Foreign-exchange reference rates provided by Frankfurter” |

Primary documentation:

- [Marketstack pricing](https://marketstack.com/pricing): Free currently
  includes 100 requests/month, EOD equity data, and one year of history. It
  excludes commercial use, indices, commodities, and company
  facts/fundamentals.
- [Marketstack EOD endpoint](https://www.postman.com/apilayer/apilayer/request/53u3266/basic-end-of-day-data):
  accepts up to 100 comma-separated symbols in one HTTP request, but each symbol
  consumes one billed request.
- CoinGecko `/coins/markets`: `ids` lookup with `vs_currency=aud`.
- Frankfurter v2 `/rates`: keyless daily reference rates with base/quote
  filters.

## Marketstack classification

- Every Marketstack quote is stored with `delayClassification = end_of_day`.
- `providerTimestamp` is the trading-date timestamp returned by Marketstack.
- `fetchedAt` records when StoxMate retrieved the observation.
- EOD observations remain fresh for up to 96 hours so a Friday close remains
  usable over a normal weekend.
- `licenseTier = personal_beta` records that the Free tier is not approved for
  commercial display.
- No Marketstack data is described as real-time or delayed 15–20 minutes.

## Free-tier capacity and coverage

Last checked against the public pricing and API documentation on 2026-07-28:

- Free quota: 100 billed symbol-requests/month.
- Batch transport: up to 100 symbols in one HTTP request.
- Billing: a 20-symbol batch consumes 20 requests, not one request.
- Daily 20-equity refresh: approximately 600 requests in a 30-day month, so it
  does not fit the Free quota. The checked-in cron performs four complete
  refreshes per month (80 requests) and reserves 20 for one manual verification
  run.
- Stock indices require Basic or above.
- Commodity prices require Professional or above.
- Company facts/fundamentals require Business or above. The advertised company
  facts endpoints are SEC/US-oriented and are not verified for ASX.
- A live `tickerinfo?ticker=BHP.AX` check returned descriptive company metadata
  (sector, industry, employees, dates, address, and exchange listings), but no
  P/E, EPS, dividend yield, market cap, or 52-week high/low fields required by
  StoxMate's fundamentals contract. The adapter therefore keeps those fields
  unavailable instead of fabricating or partially mapping them.
- Commercial use starts on a paid plan; exchange-specific ASX display and
  redistribution rights still require legal confirmation.

The account dashboard remains the final authority for the quota attached to a
specific key. A live Production-key check on 2026-07-28 confirmed that a
20-symbol `/v2/eod/latest` batch returned all 20 configured ASX equities in
AUD, with exchange MIC `XASX` and an EOD observation date of 2026-07-27.

## Adapter behavior

- The adapter sends the 20 ASX equities in one `/v2/eod/latest` HTTP request.
- Marketstack-specific symbols are derived locally as `<ticker>.AX`; the
  canonical registry and Twelve Data symbols are not rewritten.
- Missing EOD rows become per-symbol `UNSUPPORTED_SYMBOL` errors.
- Free-tier indices, commodities, and fundamentals become per-instrument
  `UNAVAILABLE_PENDING_PROVIDER` errors without quota-consuming API calls.
- The Free adapter can therefore return at most 20/32 quote records: 20 ASX
  equities, zero of eight indices, and zero of four configured commodities.
- Iron ore and lithium remain `UNAVAILABLE_PENDING_PROVIDER`.
- Market status uses StoxMate’s Australia/Sydney ASX-hours calculation.
- Historical storage remains daily (`1D`) only.

## Founder confirmations still required

1. Confirm the account dashboard's remaining monthly quota after each manual
   verification run.
2. Keep a refresh cadence that fits the plan. Once-daily ASX ingestion needs
   at least 600 billed symbol-requests/month before retries.
3. Confirm Marketstack and ASX permit the invite-only audience, display,
   screenshots, caching duration, and database storage.
4. Confirm CoinGecko account attribution, storage, and redistribution terms.
5. Confirm the underlying central-bank source terms used by Frankfurter.
6. Approve an eligible commercial market-data and ASX licence before public or
   paid launch.
