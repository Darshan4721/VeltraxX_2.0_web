import React, { useState, useEffect } from 'react';
import { eventConfig } from '../config/eventConfig';
import { Cpu, ArrowUpRight, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Challenge", href: "#challenge" },
    { label: "Timeline", href: "#timeline" },
    { label: "Rulebook", href: "#rulebook" },
    { label: "Prizes", href: "#prizes" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.65)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '2px solid #111116',
      }}
      className={`w-full transition-all duration-300 ${
        scrolled ? 'py-3 shadow-md' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Identity */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#111116] flex items-center justify-center text-[#FFE500] shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#111116]">
                  {eventConfig.event.name.split(' ')[0]}
                </span>
                <span className="bg-[#FFE500] text-[#111116] font-bold text-xs px-1.5 py-0.5 rounded chamfer-badge border border-[#111116]/10">
                  {eventConfig.event.name.split(' ')[1]}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6B78] font-medium">
                {eventConfig.event.institution.shortName} · ECE VLSI
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#111116]/75 hover:text-[#111116] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFE500] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Action & Status Badge */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="glass-pill px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-medium text-[#111116]">
              <span className="w-2 h-2 rounded-full bg-[#FF2A4B] animate-pulse-live" />
              <span>{eventConfig.registration.maxTeams} TEAMS CAP</span>
            </div>

            <a
              href="#register"
              className="bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-bold text-sm px-5 py-2.5 rounded-lg border border-[#111116]/15 shadow-sm hover:shadow transition-all duration-150 flex items-center gap-1.5 active:scale-95"
            >
              <span>Register Team</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#register"
              className="bg-[#FFE500] text-[#111116] font-bold text-xs px-3 py-1.5 rounded-md border border-[#111116]/10"
            >
              Register
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-[#111116]/10 text-[#111116] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-surface border-b border-[#111116]/10 px-4 pt-4 pb-6 mt-2 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-3">
            <div className="glass-pill px-3 py-1.5 rounded-full flex items-center justify-between text-xs font-mono text-[#111116] mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF2A4B] animate-pulse-live" />
                <span>OFFLINE ARENA · {eventConfig.event.institution.shortName}</span>
              </span>
              <span className="font-bold text-[#0055FF]">{eventConfig.registration.maxTeams} TEAMS MAX</span>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#111116] py-2 border-b border-[#111116]/5 hover:text-[#0055FF] transition-colors"
              >
                {link.label}
              </a>
            ))}

            <a
              href="#register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 bg-[#FFE500] text-[#111116] text-center font-bold text-sm py-3 rounded-lg border border-[#111116]/15 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>REGISTER TEAM (4 MEMBERS)</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
