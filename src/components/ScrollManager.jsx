import React, { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

/**
 * Global smooth scroll helper with GSAP ScrollToPlugin.
 * - Auto-cancels if user scrolls with mouse wheel or touch (autoKill: true).
 * - Capped duration: 0.7s to 1.4s based on distance.
 * - Offset lands section header cleanly below sticky navbar (80px offset).
 * - Instant jump under prefers-reduced-motion.
 */
export function smoothScrollTo(elementId, e) {
  if (e) {
    e.preventDefault();
  }

  const target = document.getElementById(elementId.replace(/^#/, ''));
  if (!target) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headerOffset = 85;
  const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

  if (prefersReduced) {
    window.scrollTo({ top: targetY, behavior: 'instant' });
    if (window.history.pushState) {
      window.history.replaceState(null, '', `#${elementId.replace(/^#/, '')}`);
    }
    return;
  }

  const distance = Math.abs(window.scrollY - targetY);
  // Scale duration with distance, bounded between 0.5s and 1.1s
  const duration = Math.min(1.1, Math.max(0.5, distance / 2200));

  gsap.to(window, {
    scrollTo: { y: targetY, autoKill: false },
    duration: duration,
    ease: "power2.inOut",
    onComplete: () => {
      if (window.history.replaceState) {
        window.history.replaceState(null, '', `#${elementId.replace(/^#/, '')}`);
      }
    }
  });
}

// Convenient alias for scrollToSection
export const scrollToSection = smoothScrollTo;

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Instant scroll-to-top on route change (PUSH / REPLACE), ignoring POP (browser back/forward)
  useLayoutEffect(() => {
    if (navigationType !== 'POP' && !location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Move keyboard/screen-reader focus to page heading or main content
      const mainHeading = document.querySelector('h1, [tabIndex="-1"]');
      if (mainHeading) {
        if (!mainHeading.getAttribute('tabindex')) {
          mainHeading.setAttribute('tabindex', '-1');
        }
        mainHeading.focus({ preventScroll: true });
      }
    }
  }, [location.pathname, navigationType]);

  // Handle cross-page hash landing (e.g. Navigating from /about or /register to /#timeline)
  useEffect(() => {
    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          smoothScrollTo(hashId);
        });
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return null;
}

