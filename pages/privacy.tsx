import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">Last updated: March 19, 2026</p>
    <p className="mb-4">We value your privacy. This Privacy Policy explains how A11y Sim collects, uses, and protects your information.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>We collect only the minimum data required to provide our services, such as analytics and payment information.</li>
      <li>No personal data is sold or shared with third parties except for payment processing (Stripe) and analytics.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Information</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>To provide and improve our services.</li>
      <li>To process payments securely via Stripe.</li>
      <li>To analyze usage and improve accessibility features.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>You may request deletion of your data by contacting us at <a href="mailto:privacy@alimieyitayo.com" className="underline">privacy@alimieyitayo.com</a>.</li>
      <li>EU and California residents have additional rights as described on their respective pages.</li>
    </ul>
    <p className="mt-8">For questions, contact <a href="mailto:privacy@alimieyitayo.com" className="underline">privacy@alimieyitayo.com</a>.</p>
  </div>
);

export default PrivacyPolicy;
