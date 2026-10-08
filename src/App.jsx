import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// PERF-02: Route-level code splitting to trim homepage initial JS payload
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TrackerPage = lazy(() => import('./pages/TrackerPage'));

function PageLoadingFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#FFE500] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] animate-spin mb-4 flex items-center justify-center font-mono font-black text-sm text-[#111116]">
        ⚡
      </div>
      <p className="font-mono text-xs font-black uppercase text-[#111116]/80 tracking-wider">
        Loading Silicon Route...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#111116] selection:bg-[#FFE500] selection:text-[#111116] overflow-x-clip">
        {/* A11Y-03: Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#FFE500] focus:text-[#111116] focus:font-mono focus:text-xs focus:font-black focus:border-2 focus:border-[#111116] focus:shadow-[3px_3px_0px_0px_#111116] focus:rounded-lg"
        >
          Skip to main content
        </a>

        {/* Universal Pinned Optical Frosted Glass Navigation */}
        <Navbar />

        {/* Client-side Routing Surface with Main Content Anchor */}
        <main id="main-content" className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tracker" element={<TrackerPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
