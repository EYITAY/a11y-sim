type Touchpoint = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  referrer: string;
  landingPath: string;
  timestamp: string;
};

type AnalyticsContext = {
  visitorId: string;
  firstTouch: Touchpoint;
  lastTouch: Touchpoint;
};

type EventProperties = Record<string, string | number | boolean | null | undefined>;

const VISITOR_ID_KEY = 'a11yVisitorId';
const FIRST_TOUCH_KEY = 'a11yFirstTouch';
const LAST_TOUCH_KEY = 'a11yLastTouch';

function getApiBaseUrl(): string {
  const envBase = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL;
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return '';
  }

  return 'http://localhost:8787';
}

function safeWindow(): Window | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window;
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildTouchpoint(): Touchpoint {
  const browserWindow = safeWindow();
  const params = new URLSearchParams(browserWindow?.location.search ?? '');
  return {
    source: params.get('utm_source') ?? '(direct)',
    medium: params.get('utm_medium') ?? '(none)',
    campaign: params.get('utm_campaign') ?? '(none)',
    term: params.get('utm_term') ?? '(none)',
    content: params.get('utm_content') ?? '(none)',
    referrer: browserWindow?.document.referrer || '(none)',
    landingPath: browserWindow ? `${browserWindow.location.pathname}${browserWindow.location.search}` : '/',
    timestamp: new Date().toISOString(),
  };
}

function readTouchpoint(key: string): Touchpoint | null {
  const browserWindow = safeWindow();
  if (!browserWindow) return null;
  const raw = browserWindow.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Touchpoint;
  } catch {
    return null;
  }
}

function writeTouchpoint(key: string, value: Touchpoint): void {
  const browserWindow = safeWindow();
  if (!browserWindow) return;
  browserWindow.localStorage.setItem(key, JSON.stringify(value));
}

export function initializeAnalytics(): void {
  const browserWindow = safeWindow();
  if (!browserWindow) return;

  if (!browserWindow.localStorage.getItem(VISITOR_ID_KEY)) {
    browserWindow.localStorage.setItem(VISITOR_ID_KEY, randomId());
  }

  const currentTouch = buildTouchpoint();
  const existingFirstTouch = readTouchpoint(FIRST_TOUCH_KEY);
  if (!existingFirstTouch) {
    writeTouchpoint(FIRST_TOUCH_KEY, currentTouch);
  }

  writeTouchpoint(LAST_TOUCH_KEY, currentTouch);
}

export function getAnalyticsContext(): AnalyticsContext | null {
  const browserWindow = safeWindow();
  if (!browserWindow) return null;

  const visitorId = browserWindow.localStorage.getItem(VISITOR_ID_KEY);
  const firstTouch = readTouchpoint(FIRST_TOUCH_KEY);
  const lastTouch = readTouchpoint(LAST_TOUCH_KEY);

  if (!visitorId || !firstTouch || !lastTouch) {
    return null;
  }

  return { visitorId, firstTouch, lastTouch };
}

export function getAttributionMetadata(): Record<string, string> {
  const context = getAnalyticsContext();
  if (!context) {
    return {};
  }

  return {
    visitor_id: context.visitorId,
    first_source: context.firstTouch.source,
    first_medium: context.firstTouch.medium,
    first_campaign: context.firstTouch.campaign,
    first_referrer: context.firstTouch.referrer,
    last_source: context.lastTouch.source,
    last_medium: context.lastTouch.medium,
    last_campaign: context.lastTouch.campaign,
    last_referrer: context.lastTouch.referrer,
  };
}

export async function trackEvent(eventName: string, properties: EventProperties = {}): Promise<void> {
  const browserWindow = safeWindow();
  if (!browserWindow) return;

  const context = getAnalyticsContext();

  await fetch(`${getApiBaseUrl()}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      properties,
      context,
      pagePath: `${browserWindow.location.pathname}${browserWindow.location.search}`,
      occurredAt: new Date().toISOString(),
    }),
  }).catch(() => {
    // non-blocking analytics
  });
}
