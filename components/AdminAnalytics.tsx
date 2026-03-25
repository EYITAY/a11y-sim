import React from 'react';

const AdminAnalytics: React.FC = () => {
  const usageData = [
    {
      id: 1,
      country: 'Nigeria',
      city: 'Lagos',
      ip: '102.89.12.34',
      device: 'Chrome on Windows',
      sessions: 12,
      actions: 34,
      donations: 2,
      feedback: 'Great tool!',
      support: 'None',
      featuresUsed: 'Simulator, Report',
      email: 'user1@example.com',
      lastActive: '2026-03-02',
    },
    {
      id: 2,
      country: 'USA',
      city: 'New York',
      ip: '172.16.254.1',
      device: 'Safari on iPhone',
      sessions: 5,
      actions: 10,
      donations: 0,
      feedback: '',
      support: 'Asked about color contrast',
      featuresUsed: 'Palette, FAQ',
      email: 'user2@example.com',
      lastActive: '2026-03-01',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">Admin Analytics Dashboard</h1>
        <p className="text-lg text-white mb-4 text-center">Welcome, admin! Here you can view analytics data and manage your app.</p>
        {/* Usage data table removed as requested */}
      </div>
    </div>
  );
};

export default AdminAnalytics;
