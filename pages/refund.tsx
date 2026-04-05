import React from 'react';


const RefundPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200 mt-20">
    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
    <p className="mb-4">Last updated: April 5, 2026</p>
    <p className="mb-4">A11y Sim is free to use. The optional AI report (including AI insights and PDF export) requires payment.</p>

    <h2 className="text-xl font-semibold mt-8 mb-2">AI Report Purchases</h2>
    <p className="mb-4">AI report purchases are generally non-refundable because third-party processing and compute costs are incurred immediately during generation.</p>
    <p className="mb-4">If you were charged but did not receive access to the unlocked report, contact <a href="mailto:support@alimieyitayo.com" className="underline">support@alimieyitayo.com</a> with your Stripe receipt and we’ll help resolve it.</p>
    <div className="flex justify-center mt-12">
      <a href="/" className="inline-block px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors">Home</a>
    </div>
  </div>
);

export default RefundPolicy;
