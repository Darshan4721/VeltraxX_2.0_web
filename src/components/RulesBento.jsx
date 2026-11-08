import React from 'react';
import { 
  Laptop, 
  Users, 
  Bot, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Terminal, 
  PhoneCall, 
  Flame, 
  Coffee, 
  ShieldCheck 
} from 'lucide-react';

export default function RulesBento() {
  return (
    <section id="rules" className="py-24 bg-[#FBFBFB] relative border-b-2 border-[#111116]/10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Swiss Monospace Eyebrow */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm border border-[#FFE500]/30">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse-live" />
            <span>CHAPTER 03 // ARENA GOVERNANCE & PROTOCOLS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
            Strict Engineering Standards. <br />
            <span className="text-[#FF2E93]">Zero Ambiguity</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed font-normal">
            VELTRAXX 2.0 enforces professional engineering protocols and radical fairness. 
            All teams must comply with 6-slide template limits, academic tier guidelines, and the 50/50 live twist defense.
          </p>
        </div>

        {/* Asymmetric Vivid Bento Grid with 3D Pop Toward Viewer (All 4 Corners) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rules-grid">
          
          {/* =========================================================================
              CARD 1 (7 Cols): Solar Yellow Plane - Pops Forward Toward Viewer
              Yellow background + Black text + Black box icon
             ========================================================================= */}
          <div 
            tabIndex={0}
            className="md:col-span-7 bg-[#FFE500] text-[#111116] rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-yellow cursor-pointer select-none focus:outline-none"
          >
            {/* Inner background decoration clipping container */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-white/30" />
            </div>
            
            <div>
              {/* Chip / Badge Layer (pops furthest at 40px) */}
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#111116] text-[#FFE500] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116] border border-[#111116]">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#111116] text-white px-3 py-1 rounded-lg">
                  ROUND 1 PROTOCOL (100% FREE)
                </span>
              </div>

              {/* Title Layer (pops at 24px) */}
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-[#111116] pop-title">
                Round 1 Pitch Rules & 6-Slide Template
              </h3>
              
              {/* Body Layer (pops at 10px) */}
              <p className="text-sm sm:text-base font-medium text-[#111116]/85 leading-relaxed mb-6 pop-body">
                Registration is completely free for all teams (2 to 4 members; cross-department allowed). Teams must download the official Veltraxx 2.0 PPT template and present their architecture with clear block diagrams.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 pop-body">
                <div className="bg-white p-3.5 rounded-xl border border-[#111116]/15 template-pop-card shadow-xs">
                  <div className="font-black text-xs uppercase text-[#111116]">Template Limit</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">Strict Max 6 to 8 Slides (PDF)</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#111116]/15 template-pop-card shadow-xs">
                  <div className="font-black text-xs uppercase text-[#111116]">Submission Window</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">02 Dec (00:00) to 03 Dec (23:59)</div>
                </div>
              </div>
            </div>

            {/* Footer Layer (pops at 16px) */}
            <div className="pt-4 border-t-2 border-[#111116]/15 flex items-center justify-between font-mono text-xs font-bold text-[#111116] pop-footer">
              <span>FORMAT: 6-SLIDE PDF / PPTX</span>
              <span className="text-[#FF2E93] bg-[#111116] px-2.5 py-0.5 rounded text-[11px] text-white font-black">
                ZERO ENTRY FEE
              </span>
            </div>

          </div>

          {/* =========================================================================
              CARD 2 (5 Cols): Hot Magenta Plane - Pops Forward Toward Viewer
              Magenta background + Black text + Black tag with Yellow text
             ========================================================================= */}
          <div 
            tabIndex={0}
            className="md:col-span-5 bg-[#FF2E93] text-[#111116] rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-magenta cursor-pointer select-none focus:outline-none"
          >
            {/* Inner background decoration clipping container */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute bottom-0 right-0 translate-x-6 translate-y-6 w-40 h-40 rounded-full bg-black/10" />
            </div>

            <div>
              {/* Chip / Badge Layer (pops at 40px) */}
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#111116] text-[#FFE500] flex items-center justify-center shadow-[3px_3px_0px_0px_#FFE500]">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#111116] text-[#FFE500] px-3 py-1 rounded-lg">
                  TOP ~30 TEAMS
                </span>
              </div>

              {/* Title Layer (pops at 24px) */}
              <h3 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight mb-3 pop-title">
                Shortlisting & Direct Phone Verification
              </h3>

              {/* Body Layer (pops at 10px) */}
              <p className="text-sm font-medium text-[#111116]/90 leading-relaxed mb-6 pop-body">
                Our jury panel scores submissions based on technical feasibility, architectural depth, and academic tier. Shortlisted team leaders will be contacted directly via phone between Dec 05 and Dec 07.
              </p>

              <div className="p-3.5 rounded-xl bg-black/10 border border-black/15 font-mono text-xs text-[#111116] space-y-1 pop-body">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#111116]" />
                  <span>Direct Leader Voice Call (05-07 Dec)</span>
                </div>
                <div className="text-[11px] text-[#111116]/80 pl-3.5">
                  Finalists receive a 6-character secret passcode to confirm Round 2 seats.
                </div>
              </div>
            </div>

            {/* Footer Layer (pops at 16px) */}
            <div className="pt-6 border-t-2 border-[#111116]/15 flex items-center justify-between font-mono text-xs font-bold text-[#111116] pop-footer">
              <span>PHONE NOTIFICATION: 05-07 DEC</span>
              <span className="bg-[#111116] text-[#FFE500] px-2 py-0.5 rounded text-[11px]">
                30 DESKS
              </span>
            </div>

          </div>

          {/* =========================================================================
              CARD 3 (5 Cols): Cobalt Dark Blue Plane - Pops Forward Toward Viewer
              Dark Blue background + White text + Yellow logo/icon
             ========================================================================= */}
          <div 
            tabIndex={0}
            className="md:col-span-5 bg-[#0055FF] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-blue cursor-pointer select-none focus:outline-none"
          >
            <div>
              {/* Chip / Badge Layer (pops at 40px) */}
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116]">
                  <Flame className="w-6 h-6 text-[#111116] fill-current" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-lg">
                  THE 50/50 RULE
                </span>
              </div>

              {/* Title Layer (pops at 24px) */}
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white pop-title">
                The 24H "Live Twist" Evaluation
              </h3>
              
              {/* Body Layer (pops at 10px) */}
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6 font-normal pop-body">
                In Round 2 (Dec 15-16 @ SIET), you build the exact project pitched in your Round 1 PPT. At kick-off on Dec 15 morning, judges inject surprise live modifications and stress constraints.
              </p>

              {/* Anti-Cheat: Zero Pre-Built Rigs & Break-Fix Defense */}
              <div className="p-3.5 rounded-xl bg-black/35 border border-white/20 font-mono text-xs space-y-2 mb-4 pop-body">
                <div className="flex items-start gap-2">
                  <span className="text-[#FFE500] font-bold text-sm shrink-0">⚡</span>
                  <div className="leading-snug">
                    <span className="text-[#FFE500] font-black uppercase tracking-wider">Zero Pre-Built Rigs: </span>
                    <span className="text-white/95 font-sans font-normal">
                      Hardware components must be assembled on-site; all teams undergo a live "Break-Fix & Code Modification" oral defense during Jury Audits to prevent pre-built or remote-coded projects.
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 text-[#00E5FF] text-[11px] font-bold">
                  ⚠️ 50% Core Blueprint Execution + 50% Live Twist Adaptation.
                </div>
              </div>
            </div>

            {/* Footer Layer (pops at 16px) */}
            <div className="pt-6 border-t-2 border-white/20 font-mono text-xs font-bold text-white/80 flex items-center justify-between pop-footer">
              <span>LIVE DEFENSE ON DAY 1</span>
              <span className="text-[#FFE500]">ANTI-SLOP VERIFIED</span>
            </div>

          </div>

          {/* =========================================================================
              CARD 4 (7 Cols): Pitch Black Arena Chassis - Pops Forward Toward Viewer
              Black background + White text + Neon Lime Green accents & shadow
             ========================================================================= */}
          <div 
            tabIndex={0}
            className="md:col-span-7 bg-[#0D0D11] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#B6FF00] flex flex-col justify-between relative pop-card pop-card-black cursor-pointer select-none focus:outline-none"
          >
            <div>
              {/* Chip / Badge Layer (pops at 40px) */}
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF00] text-[#111116] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116]">
                  <Coffee className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#B6FF00] text-[#111116] px-3 py-1 rounded-lg">
                  FULL HOSPITALITY
                </span>
              </div>

              {/* Title Layer (pops at 24px) */}
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white pop-title">
                Campus Logistics, Power & Stay
              </h3>
              
              {/* Body Layer (pops at 10px) */}
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 font-normal pop-body">
                Bring your own laptops, chargers, microcontrollers/FPGAs, and valid College ID cards. SIET provides high-speed lab Wi-Fi, uninterrupted power desks, and full round-the-clock hospitality.
              </p>

              {/* Anti-Cheat: Academic Tiering & Locked Roster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/[0.05] border-2 border-white/10 pop-body">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFE500] text-[#111116] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    ⚖️
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-black text-[#FFE500] uppercase tracking-wide block mb-0.5">
                      Highest-Seniority Tiering:
                    </span>
                    <span className="text-white/80 font-normal leading-relaxed">
                      Teams with mixed academic years are evaluated in the tier of their most senior member.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FF2E93] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    🔒
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-black text-[#FF2E93] uppercase tracking-wide block mb-0.5">
                      Locked Roster:
                    </span>
                    <span className="text-white/80 font-normal leading-relaxed">
                      No member substitutions are permitted between Round 1 and Round 2.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Multi-Color Checkpoint / Hospitality Slots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 pop-footer">
                <div className="bg-[#FFE500]/10 border-2 border-[#FFE500]/50 hover:border-[#FFE500] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#FFE500]">
                  <div className="font-mono text-xs text-[#FFE500] font-black tracking-wider">CHECK-IN</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">08:30 AM (D1)</div>
                </div>
                <div className="bg-[#00E5FF]/10 border-2 border-[#00E5FF]/50 hover:border-[#00E5FF] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#00E5FF]">
                  <div className="font-mono text-xs text-[#00E5FF] font-black tracking-wider">AUDIT 01</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">04:30 PM (D1)</div>
                </div>
                <div className="bg-[#FF2E93]/10 border-2 border-[#FF2E93]/50 hover:border-[#FF2E93] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#FF2E93]">
                  <div className="font-mono text-xs text-[#FF2E93] font-black tracking-wider">DINNER</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">08:30 PM (D1)</div>
                </div>
                <div className="bg-[#B6FF00]/10 border-2 border-[#B6FF00]/50 hover:border-[#B6FF00] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#B6FF00]">
                  <div className="font-mono text-xs text-[#B6FF00] font-black tracking-wider">MIDNIGHT</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">01:00 AM (D2)</div>
                </div>
              </div>
            </div>

            {/* Footer Layer (pops at 16px) */}
            <div className="pt-4 border-t-2 border-white/10 font-mono text-xs font-semibold text-white/60 flex items-center justify-between pop-footer">
              <span>VENUE: SIET TECH PARK, COIMBATORE</span>
              <span className="text-[#B6FF00] font-bold">MEALS & SLEEPING ZONES PROVIDED</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
