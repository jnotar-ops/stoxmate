# Market-data operations

## Data flow

Provider adapters validate and normalize external responses, then server-side
ingestion persists canonical instruments, current quotes, daily observations,
fundamentals, runs, and errors. Browser code only calls StoxMate `/api/*`
routes.

## Secured ingestion

All routes accept `Authorization: Bearer $CRON_SECRET` and also support
`x-cron-secret` for an authorised manual scheduler.

- `GET|POST /api/internal/ingest/quotes`
- `GET|POST /api/internal/ingest/quotes?type=forex`
- `GET|POST /api/internal/ingest/crypto`
- `GET|POST /api/internal/ingest/fundamentals`
- `GET|POST /api/internal/ingest/market-status`

POST forces an authorised manual run. Scheduled GET quote runs execute only
during the ASX session or the first 30 minutes after close. The deployed Hobby
cron invokes Marketstack on the quota-safe dates below; the other routes run
daily.

## Vercel schedules

`vercel.json` uses UTC cron expressions:

- Market status: daily at 06:05 UTC.
- Marketstack equity EOD batch: 06:10 UTC on days 1, 8, 15, and 22 each
  month (80 billed symbol-requests).
- Frankfurter forex: daily at 06:15 UTC.
- CoinGecko crypto: daily at 06:20 UTC.
- Fundamentals availability run: daily at 06:30 UTC.

Marketstack bills the EOD batch per symbol. One daily 20-equity batch would
consume about 600 of the Free plan’s 100 monthly requests, despite using only
one HTTP request per day. Four scheduled runs consume 80 requests and reserve
20 for one manual verification run. Do not increase the cadence on Free.

Live verification on 2026-07-28 returned 20/20 configured ASX equities. The
combined quotes job reports 20/32 because all eight configured indices and all
four configured commodities are intentionally unavailable on the Free plan.

## Public API

- `GET /api/market/overview`
- `GET /api/market/instruments?assetClass=&exchange=&region=&symbols=`
- `GET /api/market/instruments/:symbol`
- `GET /api/market/health`

Example instrument response:

```json
{
  "data": {
    "instrument": {
      "canonicalSymbol": "BHP",
      "providerSymbol": "BHP:ASX",
      "assetClass": "EQUITY",
      "currency": "AUD"
    },
    "quote": {
      "price": "42.5000000000",
      "provider": "marketstack",
      "providerTimestamp": "2026-07-27T00:00:00.000Z",
      "fetchedAt": "2026-07-28T06:00:00.000Z",
      "delayClassification": "end_of_day",
      "freshnessStatus": "FRESH",
      "licenseTier": "personal_beta"
    }
  }
}
```

## Deployment

1. Create or select a Supabase Postgres project.
2. Set `DATABASE_URL` to a server-side pooled connection.
3. Apply `drizzle/20260727235324_phase1_market_data_foundation.sql`.
4. Configure every variable in `.env.example` in Vercel; never prefix provider
   keys with `NEXT_PUBLIC_`.
5. Use a random `CRON_SECRET` of at least 16 characters.
6. Confirm the Vercel plan supports the schedules in `vercel.json`.
7. Deploy to production, invoke each ingestion endpoint once, then inspect
   `/api/market/health` and `/api/market/overview`.
8. Check browser network requests: provider domains must not appear.

## Rollback

1. Disable Vercel cron jobs or rotate/remove `CRON_SECRET`.
2. Roll back the application deployment to stop reads/writes against the new
   tables. Vercel Instant Rollback does not update cron registrations, so
   disable or redeploy the cron configuration separately.
3. Preserve the canonical tables for forensic/operational history. They are
   additive and do not need to be dropped for an application rollback.
4. If a full database rollback is approved, take a backup, then drop only the
   Phase 1 tables and the six added legacy provenance columns. Do not drop
   user, portfolio, watchlist, or research tables.

## Production checks

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check:client-secrets
```

Expected browser origins are the StoxMate deployment only. Provider calls exist
only in modules carrying the `server-only` boundary and route handlers use the
Node.js runtime.
