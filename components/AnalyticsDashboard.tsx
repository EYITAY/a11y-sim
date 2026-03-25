import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

type SummaryResponse = {
  totals?: {
    events?: number;
    sources?: number;
  };
  sourceCounts?: Record<string, number>;
  eventCounts?: Record<string, number>;
  countryCounts?: Record<string, number>;
  cityCounts?: Record<string, number>;
  paymentStats?: {
    totalPayments?: number;
    totalAmount?: number;
    currencies?: Record<string, number>;
  };
  note?: string;
};

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [eventRows, setEventRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const fetchSummary = async (overrideKey?: string) => {
    const keyToUse = overrideKey ?? accessKey;
    if (!keyToUse) {
      setErrorMessage('Enter your analytics passphrase.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analytics-summary', {
        headers: {
          'x-analytics-key': keyToUse,
        },
      });
      if (!response.ok) {
        let fallback = 'Failed to load analytics summary.';
        if (response.status === 401) {
          fallback = 'Incorrect passphrase. Please try again.';
        }
        if (response.status === 503) {
          fallback = 'Analytics admin key is not configured on the server.';
        }

        try {
          const errorData = await response.json() as { error?: string };
          throw new Error(errorData.error || fallback);
        } catch {
          throw new Error(fallback);
        }
      }
      const data = await response.json() as SummaryResponse;
      setSummary(data);
      setIsAuthorized(true);
      window.sessionStorage.setItem('a11yAnalyticsAccessKey', keyToUse);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch analytics summary.';
      setErrorMessage(message);
      setSummary(null);
      setIsAuthorized(false);
      window.sessionStorage.removeItem('a11yAnalyticsAccessKey');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedKey = window.sessionStorage.getItem('a11yAnalyticsAccessKey') || '';
    if (storedKey) {
      setAccessKey(storedKey);
      void fetchSummary(storedKey);
    }
  }, []);

  // Fetch eventRows after authorized
  useEffect(() => {
    if (!isAuthorized) return;
    async function fetchEvents() {
      try {
        const res = await fetch('/server/data/events.ndjson');
        if (res.ok) {
          const text = await res.text();
          const rows = text.split('\n').filter(Boolean).map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          }).filter(Boolean);
          setEventRows(rows);
        }
      } catch {}
    }
    fetchEvents();
  }, [isAuthorized]);

  const sourceCounts = (summary?.sourceCounts ?? {}) as Record<string, number>;
  const eventCounts = (summary?.eventCounts ?? {}) as Record<string, number>;
  const countryCounts = (summary?.countryCounts ?? {}) as Record<string, number>;
  const cityCounts = (summary?.cityCounts ?? {}) as Record<string, number>;
  const paymentStats = summary?.paymentStats ?? {};

  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const handleUnlock = () => {
    void fetchSummary(accessKey.trim());
  };

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-xl font-sans">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Analytics Access</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Enter the analytics passphrase to view acquisition and funnel data.</p>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="analytics-passphrase">
              Passphrase
            </label>
            <input
              id="analytics-passphrase"
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock();
                }
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter passphrase"
              autoComplete="off"
            />
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}

          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
          >
            {isLoading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="lock" className="w-4 h-4" />}
            Unlock Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl font-sans">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Traffic source and funnel summary from backend event tracking.</p>
      </header>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => void fetchSummary()}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          {isLoading ? <Icon name="loader" className="w-4 h-4 animate-spin" /> : <Icon name="chart-bar" className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
          {errorMessage}
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Totals</h2>
          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold">Events:</span> {summary?.totals?.events ?? 0}</p>
            <p><span className="font-semibold">Sources:</span> {summary?.totals?.sources ?? 0}</p>
            {paymentStats.totalPayments !== undefined && (
              <p><span className="font-semibold">Payments:</span> {paymentStats.totalPayments}</p>
            )}
            {paymentStats.totalAmount !== undefined && (
              <p><span className="font-semibold">Total Revenue:</span> ${paymentStats.totalAmount / 100}</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top Sources</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {topSources.length === 0 && <li>No source data yet.</li>}
            {topSources.map(([source, count]) => (
              <li key={source} className="flex justify-between gap-4">
                <span className="truncate">{source}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top Countries</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {topCountries.length === 0 && <li>No country data yet.</li>}
            {topCountries.map(([country, count]) => (
              <li key={country} className="flex justify-between gap-4">
                <span className="truncate">{country}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top Cities</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {topCities.length === 0 && <li>No city data yet.</li>}
            {topCities.map(([city, count]) => (
              <li key={city} className="flex justify-between gap-4">
                <span className="truncate">{city}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top Events</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
          {topEvents.length === 0 && <li>No event data yet.</li>}
          {topEvents.map(([name, count]) => (
            <li key={name} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-1">
              <span className="truncate">{name}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </div>

        {/* Classic Data Table */}
        <div className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm overflow-auto">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Event Data Table</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="px-2 py-1 text-left">Country</th>
                <th className="px-2 py-1 text-left">City</th>
                <th className="px-2 py-1 text-left">IP Address</th>
                <th className="px-2 py-1 text-left">Donations</th>
                <th className="px-2 py-1 text-left">Events</th>
                <th className="px-2 py-1 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {eventRows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4">No event data available.</td></tr>
              ) : (
                eventRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="px-2 py-1">{row.geo?.country || ''}</td>
                    <td className="px-2 py-1">{row.geo?.city || ''}</td>
                    <td className="px-2 py-1">{row.geo?.ip || row.ipHashHint || ''}</td>
                    <td className="px-2 py-1">{row.eventName === 'donation' ? 'Yes' : ''}</td>
                    <td className="px-2 py-1">{row.eventName}</td>
                    <td className="px-2 py-1">{row.context?.lastTouch?.source || row.context?.firstTouch?.source || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {summary?.note && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{summary.note}</p>
      )}
    </div>
  );
};
