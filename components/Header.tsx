import React from 'react';
import { Icon } from './Icon';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onNavigate: (view: 'landing' | 'simulator' | 'analytics') => void;
    onOpenDonation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenDonation }) => {
  const { theme, toggleTheme } = useTheme();

  const bugReportSubject = encodeURIComponent('Report a bug - A11y Sim');
  const bugReportBody = encodeURIComponent(
    `Please describe the bug you encountered:\n\n- What did you expect to happen?\n- What actually happened?\n- Steps to reproduce the issue:\n\nDevice type (mobile or desktop):\nOperating system (e.g. Windows, macOS, Android, iOS):\nBrowser (e.g. Chrome, Safari, Firefox):\n\n📎 IMPORTANT: Please attach a screenshot of the bug before sending this email.\n   (You can paste or drag & drop an image into this email.)\n`
  );
  const bugReportHref = `mailto:support@alimieyitayo.com?subject=${bugReportSubject}&body=${bugReportBody}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link 
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100 transition-opacity hover:opacity-80"
          aria-label="Go to homepage"
        >
          <Icon name="eye" className="w-8 h-8 text-blue-600" />
          <span>A11y Sim</span>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('simulator')} 
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            Analyzer
          </button>
          <a
            href={bugReportHref}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            Report a bug
          </a>
          {/* Analytics menu item removed as requested */}
           <button 
            onClick={onOpenDonation}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            <Icon name="coffee" className="w-4 h-4" />
            Buy Me a Coffee
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Icon name="moon" className="w-5 h-5" /> : <Icon name="sun" className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};