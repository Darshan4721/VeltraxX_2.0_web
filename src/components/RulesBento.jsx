import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { Laptop, Users, Bot, ShieldAlert, CheckCircle, AlertTriangle, Zap, Clock, Terminal } from 'lucide-react';

export default function RulesBento() {
  const { registration = {}, challenge = {}, event = {} } = eventConfig;
  const byod = challenge.byod || {
    title: "Strict Bring-Your-Own-Device (BYOD) Protocol",
    policy: "Participants must bring their own configured laptops, licensed EDA software (Cadence, Synopsys, OpenLane, Verilator), and FPGA dev boards if required. High-speed Gigabit LAN, multi-plug power boards, and dedicated lab benches are provided on-site."
  };

  return (
    <section id="rulebook" className="py-24 bg-[#FBFBFB] relative border-b border-[#111116]/10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Swiss Monospace Eyebrow */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse-live" />
            <span>CHAPTER 03 // ARENA GOVERNANCE & PROTOCOLS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111116] leading-tight">
            Strict Engineering Standards. <br />
            <span className="text-[#FF2E93]">Zero Ambiguity</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed">
            VELTRAXX 2.0 enforces professional semiconductor engineering protocols. 
            All teams must comply with hardware BYOD requirements, attendance checkpoints, and jury oral defense.
          </p>
        </div>

        {/* Asymmetric Vivid Bento Grid with Saturated Color Planes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* =========================================================================
              CARD 1 (7 Cols): Solar Yellow Plane — Strict BYOD Hardware & EDA Tooling
             ========================================================================= */}
          <div className="md:col-span-7 bg-[#FFE500] text-[#111116] rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-white/30 pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#111116] text-[#FFE500] flex items-center justify-center shadow-md">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#111116] text-white px-3 py-1 rounded-lg">
                  MANDATORY BYOD
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                {byod.title}
              </h3>
              
              <p className="text-sm sm:text-base font-medium text-[#111116]/85 leading-relaxed mb-6">
                {byod.policy}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-[#111116]/10">
                  <div className="font-black text-xs uppercase text-[#111116]">Supported Toolchains</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">Cadence / Synopsys / OpenLane / Verilator</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-[#111116]/10">
                  <div className="font-black text-xs uppercase text-[#111116]">Hardware Accel</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">Xilinx / Altera / Gowin FPGA boards</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111116]/15 flex items-center justify-between font-mono text-xs font-bold">
              <span>FACILITY: DEDICATED GIGABIT LAN</span>
              <span className="text-[#FF2E93] bg-[#111116] px-2 py-0.5 rounded text-[11px] text-white">
                UNINTERRUPTED UPS ON DESKS
              </span>
            </div>

          </div>

          {/* =========================================================================
              CARD 2 (5 Cols): Hot Magenta Plane — 4-Member Team Integrity
             ========================================================================= */}
          <div className="md:col-span-5 bg-[#FF2E93] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative overflow-hidden group">
            
            <div className="absolute bottom-0 right-0 translate-x-6 translate-y-6 w-40 h-40 rounded-full bg-black/15 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#FF2E93] flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-white text-[#FF2E93] px-3 py-1 rounded-lg">
                  STRICT CAP: 4
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                Team Structure & Eligibility
              </h3>
              
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
                Strictly {registration.teamSize} members per team (1 designated Leader + 3 Engineers). 
                Intra-college and inter-college cross teams welcome. Zero solo or fractional entries.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 font-mono text-xs bg-black/20 p-2.5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#B6FF00] shrink-0" />
                  <span>B.E. / B.Tech / M.E. / M.Tech</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs bg-black/20 p-2.5 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#B6FF00] shrink-0" />
                  <span>Research Scholars & Industry Techs</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-white/20 font-mono text-xs font-bold text-white/80">
              NATIONAL-LEVEL REGISTRATION // 35 TEAMS MAXIMUM
            </div>

          </div>

          {/* =========================================================================
              CARD 3 (5 Cols): Silicon Cobalt Plane — Transparent AI & EDA Policy
             ========================================================================= */}
          <div className="md:col-span-5 bg-[#0055FF] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative overflow-hidden group">
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-lg">
                  TRANSPARENCY
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                AI & External Tool Policy
              </h3>
              
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
                AI coding tools and LLMs may be utilized for scripting, syntax reference, and testbench generation. 
                However, all core RTL architecture and synthesis decisions must be defended live during jury viva.
              </p>

              <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 font-mono text-xs text-[#FFE500]">
                ⚠️ Pre-built netlists without verifiable commit history will be immediately disqualified.
              </div>
            </div>

            <div className="pt-6 border-t-2 border-white/20 font-mono text-xs font-bold text-white/80">
              HUMAN VIVA DEFENSE AT CHECKPOINTS
            </div>

          </div>

          {/* =========================================================================
              CARD 4 (7 Cols): Pitch Black Arena Chassis — Attendance Checkpoints
             ========================================================================= */}
          <div className="md:col-span-7 bg-[#0D0D11] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#B6FF00] flex flex-col justify-between relative overflow-hidden group">
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF00] text-[#111116] flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#B6FF00] text-[#111116] px-3 py-1 rounded-lg">
                  OFFLINE MANDATE
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                Physical Attendance Verification
              </h3>
              
              <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6">
                VELTRAXX 2.0 is an authentic 100% in-person sprint at SIET Coimbatore. 
                All 4 members must be physically present at the venue for mandatory roll calls.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                  <div className="font-mono text-xs text-[#FFE500] font-black">SLOT 1</div>
                  <div className="font-mono text-[11px] text-white/60 mt-0.5">11:00 AM (D1)</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                  <div className="font-mono text-xs text-[#00E5FF] font-black">SLOT 2</div>
                  <div className="font-mono text-[11px] text-white/60 mt-0.5">05:00 PM (D1)</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                  <div className="font-mono text-xs text-[#FF2E93] font-black">SLOT 3</div>
                  <div className="font-mono text-[11px] text-white/60 mt-0.5">11:30 PM (D1)</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                  <div className="font-mono text-xs text-[#B6FF00] font-black">SLOT 4</div>
                  <div className="font-mono text-[11px] text-white/60 mt-0.5">07:00 AM (D2)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-white/10 font-mono text-xs font-semibold text-white/50 flex items-center justify-between">
              <span>VENUE: SIET CAMPUS, COIMBATORE</span>
              <span className="text-[#B6FF00]">CERTIFICATION LOCKED TO ATTENDANCE</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
