import React from 'react';

const Merch: React.FC = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl text-slate-800 dark:text-slate-200 text-center mt-20">
    <h1 className="text-3xl font-bold mb-6">A11y Sim Merch</h1>
    <p className="mb-4 text-lg">We are working hard to bring you awesome A11y Sim merchandise.<br />
    Stay tuned for updates!</p>
    <div className="flex justify-center mt-12">
      <a href="/" className="inline-block px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors">Home</a>
    </div>
  </div>
);

export default Merch;
