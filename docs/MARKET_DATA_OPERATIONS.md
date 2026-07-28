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
during the ASX session or the first 30 minutes after close, which keeps the
Twelve Data free-tier call budget conservative.

## Vercel schedules

`vercel.json` uses UTC cron expressions:

- Market quote trigger: every 30 minutes, weekdays; route-level ASX session
  gating prevents closed-session provider calls.
- Forex: hourly at minute 15, weekdays.
- Crypto: every 15 minutes.
- Fundamentals: daily at 18:30 UTC.
- Market status: every 5 minutes, weekdays.

These frequencies require Vercel Pro or an alternative scheduler. Current
Vercel Hobby scheduling permits only once-daily jobs. If the deployment is on
Hobby, remove the sub-daily entries and configure an external scheduler against
the same authenticated routes.

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
      "provider": "twelve_data",
      "providerTimestamp": "2026-07-28T04:10:00.000Z",
      "fetchedAt": "2026-07-28T04:31:00.000Z",
      "delayClassification": "delayed_15_20min",
      "freshnessStatus": "DELAYED",
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
