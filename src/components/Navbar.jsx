import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { eventConfig } from '../config/eventConfig';
import { getPublicCapacity } from '../lib/api';
import { Cpu, ArrowUpRight, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [capacity, setCapacity] = useState({ claimed_teams: 27, max_teams: 35 });
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live public capacity count
  useEffect(() => {
    let mounted = true;
    getPublicCapacity().then(cap => {
      if (mounted && cap) setCapacity(cap);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open, and handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Overview", anchor: "overview" },
    { label: "Challenge", anchor: "challenge" },
    { label: "Timeline", anchor: "timeline" },
    { label: "Rulebook", anchor: "rulebook" },
    { label: "Prizes", anchor: "prizes" },
    { label: "Contact", anchor: "contact" }
  ];

  const getHref = (anchor) => (isHomePage ? `#${anchor}` : `/#${anchor}`);

  return (
    <>
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: scrolled ? 'rgba(255, 251, 230, 0.88)' : 'rgba(255, 251, 230, 0.60)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '2px solid #111116',
          transition: 'background 0.25s ease, padding 0.25s ease'
        }}
        className={`w-full ${scrolled ? 'py-2.5 shadow-md' : 'py-3.5'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#111116] flex items-center justify-center text-[#FFE500] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#FFE500] transition-transform duration-200 group-hover:scale-105">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-[#111116]">
                    {eventConfig.event.name.split(' ')[0]}
                  </span>
                  <span className="bg-[#FFE500] text-[#111116] font-black text-xs px-1.5 py-0.5 rounded chamfer-badge border border-[#111116]">
                    {eventConfig.event.name.split(' ')[1]}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6B78] font-bold">
                  {eventConfig.event.institution.shortName} · ECE VLSI
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={getHref(link.anchor)}
                  className="text-sm font-bold text-[#111116]/80 hover:text-[#111116] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFE500] hover:after:w-full after:transition-all after:duration-150"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Right Action & Capacity Pill */}
            <div className="hidden lg:flex items-center gap-3.5">
              <div className="bg-white/90 border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono font-black text-[#111116]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93] animate-pulse-live" />
                <span>{capacity.claimed_teams} / {capacity.max_teams} TEAMS</span>
              </div>

              <Link
                to="/register"
                className="bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-sm px-5 py-2.5 rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] hover:shadow-[1px_1px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1.5"
              >
                <span>Register Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu & Quick Register Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/register"
                className="bg-[#FFE500] text-[#111116] font-black text-xs px-3.5 py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Register
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-white border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] text-[#111116] focus:outline-none cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer (Black Neo-Brutalist Panel) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#111116]/80 backdrop-blur-sm flex justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#111116] text-white border-l-3 border-[#FFE500] h-full flex flex-col justify-between p-6 shadow-2xl relative animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/15 mb-6">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-6 h-6 text-[#FFE500]" />
                  <span className="font-black text-lg text-white">VELTRAXX 2.0</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Telemetry Pill */}
              <div className="bg-[#1A1A22] border-2 border-[#FFE500]/50 p-3 rounded-xl flex items-center justify-between font-mono text-xs mb-6">
                <span className="flex items-center gap-2 text-white/90 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93] animate-pulse-live" />
                  <span>NATIONAL VLSI SPRINT</span>
                </span>
                <span className="font-black text-[#FFE500]">{capacity.claimed_teams} / {capacity.max_teams} CLAIMED</span>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={getHref(link.anchor)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-white/90 hover:text-[#FFE500] py-3 px-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <span className="font-mono text-xs text-white/40">→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Full-width Yellow Register CTA at bottom of drawer */}
            <div className="pt-6 border-t border-white/15">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-base py-4 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FF2E93] flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>REGISTER TEAM (4 MEMBERS)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="text-center font-mono text-[11px] text-white/50 mt-3">
                Flat ₹1,000 / Team · 35 Teams Cap
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
