import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SimulatorApp } from './components/SimulatorApp';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Header } from './components/Header';
import { Donation } from './components/Donation';
import { initializeAnalytics, trackEvent } from './services/analyticsService';
import AdminLogin from './components/AdminLogin';
import AdminAnalytics from './components/AdminAnalytics';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PrivacyPolicy from './pages/privacy';
import TermsOfUse from './pages/terms';
import RefundPolicy from './pages/refund';
import DonationPolicy from './pages/donation-policy';
import EUVisitors from './pages/eu';
import CaliforniaVisitors from './pages/california';
import Merch from './pages/merch';

const AppRoutes: React.FC = () => {
  const [view, setView] = useState<'landing' | 'simulator' | 'analytics' | 'admin-login' | 'admin-analytics'>('landing');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const routerNavigate = useNavigate();

  useEffect(() => {
    initializeAnalytics();
    void trackEvent('app_loaded', { view: 'landing' });

    const urlParams = new URLSearchParams(window.location.search);

    // Handle report purchase success redirect
    if (urlParams.has('payment_success')) {
      setIsDonationModalOpen(true);
      setView('simulator');
      routerNavigate('/simulator');
      void trackEvent('payment_return_detected', { hasSessionId: Boolean(urlParams.get('session_id')) });
    }

    // Listen for /admin-login route
    if (window.location.pathname === '/admin-login') {
      setView('admin-login');
    }
    // Listen for /admin-analytics route
    if (window.location.pathname === '/admin-analytics') {
      setView('admin-analytics');
    }
  }, []);

  const navigate = (targetView: 'landing' | 'simulator' | 'analytics' | 'admin-login' | 'admin-analytics') => {
    void trackEvent('navigate_view', { targetView });

    if (targetView === 'simulator') {
      void trackEvent('simulator_opened', { from: view });
    }

    if (targetView === 'analytics') {
      void trackEvent('analytics_opened', { from: view });
    }

    const routeByView: Record<typeof targetView, string> = {
      landing: '/',
      simulator: '/simulator',
      analytics: '/analytics',
      'admin-login': '/admin-login',
      'admin-analytics': '/admin-analytics',
    };

    setView(targetView);
    routerNavigate(routeByView[targetView]);
    window.scrollTo(0, 0);
  };

  const handleOpenDonation = () => {
    void trackEvent('donation_opened');
    setIsDonationModalOpen(true);
  };

  const handleCloseDonation = () => {
    setIsDonationModalOpen(false);
  };

  return (
    <>
      <Header onNavigate={navigate} onOpenDonation={handleOpenDonation} />
      <Routes>
        <Route path="/" element={<LandingPage onLaunch={() => navigate('simulator')} />} />
        <Route path="/simulator" element={<SimulatorApp />} />
        <Route path="/admin-login" element={<AdminLogin onSuccess={() => navigate('admin-analytics')} />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/donation-policy" element={<DonationPolicy />} />
        <Route path="/eu" element={<EUVisitors />} />
        <Route path="/california" element={<CaliforniaVisitors />} />
        <Route path="/merch" element={<Merch />} />
      </Routes>
      <Donation 
        isOpen={isDonationModalOpen} 
        onClose={handleCloseDonation} 
      />
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;