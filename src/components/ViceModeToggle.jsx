import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Palmtree, Sun, Sparkles } from 'lucide-react';

export default function ViceModeToggle({ className = '', compact = false }) {
  const { isViceMode, isEffectiveViceMode, toggleViceMode, isRouteExcluded } = useTheme();

  // On operational/form routes (/register, /admin, etc.), the theme is permanently default
  if (isRouteExcluded) {
    return null;
  }

  const isViceActive = isEffectiveViceMode;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isViceActive}
      aria-label={isViceActive ? "Switch to Default Neo-Brutalist theme" : "Switch to Vice Mode theme"}
      onClick={toggleViceMode}
      title={isViceActive ? "Vice Mode is active. Click to return to Default theme." : "Activate Vice Mode (Retro-Miami aesthetic)"}
      className={`
        inline-flex items-center gap-1.5 transition-all duration-200 select-none
        font-mono font-black uppercase text-[11px] sm:text-xs tracking-wider cursor-pointer
        ${compact ? 'px-2.5 py-1 rounded-lg' : 'px-3 py-1.5 rounded-lg'}
        ${isViceActive
          ? 'bg-gradient-to-r from-[#FF1B7A] to-[#FF6E00] text-white border-2 border-[#180828] shadow-[2px_2px_0px_0px_#180828] hover:shadow-[3px_3px_0px_0px_#00D4FF] hover:brightness-105 active:translate-x-[1px] active:translate-y-[1px]'
          : 'bg-white text-[#111116] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:bg-[#FFE500] hover:shadow-[3px_3px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px]'
        }
        ${className}
      `}
    >
      {isViceActive ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>DEFAULT</span>
          <span className="hidden sm:inline text-[9px] px-1 py-0.2 bg-black/20 text-white rounded border border-white/30 font-bold">
            ON
          </span>
        </>
      ) : (
        <>
          <Palmtree className="w-3.5 h-3.5 text-[#FF2E93]" />
          <span>VICE MODE</span>
          <Sparkles className="w-3 h-3 text-[#FFE500] hidden sm:inline" />
        </>
      )}
    </button>
  );
}
