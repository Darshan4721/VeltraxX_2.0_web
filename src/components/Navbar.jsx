import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPublicCapacity } from '../lib/api';
import { Menu, X, ArrowRight, FileText, Sparkles, Minus, Maximize2 } from 'lucide-react';
import { smoothScrollTo } from './ScrollManager';
import gsap from 'gsap';
import logoMark from '../assets/logo-mark.svg';
import logoMarkDark from '../assets/logo-mark-dark.svg';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [capacity, setCapacity] = useState({ claimed_teams: 42, max_teams: 2000 });
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/tracker';

  // Floating Interactive Round 1 Architecture Badge State
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [badgeMinimized, setBadgeMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [activeKey, setActiveKey] = useState(() => {
    if (isAboutPage) return '/about';
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '');
    }
    return 'overview';
  });
  const headerRef = useRef(null);
  const hamburgerButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Floating active and hover line refs
  const navContainerRef = useRef(null);
  const activeLineRef = useRef(null);
  const faintLineRef = useRef(null);
  const itemRefs = useRef([]);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef(null);

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
    { label: "Downloads", anchor: "downloads" },
    { label: "Timeline", anchor: "timeline" },
    { label: "FAQs", anchor: "faqs" },
    { label: "Our Journey", path: "/about" }
  ];

  // Helper to calculate and animate active thick line
  const updateActiveLine = (animate = true) => {
    if (!navContainerRef.current || !activeLineRef.current) return;
    const activeIdx = navItems.findIndex(item => 
      item.path ? location.pathname === item.path : (isHomePage && item.anchor === activeKey)
    );

    if (activeIdx !== -1 && itemRefs.current[activeIdx]) {
      const target = itemRefs.current[activeIdx];
      const container = navContainerRef.current;
      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const targetX = tRect.left - cRect.left;
      const targetW = tRect.width;

      if (animate) {
        gsap.to(activeLineRef.current, {
          x: targetX,
          width: targetW,
          opacity: 1,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto"
        });
      } else {
        gsap.set(activeLineRef.current, {
          x: targetX,
          width: targetW,
          opacity: 1
        });
      }
    } else {
      gsap.to(activeLineRef.current, {
        opacity: 0,
        duration: 0.25,
        overwrite: "auto"
      });
    }
  };

  // Synchronize active indicator on route or activeKey change
  useEffect(() => {
    if (isAboutPage) {
      setActiveKey('/about');
    } else if (isHomePage) {
      if (location.hash) {
        const hash = location.hash.replace('#', '');
        setActiveKey(hash);
        isProgrammaticScrollRef.current = true;
        if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 1200);
      }
    } else {
      setActiveKey(null);
    }
  }, [location.pathname, location.hash, isAboutPage, isHomePage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateActiveLine(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [activeKey, location.pathname]);

  // Recalibrate line on window resize and font load
  useEffect(() => {
    const handleResize = () => updateActiveLine(false);
    window.addEventListener('resize', handleResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updateActiveLine(false));
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [activeKey, location.pathname]);

  // Real-time Scroll Spy on Home Page (rAF throttled + exact viewport bounds)
  useEffect(() => {
    if (!isHomePage) return;

    const anchors = ['overview', 'pipeline', 'tracks', 'rules', 'downloads', 'timeline', 'faqs'];
    let ticking = false;

    const handleScrollSpy = () => {
      if (isProgrammaticScrollRef.current) return;
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (isProgrammaticScrollRef.current) return;

        // Check if reached bottom of document
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
          setActiveKey('faqs');
          return;
        }

        const scrollPos = window.scrollY + 180;
        let current = 'overview';

        for (let i = 0; i < anchors.length; i++) {
          const el = document.getElementById(anchors[i]);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (scrollPos >= top) {
              current = anchors[i];
            }
          }
        }

        setActiveKey(prev => (prev === current ? prev : current));
      });
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [isHomePage]);

  // Hover indicator handlers
  const handleItemHover = (idx) => {
    if (!navContainerRef.current || !faintLineRef.current) return;
    const target = itemRefs.current[idx];
    if (!target) return;

    const cRect = navContainerRef.current.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const targetX = tRect.left - cRect.left;
    const targetW = tRect.width;

    gsap.to(faintLineRef.current, {
      x: targetX,
      width: targetW,
      opacity: 0.65,
      duration: 0.22,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleNavMouseLeave = () => {
    if (faintLineRef.current) {
      gsap.to(faintLineRef.current, {
        opacity: 0,
        duration: 0.2,
        overwrite: "auto"
      });
    }
  };

  const handleItemClick = (item, idx, e) => {
    // Fade out faint hover line as thick active line glides to it
    if (faintLineRef.current) {
      gsap.to(faintLineRef.current, { opacity: 0, duration: 0.15, overwrite: "auto" });
    }

    if (item.anchor) {
      if (isHomePage) {
        if (e) e.preventDefault();
        isProgrammaticScrollRef.current = true;
        setActiveKey(item.anchor);

        // Immediately glide active indicator to target tab without intermediate flicker
        if (navContainerRef.current && activeLineRef.current && itemRefs.current[idx]) {
          const target = itemRefs.current[idx];
          const container = navContainerRef.current;
          const cRect = container.getBoundingClientRect();
          const tRect = target.getBoundingClientRect();
          const targetX = tRect.left - cRect.left;
          const targetW = tRect.width;

          gsap.to(activeLineRef.current, {
            x: targetX,
            width: targetW,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
          });
        }

        smoothScrollTo(item.anchor);

        if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 1100);
      } else {
        setActiveKey(item.anchor);
      }
    } else if (item.path) {
      setActiveKey(item.path);
    }

    if (mobileMenuOpen) {
      handleCloseDrawer();
    }
  };

  const handleAnchorClick = (anchor, e) => {
    if (isHomePage) {
      smoothScrollTo(anchor, e);
    }
    if (mobileMenuOpen) {
      handleCloseDrawer();
    }
  };

  // Drag & click interactions for floating 100% Free Entry Architecture badge
  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startPosRef.current = {
      startX: e.clientX - dragOffset.x,
      startY: e.clientY - dragOffset.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - startPosRef.current.startX;
    const newY = e.clientY - startPosRef.current.startY;
    if (Math.abs(newX - dragOffset.x) > 3 || Math.abs(newY - dragOffset.y) > 3) {
      hasDraggedRef.current = true;
    }
    setDragOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleBadgeClick = (e) => {
    if (hasDraggedRef.current) return;
    if (badgeMinimized) {
      setBadgeMinimized(false);
    } else {
      setBadgeOpen((prev) => !prev);
    }
  };

  // On Admin Command Center, Navbar is not rendered (TrackerPage renders its own full-featured header)
  if (isAdminPage) {
    return null;
  }

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-4">
            
            {/* Brand Identity */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 select-none min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <img src={logoMark} alt="VELTRAXX 2.0 Chip Mark" className="w-full h-full object-contain" width="40" height="40" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-extrabold text-sm min-[360px]:text-base sm:text-xl tracking-tight text-[#111116] leading-none whitespace-nowrap">
                    VELTRAXX
                  </span>
                  <span className="bg-[#FFE500] text-[#111116] font-black text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded chamfer-badge border border-[#111116] leading-none whitespace-nowrap">
                    2.0
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B6B78] font-bold truncate mt-0.5 whitespace-nowrap hidden min-[480px]:inline">
                  SIET · DEPT OF EE - VDT
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items with Gliding Active & Hover Indicators */}
            <nav 
              ref={navContainerRef}
              onMouseLeave={handleNavMouseLeave}
              className="relative hidden min-[1150px]:flex items-center gap-4 xl:gap-6 shrink-0 py-1"
            >
              {/* Thicker Active Marker (Where the user is currently) */}
              <div
                ref={activeLineRef}
                className="absolute bottom-0 h-[3.5px] bg-[#FFE500] rounded-full pointer-events-none z-10 will-change-transform shadow-[0_1px_2px_rgba(17,17,22,0.25)]"
                style={{ opacity: 0, width: 0, transform: 'translateX(0px)' }}
                aria-hidden="true"
              />

              {/* Faint Pointer Indicator (Where the user is pointing / hovering) */}
              <div
                ref={faintLineRef}
                className="absolute bottom-0 h-[2px] bg-[#FFE500]/60 rounded-full pointer-events-none z-0 will-change-transform"
                style={{ opacity: 0, width: 0, transform: 'translateX(0px)' }}
                aria-hidden="true"
              />

              {navItems.map((item, idx) => {
                const isActive = item.path 
                  ? location.pathname === item.path 
                  : (isHomePage && activeKey === item.anchor);

                if (item.path) {
                  return (
                    <Link
                      key={item.label}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      to={item.path}
                      onMouseEnter={() => handleItemHover(idx)}
                      onClick={(e) => handleItemClick(item, idx, e)}
                      className={`text-sm font-extrabold transition-colors py-1.5 whitespace-nowrap select-none ${
                        isActive
                          ? 'text-[#111116]'
                          : 'text-[#111116]/65 hover:text-[#111116]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                if (!isHomePage) {
                  return (
                    <Link
                      key={item.label}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      to={`/#${item.anchor}`}
                      onMouseEnter={() => handleItemHover(idx)}
                      onClick={(e) => handleItemClick(item, idx, e)}
                      className={`text-sm font-extrabold transition-colors py-1.5 whitespace-nowrap select-none ${
                        isActive
                          ? 'text-[#111116]'
                          : 'text-[#111116]/65 hover:text-[#111116]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.label}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    href={`#${item.anchor}`}
                    onMouseEnter={() => handleItemHover(idx)}
                    onClick={(e) => handleItemClick(item, idx, e)}
                    className={`text-sm font-extrabold transition-colors py-1.5 whitespace-nowrap select-none ${
                      isActive
                        ? 'text-[#111116]'
                        : 'text-[#111116]/65 hover:text-[#111116]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Desktop Right Actions - Visible on >= 1150px */}
            <div className="hidden min-[1150px]:flex items-center gap-3 shrink-0 relative">
              
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

              {/* Freely Hung Hydrodynamic "Bottle in Water" ₹0 Free Entry Satellite Badge */}
              <div 
                style={{
                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                  touchAction: 'none'
                }}
                className={`absolute top-[calc(100%+8px)] right-4 xl:right-6 z-50 select-none ${
                  isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {!badgeMinimized ? (
                  <div className="relative animate-water-bobbing">
                    {/* Floating Hydrodynamic Interactive Pill */}
                    <button
                      onClick={handleBadgeClick}
                      className="bg-[#B6FF00] hover:brightness-105 text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] hover:shadow-[4px_4px_0px_0px_#111116] px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-mono font-black text-xs whitespace-nowrap transition-shadow cursor-pointer"
                      title="Click to view 2-Stage Round Architecture · Drag to move like a bottle in water"
                      aria-expanded={badgeOpen}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#111116] animate-pulse shrink-0" />
                      <span>ROUND 1: 100% FREE ENTRY (₹0)</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#111116] shrink-0" />
                    </button>

                      {/* Interactive Architecture Popover Card */}
                      {badgeOpen && (
                        <div 
                          className="absolute top-[calc(100%+8px)] right-0 w-84 bg-white border-2 border-[#111116] rounded-2xl shadow-[6px_6px_0px_0px_#111116] p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b-2 border-[#111116] pb-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] border border-[#111116] animate-pulse" />
                              <span className="font-mono font-black text-xs text-[#111116] uppercase tracking-wide">
                                2-Stage Architecture
                              </span>
                            </div>
                            <button 
                              onClick={() => setBadgeOpen(false)}
                              className="text-[#111116]/60 hover:text-[#111116] p-1 rounded-lg hover:bg-[#F4F4F6] cursor-pointer transition-colors"
                              aria-label="Close"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2.5 text-xs text-[#111116]">
                            <div className="bg-[#B6FF00]/25 border border-[#111116]/30 p-2.5 rounded-xl">
                              <div className="font-black text-[#111116] flex items-center justify-between">
                                <span>ROUND 1 · ONLINE BLUEPRINT</span>
                                <span className="bg-[#B6FF00] text-[#111116] font-mono text-[10px] font-black px-1.5 py-0.5 rounded border border-[#111116]">₹0 FREE</span>
                              </div>
                              <p className="text-[11px] text-[#111116]/80 mt-1 leading-relaxed">
                                Pitch your PPT blueprint online for free. All college teams eligible across India.
                              </p>
                            </div>

                            <div className="bg-[#F4F4F6] border border-[#111116]/30 p-2.5 rounded-xl">
                              <div className="font-black text-[#111116] flex items-center justify-between">
                                <span>ROUND 2 · 24H OFFLINE ARENA</span>
                                <span className="bg-[#FFE500] text-[#111116] font-mono text-[10px] font-black px-1.5 py-0.5 rounded border border-[#111116]">SIET OFFLINE</span>
                              </div>
                              <p className="text-[11px] text-[#111116]/80 mt-1 leading-relaxed">
                                Shortlisted finalists advance to the 24-hour hardware/software building arena at Coimbatore.
                              </p>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-[#111116]/15 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setBadgeOpen(false);
                                smoothScrollTo('pipeline');
                              }}
                              className="flex-1 bg-[#111116] hover:bg-[#111116]/90 text-white font-black text-xs py-2 px-3 rounded-xl border border-[#111116] flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#FFE500] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              <span>Explore Architecture</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#FFE500]" />
                            </button>

                            <button
                              onClick={() => {
                                setBadgeMinimized(true);
                                setBadgeOpen(false);
                              }}
                              className="p-2 rounded-xl border border-[#111116]/30 hover:bg-[#F4F4F6] text-[#111116]/70 hover:text-[#111116] cursor-pointer"
                              title="Minimize badge"
                              aria-label="Minimize badge"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setBadgeMinimized(false)}
                      className="bg-[#B6FF00] hover:brightness-105 border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono text-[11px] font-black text-[#111116] cursor-pointer animate-water-bobbing"
                      title="Expand Round 1 Free Entry info"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#111116] animate-pulse" />
                      <span>₹0 FREE</span>
                      <Maximize2 className="w-3 h-3 text-[#111116]" />
                    </button>
                  )}
                </div>
            </div>

            {/* Mobile Menu & Quick Register Button - Visible on < 1150px */}
            <div className="flex min-[1150px]:hidden items-center gap-1.5 sm:gap-2.5 shrink-0 pr-0.5">
              <Link
                to="/register"
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs sm:text-sm px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] transition-transform whitespace-nowrap"
              >
                <span className="hidden min-[380px]:inline">Free </span>Register
              </Link>
              <button
                ref={hamburgerButtonRef}
                onClick={() => setMobileMenuOpen(true)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] text-[#111116] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FFE500] cursor-pointer shrink-0"
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  <div className="w-9 h-9 shrink-0">
                    <img src={logoMarkDark} alt="VELTRAXX 2.0 Hackathon Logo" className="w-full h-full object-contain" width="36" height="36" loading="lazy" />
                  </div>
                  <div>
                    <span className="font-black text-lg text-white block leading-none">VELTRAXX 2.0</span>
                    <span className="font-mono text-[10px] text-white/50 block mt-1">SIET · DEPT OF EE - VDT</span>
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

              {/* Live Telemetry Pill - No participant limits */}
              <div className="bg-[#1A1A22] border-2 border-[#B6FF00] p-3 rounded-xl flex items-center justify-between font-mono text-xs mb-6">
                <span className="flex items-center gap-2 text-white/90 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse" />
                  <span>ROUND 1: FREE ENTRY</span>
                </span>
                <span className="font-black text-[#B6FF00] uppercase tracking-wider">OPEN ACCESS</span>
              </div>

              {/* Navigation Links */}
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = item.path 
                    ? location.pathname === item.path 
                    : (isHomePage && activeKey === item.anchor);

                  if (item.path) {
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={handleCloseDrawer}
                        className={`text-base font-bold py-2.5 px-3 rounded-xl transition-colors border-b border-white/5 flex items-center justify-between ${
                          isActive
                            ? 'bg-[#FFE500] text-[#111116] shadow-[2px_2px_0px_#111116] border-2 border-[#111116]'
                            : 'text-white/90 hover:text-[#FFE500] hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-xs">{isActive ? '●' : '→'}</span>
                      </Link>
                    );
                  }

                  if (!isHomePage) {
                    return (
                      <Link
                        key={item.label}
                        to={`/#${item.anchor}`}
                        onClick={handleCloseDrawer}
                        className={`text-base font-bold py-2.5 px-3 rounded-xl transition-colors border-b border-white/5 flex items-center justify-between ${
                          isActive
                            ? 'bg-[#FFE500] text-[#111116] shadow-[2px_2px_0px_#111116] border-2 border-[#111116]'
                            : 'text-white/90 hover:text-[#FFE500] hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-xs text-white/40">{isActive ? '●' : '→'}</span>
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={item.label}
                      href={`#${item.anchor}`}
                      onClick={(e) => handleAnchorClick(item.anchor, e)}
                      className={`text-base font-bold py-2.5 px-3 rounded-xl transition-colors border-b border-white/5 flex items-center justify-between ${
                        isActive
                          ? 'bg-[#FFE500] text-[#111116] shadow-[2px_2px_0px_#111116] border-2 border-[#111116]'
                          : 'text-white/90 hover:text-[#FFE500] hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs text-white/40">{isActive ? '●' : '→'}</span>
                    </a>
                  );
                })}
              </nav>
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
                Round 1 Pitch Free for All Teams · Offline 24H Arena
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}