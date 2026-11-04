import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ActivityTicker from '../components/common/ActivityTicker';
import QuickDonateButton from '../components/common/QuickDonateButton';
import SupportWidget from '../components/common/SupportWidget';

export default function PublicLayout() {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic Scroll Progress Calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on every route change so each page renders dynamically from the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setScrollProgress(0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen relative bg-surface-light overflow-x-hidden">
      {/* Sleek Top Reading Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3.5px] bg-gradient-to-r from-emerald-500 via-forest-500 to-teal-400 z-50 transition-all duration-75 ease-out shadow-xs"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />
      <Navbar />
      <ActivityTicker />
      <main key={location.pathname} className="flex-grow page-enter-animation">
        <Outlet />
      </main>
      <Footer />
      <QuickDonateButton />
      <SupportWidget />
    </div>
  );
}
