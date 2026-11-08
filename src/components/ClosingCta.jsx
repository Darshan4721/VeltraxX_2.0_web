import React from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../config/eventConfig';
import { ArrowUpRight, ArrowRight, Download, Zap, Users, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function ClosingCta() {
  return (
    <section id="register" className="py-24 bg-[#0D0D11] text-white relative overflow-hidden border-b-2 border-[#111116]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-15 bg-tech-grid pointer-events-none" />

      {/* Radiant Color Blur Halos (Restored from HEAD) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FFE500]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF2E93]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1A1A24] border border-[#FFE500]/40 text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_#FFE500]">
          <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
          <span>ROUND 1 // 100% FREE REGISTRATION FOR ALL TEAMS</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          Ready to Pitch Your <br />
          <span className="text-[#FFE500]">Silicon Blueprint</span>?
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Round 1 registration is strictly <span className="text-white font-bold underline decoration-[#FFE500]">100% free for all college teams</span> (2 to 4 members). Pick your domain from 25 problem statements and lock in your team today.
        </p>

        {/* 4-Step Gauntlet Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-12 text-left">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="font-mono text-xs text-[#B6FF00] font-black">STEP 01</div>
            <div className="font-bold text-xs text-white mt-1">Free Registration</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">2-4 Members (₹0 Fee)</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="font-mono text-xs text-[#FFE500] font-black">STEP 02</div>
            <div className="font-bold text-xs text-white mt-1">Draft Blueprint</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">Official 6-Slide Template</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="font-mono text-xs text-[#00E5FF] font-black">STEP 03</div>
            <div className="font-bold text-xs text-white mt-1">48H Submission</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">Dec 02-03 Portal Upload</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="font-mono text-xs text-[#FF2E93] font-black">STEP 04</div>
            <div className="font-bold text-xs text-white mt-1">24H Offline Arena</div>
            <div className="text-[11px] font-mono text-white/50 mt-0.5">Dec 15-16 @ SIET</div>
          </div>
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-base px-10 py-5 rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93] hover:shadow-[2px_2px_0px_0px_#FF2E93] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center justify-center gap-3 group"
          >
            <span>REGISTER TEAM FOR FREE (₹0 ENTRY)</span>
            <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>

          <a
            href="#downloads"
            className="w-full sm:w-auto px-8 py-5 rounded-2xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-colors text-base flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Template & Rulebook</span>
          </a>
        </div>

        {/* Server Authoritative Footnote */}
        <div className="mt-10 font-mono text-xs text-white/50 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
          <span>ROUND 1 CLOSES 01 DEC 2026 (11:59 PM IST) · ZERO REGISTRATION FEE · SIET COIMBATORE</span>
        </div>

      </div>
    </section>
  );
}
