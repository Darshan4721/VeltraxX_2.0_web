import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { Cpu, Terminal, Flame, FileCode, CheckCircle2, AlertOctagon, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function ChallengeSection() {
  const { challenge = {}, event = {} } = eventConfig;
  const releaseTimeline = challenge.releaseTimeline || {
    date: "26 AUG 2026",
    time: "10:00 AM IST",
    channel: "Registered Email & Discord"
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

          <div className="shrink-0 bg-[#16161D] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-2">
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
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/10 hover:border-[#FFE500] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black text-sm mb-4 shadow-md">
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
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/10 hover:border-[#FF2E93] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#FF2E93] text-white flex items-center justify-center font-black text-sm mb-4 shadow-md">
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
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/10 hover:border-[#0055FF] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-black text-sm mb-4 shadow-md">
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
              <div className="bg-[#16161E] p-6 rounded-2xl border-2 border-white/10 hover:border-[#B6FF00] transition-colors relative group">
                <div className="w-10 h-10 rounded-xl bg-[#B6FF00] text-[#111116] flex items-center justify-center font-black text-sm mb-4 shadow-md">
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

          {/* Right Column (5 Cols): Layered Color Planes & 3D Chip Breakout Motif */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center select-none">
              
              {/* Layer 1: Giant Solar Wafer Yellow Circle (#FFE500) */}
              <div className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#FFE500] border-4 border-white/20 shadow-2xl">
                <div className="absolute inset-0 rounded-full opacity-20 bg-dot-grid" />
                <span className="absolute top-6 left-6 font-mono text-xs font-black text-[#111116]/60 uppercase tracking-widest">
                  SILICON DIE // 180nm - 28nm
                </span>
              </div>

              {/* Layer 2: Tilted Hot Magenta Slab (#FF2E93) */}
              <div className="absolute w-[240px] h-[300px] sm:w-[280px] sm:h-[340px] bg-[#FF2E93] rounded-3xl transform -rotate-12 translate-x-6 -translate-y-4 border-3 border-white/30 shadow-2xl">
                <div className="absolute bottom-4 right-4 font-mono text-xs font-black text-white/70">
                  STA CLOSURE
                </div>
              </div>

              {/* Layer 3: Electric Violet Wedge */}
              <div className="absolute w-[200px] h-[200px] bg-[#7B2FFF] rounded-2xl transform rotate-12 -translate-x-12 translate-y-12 border-2 border-white/20 opacity-90 shadow-xl" />

              {/* Layer 4: 3D Chip Burst Image Breaking Out of the Center */}
              <div className="relative z-20 w-[90%] h-[90%] flex items-center justify-center">
                <img 
                  src="/images/chip-burst-transparent.png" 
                  alt="3D Semiconductor Die Bursting with Gold Wire Bonds" 
                  className="w-full h-full object-contain filter contrast-115 saturate-115 drop-shadow-[0_25px_40px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Layer 5: Tilted Solid Badges Overlapping the Card Boundary */}
              <div className="absolute -top-3 right-0 z-30 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-xl transform rotate-6">
                24H ACTIVE SPRINT
              </div>

              <div className="absolute -bottom-4 left-2 z-30 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-xl transform -rotate-6">
                35 TEAMS MAXIMUM
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
