import React from 'react';

const RefundPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200">
    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
    <p className="mb-4">Last updated: March 19, 2026</p>
    <p className="mb-4">We want you to be satisfied with A11y Sim. If you experience issues, please contact us.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Eligibility</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Refunds are available for purchases made within 14 days if the service did not work as described.</li>
      <li>To request a refund, email <a href="mailto:support@alimieyitayo.com" className="underline">support@alimieyitayo.com</a> with your order details.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Non-Refundable Items</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Refunds are not available for services that have been fully delivered and functioned as described.</li>
    </ul>
    <p className="mt-8">We reserve the right to deny refund requests that do not meet these criteria.</p>
  </div>
);

export default RefundPolicy;
