import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import TrackerPage from './pages/TrackerPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#111116] selection:bg-[#FFE500] selection:text-[#111116] overflow-x-clip">
        {/* Universal Pinned Optical Frosted Glass Navigation */}
        <Navbar />

        {/* Client-side Routing Surface */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
