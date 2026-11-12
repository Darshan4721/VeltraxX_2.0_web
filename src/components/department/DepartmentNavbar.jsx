import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Download } from 'lucide-react';
import { smoothScrollTo } from '../ScrollManager';
import gsap from 'gsap';
import logoMark from '../../assets/logo-mark.svg';
import logoMarkDark from '../../assets/logo-mark-dark.svg';

const NAV_ITEMS = [
  { label: 'Overview', anchor: 'journey-hero' },
  { label: 'Vision', anchor: 'leadership' },
  { label: 'EDA Labs', anchor: 'workshops' },
  { label: 'Research', anchor: 'silicon-research' },
  { label: 'Arenas', anchor: 'competitions' },
  { label: 'Delegations', anchor: 'national-exposure' },
  { label: 'Honours', anchor: 'honours' },
  { label: 'Campus', anchor: 'beyond-silicon' },
  { label: 'Magazine', anchor: 'magazine-vault' },
  { label: 'Contact', anchor: 'connect' },
];

export default function DepartmentNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('journey-hero');

  const headerRef = useRef(null);
  const navContainerRef = useRef(null);
  const activeLineRef = useRef(null);
  const faintLineRef = useRef(null);
  const itemRefs = useRef([]);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef(null);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // Track sticky glass elevation on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open, trap focus, and handle Escape
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerButtonRef.current?.focus({ preventScroll: true });
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
          } else if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
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
  }, [mobileMenuOpen]);

  // Clear programmatic timer on unmount
  useEffect(() => {
    return () => {
      if (programmaticTimerRef.current) {
        clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  const handleCloseDrawer = (restoreFocus = true) => {
    setMobileMenuOpen(false);
    if (restoreFocus) {
      hamburgerButtonRef.current?.focus({ preventScroll: true });
    }
  };

  // Helper to calculate and animate active thick yellow line
  const updateActiveLine = useCallback((animate = true) => {
    if (!navContainerRef.current || !activeLineRef.current) return;
    const activeIdx = NAV_ITEMS.findIndex((item) => item.anchor === activeKey);

    if (activeIdx !== -1 && itemRefs.current[activeIdx]) {
      const target = itemRefs.current[activeIdx];
      const container = navContainerRef.current;
      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      if (tRect.width === 0) return;

      const targetX = tRect.left - cRect.left;
      const targetW = tRect.width;

      if (animate) {
        gsap.to(activeLineRef.current, {
          x: targetX,
          width: targetW,
          opacity: 1,
          duration: 0.38,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        gsap.set(activeLineRef.current, {
          x: targetX,
          width: targetW,
          opacity: 1,
        });
      }
    } else {
      gsap.to(activeLineRef.current, {
        opacity: 0,
        duration: 0.25,
        overwrite: 'auto',
      });
    }
  }, [activeKey]);

  // Synchronize active indicator when activeKey changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateActiveLine(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [activeKey, updateActiveLine]);

  // Recalibrate underline on resize, ResizeObserver, and font readiness
  useEffect(() => {
    const handleResize = () => updateActiveLine(false);
    window.addEventListener('resize', handleResize);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && navContainerRef.current) {
      observer = new ResizeObserver(() => updateActiveLine(false));
      observer.observe(navContainerRef.current);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updateActiveLine(false));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [updateActiveLine]);

  // Sync activeKey with initial hash if opened via #section deep link
  useEffect(() => {
    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    if (hash && NAV_ITEMS.some((item) => item.anchor === hash)) {
      setActiveKey(hash);
      isProgrammaticScrollRef.current = true;
      if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
      programmaticTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1100);
    }
  }, []);

  // Real-time Scroll Spy across all departmental page sections (rAF throttled)
  useEffect(() => {
    const anchors = NAV_ITEMS.map((item) => item.anchor);
    let ticking = false;

    const handleScrollSpy = () => {
      if (isProgrammaticScrollRef.current || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (isProgrammaticScrollRef.current) return;

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
          setActiveKey('connect');
          return;
        }

        const scrollPos = window.scrollY + 180;
        let current = 'journey-hero';

        for (let i = 0; i < anchors.length; i++) {
          const el = document.getElementById(anchors[i]);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (scrollPos >= top) {
              current = anchors[i];
            }
          }
        }

        setActiveKey((prev) => (prev === current ? prev : current));
      });
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const handleItemHover = (idx) => {
    if (!navContainerRef.current || !faintLineRef.current) return;
    const target = itemRefs.current[idx];
    if (!target) return;

    const cRect = navContainerRef.current.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    gsap.to(faintLineRef.current, {
      x: tRect.left - cRect.left,
      width: tRect.width,
      opacity: 0.65,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleNavMouseLeave = () => {
    if (faintLineRef.current) {
      gsap.to(faintLineRef.current, {
        opacity: 0,
        duration: 0.2,
        overwrite: 'auto',
      });
    }
  };

  const scrollToSection = (anchor, idx, e) => {
    if (e) e.preventDefault();

    if (faintLineRef.current) {
      gsap.to(faintLineRef.current, { opacity: 0, duration: 0.15, overwrite: 'auto' });
    }

    isProgrammaticScrollRef.current = true;
    setActiveKey(anchor);

    if (
      typeof idx === 'number' &&
      navContainerRef.current &&
      activeLineRef.current &&
      itemRefs.current[idx]
    ) {
      const target = itemRefs.current[idx];
      const container = navContainerRef.current;
      const cRect = container.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      if (tRect.width > 0) {
        gsap.to(activeLineRef.current, {
          x: tRect.left - cRect.left,
          width: tRect.width,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    }

    if (mobileMenuOpen) {
      // Do not synchronously focus top hamburger button when scrolling to a lower section
      handleCloseDrawer(false);
    }

    smoothScrollTo(anchor);

    if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
    programmaticTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 1100);
  };

  return (
    <>
      <header
        ref={headerRef}
        data-testid="department-navbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: scrolled ? 'rgba(255, 251, 230, 0.94)' : 'rgba(255, 251, 230, 0.82)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: '2px solid #111116',
          transition: 'background 0.25s ease, padding 0.25s ease, box-shadow 0.25s ease',
        }}
        className={`w-full ${scrolled ? 'py-2.5 shadow-[0_4px_0px_0px_#111116]' : 'py-3.5'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Pure Departmental Brand Identity (same-page scroll-to-top anchor) */}
            <a
              href="#journey-hero"
              onClick={(e) => scrollToSection('journey-hero', 0, e)}
              className="flex items-center gap-2 sm:gap-2.5 group shrink-0 select-none min-w-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <img
                  src={logoMark}
                  alt="Department of EE - VDT IC Chip Mark"
                  className="w-full h-full object-contain"
                  width="40"
                  height="40"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-extrabold text-xs min-[360px]:text-sm sm:text-base xl:text-lg tracking-tight text-[#111116] leading-none whitespace-nowrap">
                    DEPT OF EE - VDT
                  </span>
                  <span className="bg-[#FFE500] text-[#111116] font-black text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded chamfer-badge border border-[#111116] leading-none whitespace-nowrap">
                    VLSI
                  </span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#6B6B78] font-bold truncate mt-0.5 whitespace-nowrap hidden min-[480px]:inline">
                  SIET COIMBATORE · TNEA 2727
                </span>
              </div>
            </a>

            {/* Desktop Same-Page Nav Items with Gliding Active & Hover Indicators */}
            <nav
              ref={navContainerRef}
              aria-label="Department Sections"
              onMouseLeave={handleNavMouseLeave}
              className="relative hidden min-[1150px]:flex items-center gap-2.5 xl:gap-4 shrink-0 py-1"
            >
              {/* Thicker Active Marker */}
              <div
                ref={activeLineRef}
                className="absolute bottom-0 h-[3.5px] bg-[#FFE500] rounded-full pointer-events-none z-10 will-change-transform shadow-[0_1px_2px_rgba(17,17,22,0.25)]"
                style={{ opacity: 0, width: 0, transform: 'translateX(0px)' }}
                aria-hidden="true"
              />

              {/* Faint Pointer Hover Indicator */}
              <div
                ref={faintLineRef}
                className="absolute bottom-0 h-[2px] bg-[#FFE500]/60 rounded-full pointer-events-none z-0 will-change-transform"
                style={{ opacity: 0, width: 0, transform: 'translateX(0px)' }}
                aria-hidden="true"
              />

              {NAV_ITEMS.map((item, idx) => {
                const isActive = activeKey === item.anchor;
                return (
                  <a
                    key={item.anchor}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    href={`#${item.anchor}`}
                    aria-current={isActive ? 'location' : undefined}
                    onMouseEnter={() => handleItemHover(idx)}
                    onClick={(e) => scrollToSection(item.anchor, idx, e)}
                    className={`text-[12.5px] xl:text-[13.5px] font-extrabold transition-colors py-1.5 whitespace-nowrap select-none ${
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

            {/* Desktop Right Action: Pure Magazine Download */}
            <div className="hidden min-[1150px]:flex items-center shrink-0">
              <a
                href="/downloads/Collage_vlsi_magazine.pdf"
                download
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs xl:text-sm px-3.5 xl:px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] hover:shadow-[4px_4px_0px_0px_#111116] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#111116]" />
                <span>Magazine PDF</span>
              </a>
            </div>

            {/* Mobile Right Actions: Magazine Quick Download + Menu Toggle */}
            <div className="flex min-[1150px]:hidden items-center gap-1.5 sm:gap-2.5 shrink-0 pr-0.5">
              <a
                href="/downloads/Collage_vlsi_magazine.pdf"
                download
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] transition-transform flex items-center gap-1 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#111116]" />
                <span className="hidden min-[380px]:inline">Magazine</span>
                <span className="min-[380px]:hidden">PDF</span>
              </a>
              <button
                ref={hamburgerButtonRef}
                type="button"
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
          onClick={() => handleCloseDrawer(true)}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Department Navigation"
            className="w-full max-w-sm bg-[#111116] text-white border-l-3 border-[#FFE500] h-full flex flex-col justify-between p-6 shadow-[-6px_0px_0px_0px_#FFE500] relative animate-in slide-in-from-right duration-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/15 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 shrink-0">
                    <img
                      src={logoMarkDark}
                      alt="Department of EE - VDT IC Chip Mark"
                      className="w-full h-full object-contain"
                      width="36"
                      height="36"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <span className="font-black text-base text-white block leading-none">
                      Department of EE - VDT
                    </span>
                    <span className="font-mono text-[10px] text-white/55 block mt-1">
                      SIET COIMBATORE · TNEA 2727
                    </span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => handleCloseDrawer(true)}
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Departmental Credentials Pill */}
              <div className="bg-[#1A1A22] border-2 border-[#B6FF00] p-3 rounded-xl flex items-center justify-between font-mono text-[11px] mb-5">
                <span className="flex items-center gap-2 text-white/90 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse shrink-0" />
                  <span>MEITY C2S EDA NETWORK</span>
                </span>
                <span className="font-black text-[#B6FF00] uppercase tracking-wider shrink-0">
                  TNEA 2727
                </span>
              </div>

              {/* Same-Page Anchor Links */}
              <nav aria-label="Mobile Department Navigation" className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeKey === item.anchor;
                  return (
                    <a
                      key={item.anchor}
                      href={`#${item.anchor}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(e) => scrollToSection(item.anchor, idx, e)}
                      className={`text-sm font-bold py-2 px-3 rounded-xl transition-colors border-b border-white/5 flex items-center justify-between ${
                        isActive
                          ? 'bg-[#FFE500] text-[#111116] shadow-[2px_2px_0px_#111116] border-2 border-[#111116]'
                          : 'text-white/90 hover:text-[#FFE500] hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs">{isActive ? '●' : '→'}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Department Publication Download CTA */}
            <div className="pt-5 mt-5 border-t border-white/15 space-y-2.5">
              <a
                href="/downloads/Collage_vlsi_magazine.pdf"
                download
                onClick={() => handleCloseDrawer(false)}
                className="w-full bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-sm py-3.5 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Download className="w-4 h-4 text-[#111116]" />
                <span>DOWNLOAD MAGAZINE (51 PAGES)</span>
              </a>
              <div className="text-center font-mono text-[11px] text-white/55">
                Official Department Archive · Department of EE - VDT · SIET
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
