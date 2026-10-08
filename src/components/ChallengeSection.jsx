import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { Cpu, Terminal, Flame, FileCode, CheckCircle2, AlertOctagon, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function ChallengeSection() {
  const { challenge = {}, event = {} } = eventConfig;
  const releaseTimeline = challenge.releaseTimeline || {
    date: "26 AUG 2026",
    time: "10:00 AM IST",
    channel: "Registered Email & Discord"
  };

  // Interactive Layer Floating & Magnetic Proximity (B2 & B3)
  const [stageHover, setStageHover] = useState({
    active: false,
    x: 0,
    y: 0,
    pill1: { x: 0, y: 0, r: 0 },
    pill2: { x: 0, y: 0, r: 0 },
  });

  const handleStageMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const normX = (cursorX / rect.width) * 2 - 1; // -1 to 1
    const normY = (cursorY / rect.height) * 2 - 1;

    // Magnetic Proximity for Pill 1 (Top-Right: ~rect.width - 50, 30)
    const p1x = rect.width - 50;
    const p1y = 30;
    const d1 = Math.hypot(cursorX - p1x, cursorY - p1y);
    let pill1Off = { x: 0, y: 0, r: 0 };
    if (d1 < 140) {
      const force1 = (1 - d1 / 140);
      pill1Off = {
        x: ((p1x - cursorX) / (d1 || 1)) * force1 * 22,
        y: ((p1y - cursorY) / (d1 || 1)) * force1 * 22,
        r: (cursorX > p1x ? -5 : 5) * force1
      };
    }

    // Magnetic Proximity for Pill 2 (Bottom-Left: ~70, rect.height - 30)
    const p2x = 70;
    const p2y = rect.height - 30;
    const d2 = Math.hypot(cursorX - p2x, cursorY - p2y);
    let pill2Off = { x: 0, y: 0, r: 0 };
    if (d2 < 140) {
      const force2 = (1 - d2 / 140);
      pill2Off = {
        x: ((p2x - cursorX) / (d2 || 1)) * force2 * 22,
        y: ((p2y - cursorY) / (d2 || 1)) * force2 * 22,
        r: (cursorX > p2x ? -5 : 5) * force2
      };
    }

    setStageHover({
      active: true,
      x: normX,
      y: normY,
      pill1: pill1Off,
      pill2: pill2Off
    });
  };

  const handleStageLeave = () => {
    setStageHover({
      active: false,
      x: 0,
      y: 0,
      pill1: { x: 0, y: 0, r: 0 },
      pill2: { x: 0, y: 0, r: 0 }
    });
  };

  return (
    <section id="challenge" className="py-24 bg-[#0D0D11] text-white relative overflow-hidden border-b-2 border-[#111116]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-10 bg-tech-grid pointer-events-none" />
      
      {/* Subtle Japanese/VLSI Kanji Watermark from Reference 2 */}
      <span className="absolute -bottom-10 right-4 font-black text-8xl sm:text-9xl text-white/[0.03] pointer-events-none select-none tracking-tighter">
        集積回路
      </span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1A22] border border-[#FFE500]/30 text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse-live" />
              <span>CHAPTER 02 // HARDWARE PROBLEM ARCHITECTURE</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              One Unified <span className="text-[#FFE500] underline decoration-[#FF2E93] decoration-wavy decoration-2">Industry Statement</span>.
            </h2>
            <p className="text-base sm:text-lg text-white/70 mt-4 leading-relaxed">
              Zero fragmented toy tracks. All 35 teams receive exactly one industrial-grade digital design 
              problem released 48 hours prior. Architect, synthesize, and validate working silicon RTL on your own rigs.
            </p>
          </div>

          <div className="shrink-0 bg-[#16161D] border-2 border-white/20 rounded-2xl p-5 shadow-[6px_6px_0px_0px_#00E5FF] flex flex-col gap-2">
            <span className="font-mono text-xs text-[#00E5FF] font-bold uppercase tracking-wider">
              OFFICIAL PROBLEM RELEASE
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#FFE500]">
              {releaseTimeline.date} // {releaseTimeline.time}
            </div>
            <span className="font-mono text-xs text-white/50">
              {releaseTimeline.channel} · Paid & Verified Teams Only
            </span>
          </div>
        </div>

        {/* 2-Column High-Voltage Layout: Left Technical Specs, Right Layered Visual Breakout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (7 Cols): The 4 Required Verification Pillars */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pillar 1: RTL Architecture */}
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/20 hover:border-[#FFE500] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black text-sm mb-4 shadow-[2px_2px_0px_0px_#111116]">
                  01
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFE500] transition-colors">
                  SystemVerilog / RTL Design
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Clean, synthesizeable SystemVerilog or Verilog architecture complying with strict synchronous clock domain rules.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-[#00E5FF] font-semibold">
                  DELIVERABLE: RTL CODEBASE
                </div>
              </div>

              {/* Pillar 2: Synthesis & Timing */}
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/20 hover:border-[#FF2E93] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#FF2E93] text-[#111116] flex items-center justify-center font-black text-sm mb-4 shadow-[2px_2px_0px_0px_#111116]">
                  02
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF2E93] transition-colors">
                  Logic Synthesis & STA Closure
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Target standard cell libraries (180nm/28nm) using Cadence Genus, Synopsys, or OpenLane. Zero unconstrained paths.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-[#FF2E93] font-semibold">
                  DELIVERABLE: AREA & TIMING QOR
                </div>
              </div>

              {/* Pillar 3: Verification Simulation */}
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/20 hover:border-[#0055FF] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-black text-sm mb-4 shadow-[2px_2px_0px_0px_#111116]">
                  03
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#0055FF] transition-colors">
                  Exhaustive Simulation & UVM
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Self-checking testbenches with corner case functional coverage, assertions, and glitch-free waveform verification.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-[#FFE500] font-semibold">
                  DELIVERABLE: VCD/FSDB WAVEFORMS
                </div>
              </div>

              {/* Pillar 4: Live Jury Viva */}
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/20 hover:border-[#B6FF00] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#B6FF00] text-[#111116] flex items-center justify-center font-black text-sm mb-4 shadow-[2px_2px_0px_0px_#111116]">
                  04
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#B6FF00] transition-colors">
                  Oral Viva & Live Defense
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Rigorous jury examination. Each team member must defend architectural trade-offs, critical paths, and latency decisions live.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-[#B6FF00] font-semibold">
                  VALIDATION: 100% HUMAN DEFENSE
                </div>
              </div>

            </div>

            {/* Lineage & Institutional Credential Pill */}
            <div className="p-5 rounded-2xl bg-[#1A1A26] border border-[#FFE500]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFE500] text-[#111116] flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Backed by C2S Semiconductor Infrastructure</div>
                  <div className="font-mono text-xs text-white/60">Sri Shakthi Institute of Engineering and Technology, Coimbatore</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#FFE500] shrink-0">
                CADENCE & SYNOPSYS FLOWS
              </span>
            </div>

          </div>

          {/* Right Column (5 Cols): Layered Color Planes & Exploded 5-Tier 3D Chip Breakout */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            <div 
              onMouseMove={handleStageMove}
              onMouseLeave={handleStageLeave}
              className="relative w-full aspect-square max-w-[480px] flex items-center justify-center select-none cursor-pointer group"
            >
              
              {/* Layer 1: Giant Solar Wafer Yellow Circle (#FFE500) - Slides / Tilts Left */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(-24px, ${stageHover.y * 10}px) rotate(-8deg)` 
                    : 'none',
                  transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-[8px_8px_0px_0px_#111116] pointer-events-none"
              >
                <div className="absolute inset-0 rounded-full opacity-20 bg-dot-grid" />
                <span className="absolute top-6 left-6 font-mono text-xs font-black text-[#111116]/60 uppercase tracking-widest">
                  SILICON DIE // 180nm - 28nm
                </span>
              </div>

              {/* Layer 2: Tilted Hot Magenta Slab (#FF2E93) - Slides / Tilts Right */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(28px, ${-stageHover.y * 12}px) rotate(16deg)` 
                    : 'rotate(-12deg) translate(24px, -16px)',
                  transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[240px] h-[300px] sm:w-[280px] sm:h-[340px] bg-[#FF2E93] rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] pointer-events-none"
              >
                <div className="absolute bottom-4 right-4 font-mono text-xs font-black text-white/70">
                  STA CLOSURE
                </div>
              </div>

              {/* Layer 3: Electric Violet Wedge - Lags Slightly */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(16px, 24px) rotate(-14deg)` 
                    : 'rotate(12deg) translate(-48px, 48px)',
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[200px] h-[200px] bg-[#7B2FFF] rounded-2xl border-2 border-[#111116] opacity-90 shadow-[4px_4px_0px_0px_#111116] pointer-events-none" 
              />

              {/* Layer 4: Exploded 5-Tier 3D ASIC Chip Stack Cutout (B3 Asset Replacement) */}
              <div 
                style={{
                  transform: stageHover.active
                    ? `perspective(1000px) rotateX(${-stageHover.y * 14}deg) rotateY(${stageHover.x * 14}deg) scale(1.08)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                  transition: 'transform 0.25s ease-out'
                }}
                className="relative z-20 w-[95%] h-[95%] flex items-center justify-center filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] pointer-events-none"
              >
                <img 
                  src="/images/chip-stack-exploded-transparent.webp" 
                  alt="VELTRAXX 2.0 Exploded 5-Tier 3D Silicon ASIC Architecture" 
                  width="800"
                  height="800"
                  className="w-full h-full object-contain filter contrast-110 saturate-110"
                  loading="lazy"
                />
              </div>

              {/* Layer 5: Floating Badges with Magnetic Pointer Proximity (B2 & B3) */}
              <div 
                style={{
                  transform: `rotate(6deg) translate(${stageHover.pill1.x}px, ${stageHover.pill1.y}px) rotate(${stageHover.pill1.r}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="absolute -top-3 right-0 z-30 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] pointer-events-none"
              >
                24H ACTIVE SPRINT
              </div>

              <div 
                style={{
                  transform: `rotate(-6deg) translate(${stageHover.pill2.x}px, ${stageHover.pill2.y}px) rotate(${stageHover.pill2.r}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="absolute -bottom-4 left-2 z-30 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] pointer-events-none"
              >
                35 TEAMS MAXIMUM
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
