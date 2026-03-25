import React from 'react';

const TermsOfUse: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200">
    <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
    <p className="mb-4">Last updated: March 19, 2026</p>
    <p className="mb-4">By using A11y Sim, you agree to these terms. Please read them carefully.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Use of Service</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>A11y Sim is provided as-is, without warranty of any kind.</li>
      <li>You may not use the service for unlawful or harmful activities.</li>
      <li>We reserve the right to suspend or terminate access for abuse or violation of these terms.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Intellectual Property</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>All content and code are © Eyitayo Alimi unless otherwise stated.</li>
      <li>Open-source components are used under their respective licenses.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Limitation of Liability</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>We are not liable for any damages or losses resulting from use of the service.</li>
    </ul>
    <p className="mt-8">For questions, contact <a href="mailto:support@alimieyitayo.com" className="underline">support@alimieyitayo.com</a>.</p>
  </div>
);

export default TermsOfUse;
