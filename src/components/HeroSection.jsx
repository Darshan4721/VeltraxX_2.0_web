import React, { useState, useEffect } from 'react';
import Atropos from 'atropos/react';
import { eventConfig } from '../config/eventConfig';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  Zap,
  Terminal,
  Clock
} from 'lucide-react';

export default function HeroSection() {
  const { event, registration, prizes } = eventConfig;

  // Real-time Countdown calculation to 28 August 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(event.dates.startDate).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.dates.startDate]);

  return (
    <section className="relative min-h-[92vh] pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-tech-grid border-b border-[#111116]/8">
      
      {/* Background Architectural Watermark / Coordinates */}
      <div className="absolute top-20 right-8 md:right-16 pointer-events-none select-none hidden lg:block opacity-40">
        <div className="font-mono text-[11px] text-[#111116]/40 flex flex-col items-end gap-1">
          <span>GDSII // LAYER: M8-TOP</span>
          <span>COORDINATES: {event.institution.coordinates.lat}, {event.institution.coordinates.lng}</span>
          <span className="text-[#0055FF] font-semibold">CADENCE INNOVUS · GENUS 180nm/28nm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Asymmetric 12-Column Grid (Desktop) / Vertical Stream (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* =========================================================================
              LEFT COLUMN (55% / 7 Columns on Desktop): Editorial Narrative & CTAs
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Swiss Monospace Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116]/5 border border-[#111116]/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] ring-2 ring-[#111116]/30 animate-pulse-live" />
              <span className="font-mono text-xs md:text-[13px] font-semibold tracking-wider text-[#111116]/80 uppercase">
                {event.eyebrow}
              </span>
            </div>

            {/* Display Title with 2.0 Solar Wafer Yellow Badge */}
            <div className="relative mb-5">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black tracking-tight leading-[0.95] text-[#111116]">
                VELTRAXX
                <span className="inline-flex items-center align-middle ml-3 sm:ml-4">
                  <span className="bg-[#FFE500] text-[#111116] font-black text-2xl sm:text-3xl md:text-4xl px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg chamfer-badge border-2 border-[#111116] shadow-sm transform -rotate-2 inline-flex items-center gap-1.5">
                    <span>2.0</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A4B] animate-pulse-live" />
                  </span>
                </span>
              </h1>
            </div>

            {/* Thesis Statement Subtext */}
            <p className="text-lg sm:text-xl text-[#6B6B78] font-normal leading-relaxed max-w-2xl mb-8">
              {event.thesis}
            </p>

            {/* Operational Telemetry Pill */}
            <div className="glass-pill px-4 py-2 rounded-xl mb-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono font-medium text-[#111116] border border-[#111116]/10 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2A4B] animate-pulse-live" />
                <span className="font-bold">24 HOURS NON-STOP</span>
              </div>
              <span className="text-[#111116]/30 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0055FF]" />
                <span className="font-bold text-[#0055FF]">STRICTLY {registration.maxTeams} TEAMS CAP</span>
              </div>
              <span className="text-[#111116]/30 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% OFFLINE ARENA</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <a
                href="#register"
                className="bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-extrabold text-base px-8 py-4 rounded-xl border border-[#111116]/20 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] group"
              >
                <span>REGISTER TEAM ({registration.teamSize} MEMBERS)</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="#timeline"
                className="glass-surface hover:bg-white text-[#111116] font-semibold text-base px-6 py-4 rounded-xl border border-[#111116]/15 hover:border-[#111116]/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Explore Rulebook & Schedule</span>
                <span className="text-[#111116]/40 font-mono text-xs">↓</span>
              </a>
            </div>

            {/* Live Ticking Countdown Pod */}
            <div className="w-full max-w-xl glass-surface rounded-2xl p-4 border border-[#111116]/10 shadow-xs mb-8">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#111116]/8">
                <span className="font-mono text-xs text-[#6B6B78] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#0055FF]" />
                  <span>COUNTDOWN TO 24-HOUR HACKATHON COMMENCEMENT</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  OFFICIAL
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/80 rounded-xl p-2 border border-[#111116]/6">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#111116]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B6B78] uppercase mt-0.5">Days</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-[#111116]/6">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#111116]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B6B78] uppercase mt-0.5">Hours</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-[#111116]/6">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#111116]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B6B78] uppercase mt-0.5">Mins</div>
                </div>
                <div className="bg-white/80 rounded-xl p-2 border border-[#111116]/6">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#FF2A4B]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B6B78] uppercase mt-0.5">Secs</div>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN (45% / 5 Columns on Desktop): Atropos 2.5D Spatial Stage
             ========================================================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Atropos 2.5D Multi-Plane Spatial Component */}
            <Atropos 
              className="hero-atropos"
              highlight={false}
              shadow={false}
              rotateXMax={10}
              rotateYMax={10}
              activeOffset={30}
              shadowOffset={40}
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] max-w-[500px] flex items-center justify-center p-4">
                
                {/* Layer 0: Alignment Crosshair Box */}
                <div className="absolute inset-0 border border-dashed border-[#111116]/15 rounded-3xl pointer-events-none" />
                <span className="absolute -top-2 -left-2 font-mono text-[10px] text-[#111116]/40 bg-[#FBFBFB] px-1">[+] 0.00</span>
                <span className="absolute -top-2 -right-2 font-mono text-[10px] text-[#111116]/40 bg-[#FBFBFB] px-1">[+] 1.00</span>
                <span className="absolute -bottom-2 -left-2 font-mono text-[10px] text-[#111116]/40 bg-[#FBFBFB] px-1">[+] 0.00</span>
                <span className="absolute -bottom-2 -right-2 font-mono text-[10px] text-[#111116]/40 bg-[#FBFBFB] px-1">[+] 1.00</span>

                {/* Layer 1: Tilted 14deg Solar Yellow Polygon Wedge (Background Geometric Plane) */}
                <div 
                  data-atropos-offset="-3"
                  className="absolute inset-4 sm:inset-6 bg-[#FFE500] rounded-3xl transform rotate-3 shadow-xl border-2 border-[#111116]/15 transition-transform duration-300"
                >
                  <div className="absolute inset-0 opacity-10 bg-dot-grid" />
                  <div className="absolute top-4 right-4 font-mono text-[11px] font-black text-[#111116]/40 tracking-wider">
                    ASIC // 2.5D DIE
                  </div>
                  <div className="absolute bottom-4 left-4 font-mono text-[11px] font-bold text-[#111116]/50">
                    SIET RESEARCH LAB
                  </div>
                </div>

                {/* Layer 1.5: Deep Obsidian Carbon Offset Plane */}
                <div 
                  data-atropos-offset="-1"
                  className="absolute inset-8 sm:inset-10 bg-[#111116] rounded-2xl transform -rotate-2 opacity-90 shadow-2xl transition-transform duration-300"
                />

                {/* Layer 2: Macro Exposed ASIC Silicon Die (Foreground Photographic Subject) */}
                <div 
                  data-atropos-offset="5"
                  className="relative z-10 w-[88%] sm:w-[86%] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 bg-white"
                >
                  <picture>
                    <source media="(max-width: 640px)" srcSet="/images/hero-mobile.jpg" />
                    <img 
                      src="/images/hero-desktop.jpg" 
                      alt="VELTRAXX 2.0 Macro Silicon ASIC Die" 
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      width="1920"
                      height="1080"
                    />
                  </picture>

                  {/* Micro Chip Overlay Stamp */}
                  <div className="absolute bottom-3 left-3 bg-[#111116]/85 backdrop-blur-md px-2.5 py-1 rounded text-white font-mono text-[10px] flex items-center gap-1.5 border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
                    <span>M1-M8 COPPER INTERCONNECTS</span>
                  </div>
                </div>

                {/* Layer 3: Floating GlinUI Optical Glass Telemetry Pill (Top Offset) */}
                <div 
                  data-atropos-offset="8"
                  className="absolute top-2 left-2 sm:-left-4 z-20 glass-surface px-4 py-2.5 rounded-xl border border-white/90 shadow-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FFE500] flex items-center justify-center text-[#111116] shadow-xs">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[10px] font-bold text-[#6B6B78] uppercase">Grand Prize</span>
                    <span className="font-extrabold text-xs text-[#111116]">Direct Industry Internship</span>
                  </div>
                </div>

                {/* Layer 4: Floating Micro-UI Capacity Badge (Bottom Offset) */}
                <div 
                  data-atropos-offset="9"
                  className="absolute bottom-2 right-2 sm:-right-4 z-20 glass-surface px-3.5 py-2 rounded-xl border border-white/90 shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0055FF] animate-ping" />
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[10px] font-bold text-[#0055FF]">STRICT REGISTRATION CAP</span>
                    <span className="font-mono text-xs font-black text-[#111116]">{registration.maxTeams} TEAMS ONLY (4/TEAM)</span>
                  </div>
                </div>

              </div>
            </Atropos>

          </div>

        </div>

        {/* =========================================================================
            GROUND VITALS FOOTER CHASSIS (4 Strategic Pillars Grounding the Hero)
           ========================================================================= */}
        <div className="mt-16 pt-8 border-t border-[#111116]/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Vital 1: Event Schedule */}
            <div className="glass-surface p-4 rounded-xl border border-[#111116]/8 flex items-start gap-3.5 hover:border-[#111116]/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#111116]/5 flex items-center justify-center text-[#111116] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[11px] text-[#6B6B78] uppercase tracking-wider">Dates & Duration</span>
                <span className="font-bold text-sm text-[#111116] mt-0.5">{event.dates.display}</span>
                <span className="font-mono text-[11px] text-[#0055FF] mt-0.5 font-medium">24 Hours Non-Stop</span>
              </div>
            </div>

            {/* Vital 2: Arena & Venue */}
            <div className="glass-surface p-4 rounded-xl border border-[#111116]/8 flex items-start gap-3.5 hover:border-[#111116]/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#111116]/5 flex items-center justify-center text-[#111116] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[11px] text-[#6B6B78] uppercase tracking-wider">Host Arena</span>
                <span className="font-bold text-sm text-[#111116] mt-0.5">{event.institution.shortName} Campus</span>
                <span className="font-mono text-[11px] text-[#6B6B78] mt-0.5 line-clamp-1">{event.institution.lab}</span>
              </div>
            </div>

            {/* Vital 3: Team Structure & Fee */}
            <div className="glass-surface p-4 rounded-xl border border-[#111116]/8 flex items-start gap-3.5 hover:border-[#111116]/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#111116]/5 flex items-center justify-center text-[#111116] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[11px] text-[#6B6B78] uppercase tracking-wider">Team Fee & Size</span>
                <span className="font-bold text-sm text-[#111116] mt-0.5">₹{registration.feeINR.toLocaleString()} / Team</span>
                <span className="font-mono text-[11px] text-[#6B6B78] mt-0.5">Strictly {registration.teamSize} Members (₹{registration.feePerMemberINR}/ea)</span>
              </div>
            </div>

            {/* Vital 4: Grand Prize */}
            <div className="glass-surface p-4 rounded-xl border border-[#111116]/8 flex items-start gap-3.5 hover:border-[#111116]/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFE500]/30 flex items-center justify-center text-[#111116] shrink-0">
                <Trophy className="w-5 h-5 text-[#111116]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[11px] text-[#6B6B78] uppercase tracking-wider">Sole Championship</span>
                <span className="font-bold text-sm text-[#111116] mt-0.5">VLSI Industry Internship</span>
                <span className="font-mono text-[11px] text-emerald-600 mt-0.5 font-medium">+ Synopsys Workshop</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
