import React from 'react';

const EUVisitors: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200">
    <h1 className="text-3xl font-bold mb-6">Information for EU Visitors</h1>
    <p className="mb-4">Last updated: March 19, 2026</p>
    <p className="mb-4">If you are located in the European Union, you have certain rights under the General Data Protection Regulation (GDPR).</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Access, correct, or delete your personal data.</li>
      <li>Request restriction or object to processing of your data.</li>
      <li>Data portability.</li>
    </ul>
    <p className="mb-4">To exercise your rights, contact <a href="mailto:privacy@alimieyitayo.com" className="underline">privacy@alimieyitayo.com</a>.</p>
    <p className="mt-8">For more information, visit the <a href="https://gdpr.eu/" target="_blank" rel="noopener noreferrer" className="underline">GDPR portal</a>.</p>
  </div>
);

export default EUVisitors;
