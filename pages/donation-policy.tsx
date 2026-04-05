import React from 'react';

const DonationPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200 mt-20">
    <h1 className="text-3xl font-bold mb-6">Donation Policy</h1>
    <p className="mb-4">Last updated: April 5, 2026</p>

    <p className="mb-4">
      A11y Sim is free to use. Donations are optional and help support hosting, third-party API costs, and ongoing
      development.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Non-Refundable Donations</h2>
    <p className="mb-4">Donations are graciously accepted to support our mission. As donations are voluntary contributions to support our free service, they are non-refundable. We appreciate your understanding and support.</p>

    <div className="flex justify-center mt-12">
      <a
        href="/"
        className="inline-block px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
      >
        Home
      </a>
    </div>
  </div>
);

export default DonationPolicy;
