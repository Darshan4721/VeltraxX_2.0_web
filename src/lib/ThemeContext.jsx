import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({
  isViceMode: false,
  isEffectiveViceMode: false,
  toggleViceMode: () => {},
  isRouteExcluded: false,
});

// Explicit list of operational/form/sensitive routes where Vice Mode is strictly excluded
const EXCLUDED_ROUTES = [
  '/register',
  '/submit-ppt',
  '/round2-confirm',
  '/tracker',
  '/admin'
];

export function ThemeProvider({ children }) {
  const location = useLocation();

  // Read stored preference: default is false (permanent default Neo-Brutalist theme)
  const [vicePreference, setVicePreference] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('veltraxx_theme_mode') === 'vice';
    } catch {
      return false;
    }
  });

  // Check if current route is excluded
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isRouteExcluded = useMemo(() => {
    return EXCLUDED_ROUTES.some((route) => normalizedPath === route || normalizedPath.startsWith(route + '/'));
  }, [normalizedPath]);

  // Effective state: Vice Mode is active ONLY when user enabled it AND current route is not excluded
  const isEffectiveViceMode = vicePreference && !isRouteExcluded;

  // Synchronize DOM attribute <html data-theme="..."> on document.documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (isEffectiveViceMode) {
      root.setAttribute('data-theme', 'vice');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isEffectiveViceMode]);

  // Toggle function
  const toggleViceMode = useCallback(() => {
    setVicePreference((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('veltraxx_theme_mode', next ? 'vice' : 'default');
      } catch (err) {
        console.warn('[Theme] Could not persist theme preference:', err);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    isViceMode: vicePreference,
    isEffectiveViceMode,
    toggleViceMode,
    isRouteExcluded,
  }), [vicePreference, isEffectiveViceMode, toggleViceMode, isRouteExcluded]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
