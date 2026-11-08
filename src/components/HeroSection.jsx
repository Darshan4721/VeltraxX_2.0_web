import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Atropos from 'atropos/react';
import { eventConfig } from '../config/eventConfig';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Download, 
  Zap,
  Sparkles,
  Clock,
  Layers,
  Flame,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function HeroSection() {
  const { event, registration, stages } = eventConfig;

  // Real-time Countdown calculation to Round 1 Close (01 Dec 2026, 23:59:59 IST)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDateStr = stages?.round1?.closeDate || '2026-12-01T23:59:59+05:30';
    const target = new Date(targetDateStr).getTime();
    
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
  }, [stages?.round1?.closeDate]);

  return (
    <section id="overview" className="relative min-h-[96vh] pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden bg-[#FBFBFB] bg-tech-grid border-b-2 border-[#111116]">
      
      {/* Background Architectural Watermarks */}
      <div className="absolute top-20 right-6 md:right-14 pointer-events-none select-none hidden lg:block opacity-40 z-0">
        <div className="font-mono text-xs text-[#111116]/50 flex flex-col items-end gap-1">
          <span className="bg-[#FFE500] text-[#111116] px-2 py-0.5 font-black text-[10px] rounded">
            SILICON // ARCHITECTURE 2.0
          </span>
          <span className="font-bold text-[#FF2E93]">COIMBATORE // 11.0168°N, 76.9558°E</span>
          <span className="text-[#0055FF] font-semibold">CADENCE INNOVUS · FPGA · EDGE AI · IOT</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 12-Column Hero Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* =========================================================================
              LEFT COLUMN (58% / 7 Cols): Vivid Editorial Typography & Strategic CTAs
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
            
            {/* Swiss Monospace Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#111116] text-white border border-[#FFE500]/40 mb-6 shadow-[2px_2px_0px_0px_#FFE500] max-w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse-live shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs md:text-[13px] font-black tracking-wider text-[#FFE500] uppercase leading-tight truncate">
                <span className="sm:hidden">2-STAGE TECH & SILICON HACKATHON · SIET</span>
                <span className="hidden sm:inline">NATIONAL-LEVEL 2-STAGE TECH & SILICON HACKATHON · SIET COIMBATORE</span>
              </span>
            </div>

            {/* Display Title with Vivid Color Tension */}
            <div className="relative mb-5">
              
              {/* Subtle VLSI Background Glyph Motif */}
              <span className="absolute -top-10 -left-6 font-black text-7xl sm:text-9xl text-[#111116]/[0.04] pointer-events-none select-none tracking-tighter">
                集積回路
              </span>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-black tracking-tight leading-[0.92] text-[#111116]">
                VELTRAXX
                <span className="inline-flex items-center align-middle ml-3 sm:ml-4">
                  <span className="bg-[#FFE500] text-[#111116] font-black text-2xl sm:text-3xl md:text-4xl px-3.5 py-1.5 rounded-xl chamfer-badge border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] transform -rotate-3 inline-flex items-center gap-2 hover:rotate-0 transition-transform">
                    <span>2.0</span>
                    <span className="w-3 h-3 rounded-full bg-[#FF2E93] animate-pulse-live" />
                  </span>
                </span>
              </h1>
            </div>

            {/* Thesis Statement Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-[#111116]/85 font-medium leading-relaxed max-w-2xl mb-7">
              Pitch your blueprint online for <strong className="text-[#111116] underline decoration-[#B6FF00] decoration-4">FREE</strong> in Round 1. Survive the shortlist, enter the 24-hour offline arena at SIET Coimbatore, and build through live engineering twists.
            </p>

            {/* 4 Bold High-Impact Vitals Bar (Restored Vivid Palette) */}
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              <div className="bg-[#0D0D11] text-[#FFE500] px-3.5 py-2 rounded-lg font-mono text-xs font-black flex items-center gap-2 shadow-sm border border-[#FFE500]/30">
                <Flame className="w-4 h-4 text-[#FF2E93] fill-current" />
                <span>ROUND 1: ₹0 FREE FOR ALL</span>
              </div>

              <div className="bg-[#FF2E93] text-[#111116] px-3.5 py-2 rounded-lg font-mono text-xs font-black flex items-center gap-2 shadow-sm">
                <Users className="w-4 h-4 text-[#111116]" />
                <span>2-4 MEMBERS</span>
              </div>

              <div className="bg-[#00E5FF] text-[#111116] px-3.5 py-2 rounded-lg font-mono text-xs font-black flex items-center gap-2 shadow-sm">
                <Layers className="w-4 h-4" />
                <span>5 TRACKS (ASIC · FPGA · AI · IOT · OPEN)</span>
              </div>

              <div className="bg-[#B6FF00] text-[#111116] px-3.5 py-2 rounded-lg font-mono text-xs font-black flex items-center gap-2 shadow-sm hidden sm:flex">
                <Trophy className="w-4 h-4" />
                <span>FINALE: 15-16 DEC 2026</span>
              </div>
            </div>

            {/* Tactile High-Energy Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-4">
              <Link
                to="/register"
                className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-base px-8 py-4 rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 group h-14"
              >
                <span>REGISTER TEAM FOR FREE →</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>

              <a
                href="#downloads"
                className="bg-white hover:bg-[#111116] text-[#111116] hover:text-white font-black text-base px-6 py-4 rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 h-14"
              >
                <Download className="w-4 h-4" />
                <span>Download Problem PDF & PPT ↓</span>
              </a>
            </div>

            {/* Auxiliary Gatekeeper Link */}
            <div className="mb-8 font-mono text-xs text-[#111116]/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0055FF]" />
              <span>Shortlisted for Round 2?</span>
              <Link to="/round2-confirm" className="font-bold underline decoration-[#0055FF] hover:text-[#0055FF]">
                Confirm Your Seat Here →
              </Link>
            </div>

            {/* =========================================================================
                HIGH-VOLTAGE REALTIME COUNTDOWN STRIP (Restored Glass Translucent Styling)
               ========================================================================= */}
            <div className="w-full max-w-xl bg-[#0D0D11] text-white rounded-2xl p-4 sm:p-5 border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] relative overflow-hidden">
              {/* Radiant Neon Ambient Halo */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF2E93]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10 relative z-10">
                <span className="font-mono text-xs text-white/90 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFE500]" />
                  <span>COUNTDOWN TO ROUND 1 CLOSE (01 DEC 2026, 11:59 PM)</span>
                </span>
                <span className="font-mono text-[10px] font-black bg-[#FFE500] text-[#111116] px-2 py-0.5 rounded">
                  ROUND 1 FREE
                </span>
              </div>

              {/* 4 Frosted Translucent Dark Glass Digit Containers with Vivid Neon Values */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center relative z-10">
                <div className="bg-white/10 rounded-xl p-1.5 sm:p-2.5 border border-white/10">
                  <div className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-[#FFE500]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider sm:tracking-widest mt-0.5 font-bold">Days</div>
                </div>

                <div className="bg-white/10 rounded-xl p-1.5 sm:p-2.5 border border-white/10">
                  <div className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-[#00E5FF]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider sm:tracking-widest mt-0.5 font-bold">Hours</div>
                </div>

                <div className="bg-white/10 rounded-xl p-1.5 sm:p-2.5 border border-white/10">
                  <div className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-[#B6FF00]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider sm:tracking-widest mt-0.5 font-bold">Mins</div>
                </div>

                <div className="bg-white/10 rounded-xl p-1.5 sm:p-2.5 border border-white/10">
                  <div className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-[#FF2E93]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/60 uppercase tracking-wider sm:tracking-widest mt-0.5 font-bold">Secs</div>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN (42% / 5 Cols): 2.5D Layered Color Planes & 3D Chip Cutout
             ========================================================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-8 lg:pt-0">
            
            {/* Atropos 2.5D Multi-Plane Spatial Engine */}
            <Atropos 
              className="hero-atropos"
              highlight={false}
              shadow={false}
              rotateXMax={12}
              rotateYMax={12}
              activeOffset={40}
              shadowOffset={50}
            >
              <div className="relative w-full aspect-[1/1] max-w-[520px] flex items-center justify-center p-2 select-none">
                
                {/* LAYER -5: Tilted Solar Wafer Yellow Circle (#FFE500) */}
                <div 
                  data-atropos-offset="-5"
                  className="absolute w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-[8px_8px_0px_0px_#111116] transition-transform duration-300"
                >
                  <div className="absolute inset-0 rounded-full opacity-15 bg-dot-grid" />
                  <span className="absolute top-8 left-8 font-mono text-xs font-black text-[#111116]/50 uppercase tracking-widest">
                    300mm WAFER BASE
                  </span>
                </div>

                {/* LAYER -4: Hot Magenta Slab (#FF2E93) Tilted 12deg */}
                <div 
                  data-atropos-offset="-3"
                  className="absolute w-[270px] h-[330px] sm:w-[310px] sm:h-[370px] bg-[#FF2E93] rounded-3xl transform rotate-12 -translate-x-8 -translate-y-4 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] transition-transform duration-300"
                >
                  <div className="absolute bottom-6 right-6 font-mono text-xs font-black text-white/70">
                    SIET // COIMBATORE
                  </div>
                </div>

                {/* LAYER -3: Electric Violet Shard (#7B2FFF) & Deep Obsidian Drop */}
                <div 
                  data-atropos-offset="-2"
                  className="absolute w-[210px] h-[210px] sm:w-[250px] sm:h-[250px] bg-[#7B2FFF] rounded-2xl transform -rotate-12 translate-x-14 translate-y-16 border-3 border-[#111116] opacity-95 transition-transform duration-300"
                />

                <div 
                  data-atropos-offset="-1"
                  className="absolute w-[170px] h-[170px] bg-[#0D0D11] rounded-2xl transform rotate-6 translate-x-4 translate-y-24 opacity-90 border-2 border-[#111116] transition-transform duration-300"
                />

                {/* LAYER 1: TYPOGRAPHIC WEAVE - "VEL" BEHIND CHIP */}
                <div 
                  data-atropos-offset="1"
                  className="absolute -top-4 -left-4 sm:-top-8 sm:-left-6 z-10 pointer-events-none"
                >
                  <span className="font-black text-7xl sm:text-8xl md:text-9xl text-[#111116] tracking-tighter opacity-90 drop-shadow-md">
                    VEL
                  </span>
                </div>

                {/* LAYER 5: FRAMELESS 3D SILICON CHIP CUTOUT BREAKING OUT */}
                <div 
                  data-atropos-offset="5"
                  className="relative z-20 w-[95%] sm:w-[92%] h-[95%] sm:h-[92%] flex items-center justify-center"
                >
                  <picture className="w-full h-full flex items-center justify-center">
                    <source media="(max-width: 640px)" srcSet="/images/hero-chip-mobile.webp" type="image/webp" />
                    <source srcSet="/images/hero-chip-transparent.webp" type="image/webp" />
                    <img 
                      src="/images/hero-chip-transparent.webp" 
                      alt="VELTRAXX 2.0 3D Exposed Silicon ASIC Die" 
                      width="800"
                      height="800"
                      className="w-full h-full object-contain filter contrast-110 saturate-110 drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-500 pointer-events-auto"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </picture>
                </div>

                {/* LAYER 8: TYPOGRAPHIC WEAVE - "TRAXX 2.0" IN FRONT OF CHIP */}
                <div 
                  data-atropos-offset="8"
                  className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-4 z-30 pointer-events-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-6xl sm:text-7xl md:text-8xl text-[#111116] tracking-tighter drop-shadow-2xl">
                      TRAXX
                    </span>
                    <span className="bg-[#FFE500] text-[#111116] font-black text-3xl sm:text-4xl px-3 py-1 rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] transform rotate-3">
                      2.0
                    </span>
                  </div>
                </div>

                {/* LAYER 9: BOLD TILTED SOLID-COLOR TELEMETRY BADGES */}
                <div 
                  data-atropos-offset="9"
                  className="absolute top-4 -right-2 sm:-right-6 z-40 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] transform rotate-6 flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>ROUND 1: ₹0 FREE</span>
                </div>

                <div 
                  data-atropos-offset="10"
                  className="absolute bottom-16 -left-4 sm:-left-8 z-40 bg-[#FF2E93] text-white font-mono text-xs font-black px-4 py-2 rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] transform -rotate-6 flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                >
                  <Trophy className="w-4 h-4" />
                  <span>TOP 30 FINALE</span>
                </div>

                <div 
                  data-atropos-offset="10"
                  className="absolute bottom-2 -left-3 sm:-left-6 z-40 bg-[#B6FF00] text-[#111116] font-mono text-[11px] font-black px-3 py-1.5 rounded-lg border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] transform -rotate-2 transition-transform duration-300 hover:scale-105"
                >
                  SIET COIMBATORE
                </div>

              </div>
            </Atropos>

          </div>

        </div>

        {/* =========================================================================
            GROUND VITALS STRIP (Restored B1 Spring Tilt Tactile 4-Card Chassis)
           ========================================================================= */}
        <div className="mt-14 pt-8 border-t-2 border-[#111116]/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Vital 1: Schedule (Hot Magenta Accent - Tilts Down-Right +3deg, scale 1.04) */}
            <div className="vital-tilt-box vital-tilt-1 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FF2E93] cursor-pointer select-none">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#FF2E93] font-black uppercase tracking-wider">01 // ROUND 1 CLOSE</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93]" />
              </div>
              <div className="font-black text-lg text-[#111116]">01 Dec 2026 (11:59 PM)</div>
              <div className="font-mono text-xs text-[#111116]/70 mt-1 font-semibold">100% Free Online Idea Pitch</div>
            </div>

            {/* Vital 2: Arena (Solar Yellow Accent - Tilts Up-Left -4deg, scale 1.06) */}
            <div className="vital-tilt-box vital-tilt-2 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] cursor-pointer select-none">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#111116] font-black uppercase tracking-wider">02 // 48H PPT PITCH</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500]" />
              </div>
              <div className="font-black text-lg text-[#111116]">02 - 03 Dec 2026</div>
              <div className="font-mono text-xs text-[#111116]/70 mt-1 font-semibold">Online Portal · 6-Slide Template</div>
            </div>

            {/* Vital 3: Fee (Cobalt Accent - Tilts +2deg, scale 1.03) */}
            <div className="vital-tilt-box vital-tilt-3 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#0055FF] cursor-pointer select-none">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#0055FF] font-black uppercase tracking-wider">03 // 24H FINALE ARENA</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#0055FF]" />
              </div>
              <div className="font-black text-lg text-[#111116]">15 - 16 Dec 2026</div>
              <div className="font-mono text-xs text-[#111116]/70 mt-1 font-semibold">Top ~30 Teams @ SIET Coimbatore</div>
            </div>

            {/* Vital 4: Championship (Neon Lime Accent - Tilts -3deg, scale 1.05) */}
            <div className="vital-tilt-box vital-tilt-4 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] cursor-pointer select-none">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#111116] font-black uppercase tracking-wider">04 // 50/50 LIVE TWIST</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00]" />
              </div>
              <div className="font-black text-lg text-[#111116]">Cash Awards + Trophies</div>
              <div className="font-mono text-xs text-emerald-600 mt-1 font-bold">Direct VLSI Internships + Faculty OD</div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
