import React, { useState } from 'react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === import.meta.env.VITE_ANALYTICS_ADMIN_KEY) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError('Invalid passphrase.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin passphrase"
          value={passphrase}
          onChange={e => setPassphrase(e.target.value)}
          className="w-full p-3 rounded border border-slate-300 dark:border-slate-700 mb-4"
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
