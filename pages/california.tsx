import React from 'react';

const CaliforniaVisitors: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200">
    <h1 className="text-3xl font-bold mb-6">Information for California Visitors</h1>
    <p className="mb-4">Last updated: March 19, 2026</p>
    <p className="mb-4">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA).</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Know what personal information we collect and how it is used.</li>
      <li>Request deletion of your personal information.</li>
      <li>Opt out of the sale of your personal information (we do not sell your data).</li>
    </ul>
    <p className="mb-4">To exercise your rights, contact <a href="mailto:privacy@alimieyitayo.com" className="underline">privacy@alimieyitayo.com</a>.</p>
    <p className="mt-8">For more information, visit the <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer" className="underline">CCPA portal</a>.</p>
  </div>
);

export default CaliforniaVisitors;
