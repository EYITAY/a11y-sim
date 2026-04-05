import path from 'node:path';
import { appendFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = Number(process.env.PORT || 8787);
const paidSessionInsightsCache = new Map();
const reportSessionTtlMinutes = Number(process.env.REPORT_SESSION_TTL_MINUTES || 15);
const reportSessionTtlSeconds = Math.max(1, reportSessionTtlMinutes) * 60;
const analyticsLogPath = path.join(projectRoot, 'server', 'data', 'events.ndjson');
const analyticsEvents = [];
const maxInMemoryEvents = 2000;
const analyticsAdminKey = process.env.VITE_ANALYTICS_ADMIN_KEY || '';
const databaseUrl = process.env.DATABASE_URL || '';
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false }) : null;

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-analytics-key');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const SYSTEM_INSTRUCTION = `You are "A11y-GPT", an expert UI/UX accessibility specialist integrated into a design analysis tool. Your personality is helpful, encouraging, and professional. Your task is to provide a detailed and comprehensive accessibility report based on the user's provided color palette and context.

**Report Requirements:**
- **Format:** Use markdown for clear structure. Use headings (e.g., "### Overall Summary"), bold text, and bullet points (using "*").
- **Overall Summary:** Start with a brief, high-level overview of the palette's accessibility.
- **Color-by-Color Breakdown:** For each foreground color, provide a detailed analysis.
  - State the contrast ratio clearly.
  - Explicitly state if it PASSES or FAILS the target WCAG level.
  - If it fails, explain *why* (e.g., "lacks sufficient contrast against the light background, making it difficult for users with low vision to read").
  - Provide at least one, and preferably two, specific, accessible color suggestions (as hex codes) to replace the failing color.
- **Positive Feedback:** Highlight any colors that have excellent contrast or work well together.
- **General Recommendations:** Conclude with a section of general, actionable advice for creating more accessible designs, such as considering font weights, a note on color-blindness, or the importance of interactive element states.

Begin the report now.`;

const buildAnalysisPrompt = ({ foregroundColors, backgroundColor, wcagLevel, imageProvided }) => {
  const imageContext = imageProvided
    ? 'The user has also uploaded an image, so the analysis should consider how colors might appear over complex backgrounds.'
    : 'The user has not provided an image, so the analysis should be based on the color palette alone against the background color.';

  return `
**Analysis Details:**
- **WCAG Target:** ${wcagLevel}
- **Background Color:** ${backgroundColor}
- **Foreground Colors:** ${foregroundColors.join(', ')}
- **Context:** ${imageContext}
`;
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured on the server');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const isSessionWithinTtl = (checkoutSession) => {
  if (!checkoutSession || typeof checkoutSession.created !== 'number') {
    return false;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds - checkoutSession.created <= reportSessionTtlSeconds;
};

const trimValue = (value, maxLength = 120) => {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLength);
};

const sanitizeMetadata = (metadata = {}) => {
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(metadata)) {
    const key = trimValue(rawKey, 40).replace(/[^a-zA-Z0-9_]/g, '_');
    const value = trimValue(String(rawValue), 500);
    if (key && value) {
      result[key] = value;
    }
  }
  return result;
};

const ensureAnalyticsAuthorized = (req, res) => {
  if (!analyticsAdminKey) {
    res.status(503).json({ error: 'ANALYTICS_ADMIN_KEY is not configured on the server.' });
    return false;
  }

  const suppliedKeyHeader = req.headers['x-analytics-key'];
  const suppliedKey = Array.isArray(suppliedKeyHeader) ? suppliedKeyHeader[0] : suppliedKeyHeader;

  if (!suppliedKey || suppliedKey !== analyticsAdminKey) {
    res.status(401).json({ error: 'Unauthorized analytics access.' });
    return false;
  }

  return true;
};

const readLocalAnalyticsEvents = async () => {
  try {
    const raw = await readFile(analyticsLogPath, 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [...analyticsEvents];
  }
};

const readAnalyticsEvents = async () => {
  if (sql) {
    const rows = await sql`
      select
        event_name,
        properties,
        context,
        page_path,
        occurred_at,
        received_at,
        ip_hint,
        geo
      from analytics_events
      order by received_at desc
      limit 500
    `;

    return rows.map((row) => ({
      eventName: row.event_name,
      properties: row.properties ?? {},
      context: row.context ?? null,
      pagePath: row.page_path,
      occurredAt: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : row.occurred_at,
      receivedAt: row.received_at instanceof Date ? row.received_at.toISOString() : row.received_at,
      ipAddress: row.ip_address ?? '',
      ipHashHint: row.ip_hint ?? '',
      geo: row.geo ?? {},
    }));
  }

  const localEvents = await readLocalAnalyticsEvents();
  return localEvents.slice(-500).reverse();
};

const buildAnalyticsSummary = (events, note) => {
  const sourceCounts = {};
  const eventCounts = {};
  const countryCounts = {};
  const cityCounts = {};
  const currencies = {};
  let totalPayments = 0;
  let totalAmount = 0;

  for (const event of events) {
    eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;

    const source = event.context?.lastTouch?.source || event.context?.firstTouch?.source;
    if (source) {
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }

    const country = event.geo?.country;
    if (country) {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }

    const city = event.geo?.city;
    if (city) {
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }

    if (event.eventName === 'checkout_session_created') {
      totalPayments += 1;

      const amount = Number(event.properties?.amount || 0);
      if (Number.isFinite(amount)) {
        totalAmount += amount;
      }

      const currency = typeof event.properties?.currency === 'string' ? event.properties.currency : '';
      if (currency) {
        currencies[currency] = (currencies[currency] || 0) + 1;
      }
    }
  }

  return {
    totals: {
      events: events.length,
      sources: Object.keys(sourceCounts).length,
    },
    sourceCounts,
    eventCounts,
    countryCounts,
    cityCounts,
    paymentStats: {
      totalPayments,
      totalAmount,
      currencies,
    },
    note,
  };
};

const logAnalyticsEvent = async (event) => {
  analyticsEvents.push(event);
  if (analyticsEvents.length > maxInMemoryEvents) {
    analyticsEvents.shift();
  }

  if (sql) {
    await sql`
      insert into analytics_events (
        event_name,
        properties,
        context,
        page_path,
        occurred_at,
        received_at,
          ip_address,
        ip_hint,
        geo
      ) values (
        ${event.eventName},
        ${sql.json(event.properties ?? {})},
        ${event.context ? sql.json(event.context) : null},
        ${event.pagePath},
        ${event.occurredAt},
        ${event.receivedAt},
          ${event.ipAddress ?? ''},
        ${event.ipHashHint ?? ''},
        ${sql.json(event.geo ?? {})}
      )
    `;
    return;
  }

  try {
    await appendFile(analyticsLogPath, `${JSON.stringify(event)}\n`, 'utf8');
  } catch {
    // Avoid blocking request flow if log writes fail.
  }
};

app.post('/api/track', async (req, res) => {
  try {
    const { eventName, properties, context, pagePath, occurredAt } = req.body ?? {};

    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    // Get IP address
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
    let geo = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,query`);
      const geoData = await geoRes.json();
      if (geoData.status === 'success') {
        geo = { country: geoData.country, city: geoData.city, ip: geoData.query };
      }
    } catch {}

    const event = {
      eventName: trimValue(eventName, 80),
      properties: typeof properties === 'object' && properties !== null ? properties : {},
      context: typeof context === 'object' && context !== null ? context : null,
      pagePath: trimValue(typeof pagePath === 'string' ? pagePath : '/', 300),
      occurredAt: typeof occurredAt === 'string' ? occurredAt : new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      ipAddress: trimValue(ip, 120),
      ipHashHint: trimValue(ip, 120),
      geo,
    };

    await logAnalyticsEvent(event);
    return res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/analytics-summary', async (req, res) => {
  if (!ensureAnalyticsAuthorized(req, res)) {
    return;
  }

  try {
    if (sql) {
      const [totalsRow] = await sql`
        select
          count(*)::int as total_events,
          count(distinct coalesce(context->'lastTouch'->>'source', context->'firstTouch'->>'source'))::int as total_sources
        from analytics_events
      `;

      const sourceRows = await sql`
        select
          coalesce(context->'lastTouch'->>'source', context->'firstTouch'->>'source') as label,
          count(*)::int as count
        from analytics_events
        where coalesce(context->'lastTouch'->>'source', context->'firstTouch'->>'source') is not null
        group by label
      `;

      const eventRows = await sql`
        select event_name as label, count(*)::int as count
        from analytics_events
        group by event_name
      `;

      const countryRows = await sql`
        select geo->>'country' as label, count(*)::int as count
        from analytics_events
        where geo->>'country' is not null and geo->>'country' <> ''
        group by label
      `;

      const cityRows = await sql`
        select geo->>'city' as label, count(*)::int as count
        from analytics_events
        where geo->>'city' is not null and geo->>'city' <> ''
        group by label
      `;

      const [paymentRow] = await sql`
        select
          count(*)::int as total_payments,
          coalesce(sum((properties->>'amount')::bigint), 0)::bigint as total_amount
        from analytics_events
        where event_name = 'checkout_session_created'
      `;

      const currencyRows = await sql`
        select properties->>'currency' as label, count(*)::int as count
        from analytics_events
        where event_name = 'checkout_session_created'
          and properties->>'currency' is not null
          and properties->>'currency' <> ''
        group by label
      `;

      return res.json({
        totals: {
          events: totalsRow?.total_events ?? 0,
          sources: totalsRow?.total_sources ?? 0,
        },
        sourceCounts: Object.fromEntries(sourceRows.map((row) => [row.label, row.count])),
        eventCounts: Object.fromEntries(eventRows.map((row) => [row.label, row.count])),
        countryCounts: Object.fromEntries(countryRows.map((row) => [row.label, row.count])),
        cityCounts: Object.fromEntries(cityRows.map((row) => [row.label, row.count])),
        paymentStats: {
          totalPayments: paymentRow?.total_payments ?? 0,
          totalAmount: Number(paymentRow?.total_amount ?? 0),
          currencies: Object.fromEntries(currencyRows.map((row) => [row.label, row.count])),
        },
        note: 'Summary is backed by Neon Postgres via DATABASE_URL.',
      });
    }

    const events = await readLocalAnalyticsEvents();
    return res.json(
      buildAnalyticsSummary(
        events,
        'Summary is based on local analytics events. Configure DATABASE_URL to persist analytics in Neon for production.'
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics summary.';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/analytics-events', async (req, res) => {
  if (!ensureAnalyticsAuthorized(req, res)) {
    return;
  }

  try {
    const events = await readAnalyticsEvents();
    return res.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics events.';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { sessionId, foregroundColors, backgroundColor, wcagLevel, imageProvided } = req.body ?? {};

    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const isPaidSession = checkoutSession.payment_status === 'paid' && checkoutSession.mode === 'payment';
    const isFreshSession = isSessionWithinTtl(checkoutSession);

    if (!isPaidSession) {
      return res.status(402).json({ error: 'A paid checkout session is required before AI analysis.' });
    }

    if (!isFreshSession) {
      return res.status(410).json({ error: 'This paid session has expired. Please start a new checkout to generate AI insights.' });
    }

    const cachedInsights = paidSessionInsightsCache.get(sessionId);
    if (cachedInsights) {
      return res.json({ text: cachedInsights });
    }

    if (!Array.isArray(foregroundColors) || foregroundColors.length === 0 || typeof backgroundColor !== 'string' || !['AA', 'AAA'].includes(wcagLevel)) {
      return res.status(400).json({ error: 'Invalid analysis payload' });
    }

    const prompt = buildAnalysisPrompt({
      foregroundColors,
      backgroundColor,
      wcagLevel,
      imageProvided: Boolean(imageProvided),
    });

    const genAI = getGeminiClient();
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const generatedText = response.text ?? '';
    paidSessionInsightsCache.set(sessionId, generatedText);

    return res.json({ text: generatedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/checkout-session', async (req, res) => {
  try {
    const stripe = getStripeClient();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const clientMetadata = sanitizeMetadata(req.body?.metadata);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      client_reference_id: clientMetadata.visitor_id || undefined,
      metadata: {
        ...clientMetadata,
      },
      line_items: [
        {
          price: 'price_1TCmWwGvBtnC6CHU9k1KKmfd', // Live price ID
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment_canceled=true`,
    });

    await logAnalyticsEvent({
      eventName: 'checkout_session_created',
      properties: {
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
      },
      context: {
        metadata: clientMetadata,
      },
      pagePath: '/api/checkout-session',
      occurredAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    });

    return res.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/verify-unlock', async (req, res) => {
  try {
    const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
    if (!sessionId) {
      return res.status(400).json({ unlocked: false, error: 'session_id is required' });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const unlocked = session.payment_status === 'paid' && session.mode === 'payment';
    const isFreshSession = isSessionWithinTtl(session);

    return res.json({ unlocked: unlocked && isFreshSession });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ unlocked: false, error: message });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(projectRoot, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`A11y Sim API server running on port ${port}`);
});
