<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/638759fa-1159-4c0d-98e4-821482beac30

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env.local` with:
   - `GEMINI_API_KEY=your_gemini_key`
   - `STRIPE_SECRET_KEY=your_stripe_secret_key`
   - `APP_URL=http://localhost:3000`
   - `REPORT_SESSION_TTL_MINUTES=15`
   - `ANALYTICS_ADMIN_KEY=your_admin_passphrase`
3. Run client + API server:
   `npm run dev`

## Run Tests

To run all automated tests:

`npm test`

Or:

`npx jest --config jest.config.cjs`

## Security Notes

- Gemini requests now run through the backend (`/api/analyze`) so API keys are not exposed in browser bundles.
- Stripe checkout is created on the backend (`/api/checkout-session`).
- Report unlock after redirect is verified via `/api/verify-unlock` using Stripe session status.
- AI generation requires a paid Stripe `session_id`, so Gemini usage only occurs after successful payment.
- Paid sessions expire after `REPORT_SESSION_TTL_MINUTES` (default 15) to reduce session sharing/replay.
- AI markdown is sanitized before rendering in the UI.

## Analytics (Traffic + Funnel)

- Client captures first-touch and last-touch attribution from:
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
   - `document.referrer`
- Client sends funnel events to backend via `POST /api/track`.
- Backend appends events to `server/data/events.ndjson`.
- Quick runtime summary is available at `GET /api/analytics-summary` (protected by `ANALYTICS_ADMIN_KEY`).
- Stripe checkout sessions include attribution metadata so paid conversions can be tied to traffic source.

Tracked funnel events include:
- `app_loaded`
- `simulator_opened`
- `report_prepared`
- `checkout_started`
- `payment_verified`
- `ai_insights_generated`
- failure events for payment verification / AI generation

## Production

1. Build frontend assets:
   `npm run build`
2. Set production env vars (`GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `APP_URL`).
   - Optionally set `REPORT_SESSION_TTL_MINUTES` (defaults to 15).
   - Set `ANALYTICS_ADMIN_KEY` to protect analytics access.
3. Start the unified server (serves `dist` + API):
   `npm run start`
