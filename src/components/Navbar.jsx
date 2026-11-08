import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPublicCapacity } from '../lib/api';
import { Cpu, Menu, X, ArrowRight, FileText } from 'lucide-react';
import { smoothScrollTo } from './ScrollManager';
import gsap from 'gsap';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [capacity, setCapacity] = useState({ claimed_teams: 42, max_teams: 500 });
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';

  const headerRef = useRef(null);
  const hamburgerButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Smooth GSAP load-in animation
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

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
    getPublicCapacity().then((cap) => {
      if (mounted && cap) setCapacity(cap);
    }).catch((err) => {
      console.warn('[Capacity] Offline fallback or fetch error:', err);
    });
    return () => { mounted = false; };
  }, [location.pathname]);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-close mobile drawer on window resize >= 1150px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1150) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Lock body scroll when mobile drawer is open, trap focus, and handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          hamburgerButtonRef.current?.focus();
        } else if (e.key === 'Tab' && drawerRef.current) {
          const focusableElements = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const handleCloseDrawer = () => {
    setMobileMenuOpen(false);
    hamburgerButtonRef.current?.focus();
  };

  const navItems = [
    { label: "Overview", anchor: "overview" },
    { label: "Pipeline", anchor: "pipeline" },
    { label: "Tracks", anchor: "tracks" },
    { label: "Rules", anchor: "rules" },
    { label: "Timeline", anchor: "timeline" },
    { label: "Our Journey", path: "/about" },
    { label: "Downloads", anchor: "downloads" },
    { label: "FAQs", anchor: "faqs" }
  ];

  const handleAnchorClick = (anchor, e) => {
    if (isHomePage) {
      smoothScrollTo(anchor, e);
    }
    // If not on home page, normal link href `/#anchor` navigates to home and ScrollManager handles smooth scroll
    if (mobileMenuOpen) {
      handleCloseDrawer();
    }
  };

  return (
    <>
      <header 
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: scrolled ? 'rgba(255, 251, 230, 0.94)' : 'rgba(255, 251, 230, 0.82)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '2px solid #111116',
          transition: 'background 0.25s ease, padding 0.25s ease, box-shadow 0.25s ease'
        }}
        className={`w-full ${scrolled ? 'py-2.5 shadow-[0_4px_0px_0px_#111116]' : 'py-3.5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0 select-none">
              <div className="w-10 h-10 rounded-xl bg-[#111116] flex items-center justify-center text-[#FFE500] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#FFE500] transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#111116] leading-none whitespace-nowrap">
                    VELTRAXX
                  </span>
                  <span className="bg-[#FFE500] text-[#111116] font-black text-xs px-1.5 py-0.5 rounded chamfer-badge border border-[#111116] leading-none whitespace-nowrap">
                    2.0
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6B78] font-bold truncate mt-0.5 whitespace-nowrap">
                  SIET · DEPT OF EE (VLSI)
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items - Visible on >= 1150px, zero line wrapping */}
            <nav className="hidden min-[1150px]:flex items-center gap-5 xl:gap-6 shrink-0">
              {navItems.map((item) => {
                if (item.path) {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`text-sm font-extrabold transition-all relative py-1 whitespace-nowrap ${
                        isActive
                          ? 'text-[#111116] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#FFE500]'
                          : 'text-[#111116]/80 hover:text-[#111116] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFE500] hover:after:w-full after:transition-all after:duration-150'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={isHomePage ? `#${item.anchor}` : `/#${item.anchor}`}
                    onClick={(e) => handleAnchorClick(item.anchor, e)}
                    className="text-sm font-extrabold text-[#111116]/80 hover:text-[#111116] transition-colors relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFE500] hover:after:w-full after:transition-all after:duration-150"
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Desktop Right Actions - Visible on >= 1150px */}
            <div className="hidden min-[1150px]:flex items-center gap-3 shrink-0">
              {/* Neon Lime Green Live Dot Pill (Canonical #B6FF00) */}
              <div className="bg-[#B6FF00] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono font-black text-[#111116] select-none whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#111116] animate-pulse" />
                <span>FREE ROUND 1</span>
              </div>

              {/* Secondary Submit PPT Button */}
              <Link
                to="/submit-ppt"
                className="bg-white hover:bg-[#FBFBFB] text-[#111116] font-black text-xs px-3.5 py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:shadow-[3px_3px_0px_0px_#111116] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap"
                title="Unlocks Dec 02 (00:00 IST)"
              >
                <FileText className="w-3.5 h-3.5 text-[#FF2E93]" />
                <span>Submit PPT</span>
              </Link>

              {/* Primary Register CTA */}
              <Link
                to="/register"
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs sm:text-sm px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] hover:shadow-[4px_4px_0px_0px_#111116] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Register Team →</span>
              </Link>
            </div>

            {/* Mobile Menu & Quick Register Button - Visible on < 1150px */}
            <div className="flex min-[1150px]:hidden items-center gap-2.5">
              <Link
                to="/register"
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] transition-transform whitespace-nowrap"
              >
                Free Register
              </Link>
              <button
                ref={hamburgerButtonRef}
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 rounded-xl bg-white border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] text-[#111116] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FFE500] cursor-pointer"
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer (Black Neo-Brutalist Panel) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#111116]/80 backdrop-blur-sm flex justify-end"
          onClick={handleCloseDrawer}
        >
          <div 
            ref={drawerRef}
            className="w-full max-w-sm bg-[#111116] text-white border-l-3 border-[#FFE500] h-full flex flex-col justify-between p-6 shadow-[-6px_0px_0px_0px_#FFE500] relative animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/15 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black">
                    <Cpu className="w-5 h-5 text-[#111116]" />
                  </div>
                  <div>
                    <span className="font-black text-lg text-white block leading-none">VELTRAXX 2.0</span>
                    <span className="font-mono text-[10px] text-white/50 block mt-1">SIET · DEPT OF EE (VLSI)</span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={handleCloseDrawer}
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Live Telemetry Pill */}
              <div className="bg-[#1A1A22] border-2 border-[#B6FF00] p-3 rounded-xl flex items-center justify-between font-mono text-xs mb-6">
                <span className="flex items-center gap-2 text-white/90 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse" />
                  <span>ROUND 1: FREE ENTRY</span>
                </span>
                <span className="font-black text-[#B6FF00]">{capacity.claimed_teams} / {capacity.max_teams}</span>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  if (item.path) {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={handleCloseDrawer}
                        className={`text-base font-bold py-2.5 px-3 rounded-xl transition-colors border-b border-white/5 flex items-center justify-between ${
                          isActive
                            ? 'bg-[#FFE500] text-[#111116]'
                            : 'text-white/90 hover:text-[#FFE500] hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-xs">→</span>
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={item.label}
                      href={isHomePage ? `#${item.anchor}` : `/#${item.anchor}`}
                      onClick={(e) => handleAnchorClick(item.anchor, e)}
                      className="text-base font-bold text-white/90 hover:text-[#FFE500] py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs text-white/40">→</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions at bottom of drawer */}
            <div className="pt-6 border-t border-white/15 space-y-3">
              <Link
                to="/submit-ppt"
                onClick={handleCloseDrawer}
                className="w-full bg-white text-[#111116] font-black text-sm py-3 rounded-xl border-2 border-[#111116] flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                <FileText className="w-4 h-4 text-[#FF2E93]" />
                <span>SUBMIT PPT (OPENS DEC 02)</span>
              </Link>
              <Link
                to="/register"
                onClick={handleCloseDrawer}
                className="w-full bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-base py-3.5 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <span>REGISTER TEAM (FREE)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="text-center font-mono text-[11px] text-white/50">
                Round 1 Pitch Free for All Teams · Top 30 Offline
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}