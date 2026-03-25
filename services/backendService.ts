import { ReportData, WCAGLevel } from '../types';

interface CheckoutPayload {
  metadata?: Record<string, string>;
}

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

function buildApiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

interface AnalyzeRequest {
  sessionId: string;
  foregroundColors: string[];
  backgroundColor: string;
  wcagLevel: WCAGLevel;
  imageProvided: boolean;
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json() as { error?: string };
    if (data?.error) {
      return data.error;
    }
  } catch {
    // No-op: fallback below
  }
  return fallback;
}

export async function requestAiAnalysis(payload: AnalyzeRequest): Promise<string> {
  const response = await fetch(buildApiUrl('/api/analyze'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, 'Failed to generate AI analysis');
    throw new Error(message);
  }

  const data = await response.json() as { text?: string };
  return data.text ?? '';
}

export async function createCheckoutSession(payload: CheckoutPayload = {}): Promise<string> {
  const response = await fetch(buildApiUrl('/api/checkout-session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, 'Failed to create checkout session');
    throw new Error(message);
  }

  const data = await response.json() as { url?: string };
  if (!data.url) {
    throw new Error('Checkout URL was not returned');
  }

  return data.url;
}

export async function verifyReportUnlock(sessionId: string): Promise<boolean> {
  const query = new URLSearchParams({ session_id: sessionId });
  const response = await fetch(buildApiUrl(`/api/verify-unlock?${query.toString()}`), {
    method: 'GET',
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json() as { unlocked?: boolean };
  return Boolean(data.unlocked);
}

export function storePendingReport(reportData: ReportData): void {
  localStorage.setItem('pendingA11yReport', JSON.stringify(reportData));
}

export function readPendingReport(): ReportData | null {
  const pendingReportJSON = localStorage.getItem('pendingA11yReport');
  if (!pendingReportJSON) {
    return null;
  }

  try {
    return JSON.parse(pendingReportJSON) as ReportData;
  } catch {
    return null;
  }
}

export function clearPendingReport(): void {
  localStorage.removeItem('pendingA11yReport');
}
