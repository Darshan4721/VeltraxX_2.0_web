import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { ArrowUpRight, ShieldAlert, CheckCircle2, Lock, Flame, Zap } from 'lucide-react';

export default function ClosingCta() {
  const { registration, event } = eventConfig;

  return (
    <section id="register" className="py-24 bg-[#0D0D11] text-white relative overflow-hidden border-b-2 border-[#111116]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-15 bg-tech-grid pointer-events-none" />

      {/* Radiant Color Blur Halos */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FFE500]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF2E93]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Status Pills */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A1A24] border border-[#FFE500]/40 text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-6 shadow-xl">
          <Lock className="w-3.5 h-3.5 text-[#FF2E93]" />
          <span>STRICT CAPACITY GATE // {registration.maxTeams} TEAMS CAP</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          Secure Your Team's <br />
          <span className="text-[#FFE500]">Silicon Arena Slot</span>.
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Registration fee is strictly <span className="text-white font-bold underline decoration-[#FFE500]">₹{registration.feeINR.toLocaleString()} per team</span> of {registration.teamSize} members 
          (₹{registration.feePerMemberINR} per member). Once 35 teams are verified, the portal permanently shuts.
        </p>

        {/* 4-Step Registration Protocol Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-12 text-left">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="font-mono text-xs text-[#FFE500] font-black">STEP 01</div>
            <div className="font-bold text-xs text-white mt-1">Form Submission</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">1 Leader + 3 Members</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="font-mono text-xs text-[#00E5FF] font-black">STEP 02</div>
            <div className="font-bold text-xs text-white mt-1">UPI Scan Payment</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">₹1,000 flat per team</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="font-mono text-xs text-[#FF2E93] font-black">STEP 03</div>
            <div className="font-bold text-xs text-white mt-1">Receipt Upload</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">UTR / Reference No.</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
            <div className="font-mono text-xs text-[#B6FF00] font-black">STEP 04</div>
            <div className="font-bold text-xs text-white mt-1">Team ID Issued</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">Arena pass confirmed</div>
          </div>
        </div>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="mailto:contact@siet.ac.in?subject=VELTRAXX 2.0 Team Registration Inquiry"
            className="w-full sm:w-auto bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-base px-10 py-5 rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93] hover:shadow-[2px_2px_0px_0px_#FF2E93] hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            <span>INITIATE TEAM REGISTRATION</span>
            <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>

          <a
            href="#rulebook"
            className="w-full sm:w-auto px-8 py-5 rounded-2xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-colors text-base"
          >
            Review Hardware Rules
          </a>
        </div>

        {/* Server Authoritative Capacity Footnote */}
        <div className="mt-10 font-mono text-xs text-white/50 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
          <span>PAYMENT METHOD: INSTANT UPI SCAN · VERIFIED RECEIPT AUDIT · ZERO ON-SPOT REGISTRATION</span>
        </div>

      </div>
    </section>
  );
}
