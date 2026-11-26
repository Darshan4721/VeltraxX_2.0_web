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
            VELTRAXX 2.0 enforces transparent team eligibility, verified seat limits, and fair onsite engineering standards for all 60 participating teams.
          </p>
        </div>

        {/* Asymmetric Vivid Bento Grid with 3D Pop Toward Viewer (All 4 Corners) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rules-grid">
          
          {/* CARD 1 (7 Cols): Eligibility & Team Rules */}
          <div 
            tabIndex={0}
            className="md:col-span-7 bg-[#FFE500] text-[#111116] rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-yellow cursor-pointer select-none focus:outline-none"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-white/30" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#111116] text-[#FFE500] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116] border border-[#111116]">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#111116] text-white px-3 py-1 rounded-lg">
                  TEAM &amp; ELIGIBILITY
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-[#111116] pop-title">
                Strictly 3 Members · Open to All Disciplines
              </h3>
              
              <p className="text-sm sm:text-base font-medium text-[#111116]/85 leading-relaxed mb-6 pop-body">
                Teams must consist of strictly 3 members (1 Team Leader + 2 Team Members). Open to all academic disciplines across UG, PG, and research scholars, subject to institutional eligibility and minor-safety requirements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 pop-body">
                <div className="bg-white p-3.5 rounded-xl border border-[#111116]/15 template-pop-card shadow-xs">
                  <div className="font-black text-xs uppercase text-[#111116]">Team Cap</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">Max 60 Teams (180 Participants)</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#111116]/15 template-pop-card shadow-xs">
                  <div className="font-black text-xs uppercase text-[#111116]">Registration Deadline</div>
                  <div className="font-mono text-xs text-[#111116]/80 mt-1">12 Dec 2026 (11:59 PM IST)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111116]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs font-bold text-[#111116] pop-footer">
              <span>SINGLE-ROUND DIRECT ENTRY</span>
              <span className="bg-[#111116] px-2.5 py-0.5 rounded text-[11px] text-[#FFE500] font-black">
                NO PPT SCREENING
              </span>
            </div>

          </div>

          {/* CARD 2 (5 Cols): Fee & Manual Payment Verification */}
          <div 
            tabIndex={0}
            className="md:col-span-5 bg-[#FF2E93] text-[#111116] rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-magenta cursor-pointer select-none focus:outline-none"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute bottom-0 right-0 translate-x-6 translate-y-6 w-40 h-40 rounded-full bg-black/10" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#111116] text-[#FFE500] flex items-center justify-center shadow-[3px_3px_0px_0px_#FFE500]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#111116] text-[#FFE500] px-3 py-1 rounded-lg">
                  ₹500 / MEMBER
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight mb-3 pop-title">
                Unified ₹1,500 Payment &amp; Bank Verification
              </h3>

              <p className="text-sm font-medium text-[#111116]/90 leading-relaxed mb-6 pop-body">
                Registration and payment happen in one unified step: review rules in the QR payment popup, transfer ₹1,500 (₹500 × 3), and submit your 12-digit UTR &amp; screenshot. No unpaid teams are created.
              </p>

              <div className="p-3.5 rounded-xl bg-black/10 border border-black/15 font-mono text-xs text-[#111116] space-y-1 pop-body">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#111116]" />
                  <span>Verified Against Institutional Bank Credit</span>
                </div>
                <div className="text-[11px] text-[#111116]/80 pl-3.5">
                  Confirmation email dispatched manually from vlsireseachlab@siet.ac.in.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-[#111116]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs font-bold text-[#111116] pop-footer">
              <span>5-MIN CHECKOUT LOCK</span>
              <span className="bg-[#111116] text-[#FFE500] px-2 py-0.5 rounded text-[11px]">
                VERIFIED RECEIPT
              </span>
            </div>

          </div>

          {/* CARD 3 (5 Cols): Live Build Integrity */}
          <div 
            tabIndex={0}
            className="md:col-span-5 bg-[#0055FF] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex flex-col justify-between relative pop-card pop-card-blue cursor-pointer select-none focus:outline-none"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116]">
                  <Flame className="w-6 h-6 text-[#111116] fill-current" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-lg">
                  24H ONSITE BUILD
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white pop-title">
                Live Engineering &amp; Original Work
              </h3>
              
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6 font-normal pop-body">
                Teams design, code, wire, and benchmark their solution onsite at SIET Coimbatore during December 15-16, 2026 under continuous mentor and jury observation.
              </p>

              <div className="p-3.5 rounded-xl bg-black/35 border border-white/20 font-mono text-xs space-y-2 mb-4 pop-body">
                <div className="flex items-start gap-2">
                  <span className="text-[#FFE500] font-bold text-sm shrink-0">⚡</span>
                  <div className="leading-snug">
                    <span className="text-[#FFE500] font-black uppercase tracking-wider">Zero Pre-Built Projects: </span>
                    <span className="text-white/95 font-sans font-normal">
                      All code commits, circuit assemblies, and working demos are verified onsite by faculty and industry evaluators.
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 text-[#00E5FF] text-[11px] font-bold">
                  ℹ️ Reporting schedule &amp; judging guidelines shared with confirmed teams.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-white/20 font-mono text-xs font-bold text-white/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pop-footer">
              <span>15 - 16 DEC 2026</span>
              <span className="text-[#FFE500]">LIVE VERIFICATION</span>
            </div>

          </div>

          {/* CARD 4 (7 Cols): Food, Refreshments & Campus Policy */}
          <div 
            tabIndex={0}
            className="md:col-span-7 bg-[#0D0D11] text-white rounded-3xl p-8 sm:p-10 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#B6FF00] flex flex-col justify-between relative pop-card pop-card-black cursor-pointer select-none focus:outline-none"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pop-chip">
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF00] text-[#111116] flex items-center justify-center shadow-[2px_2px_0px_0px_#111116]">
                  <Coffee className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#B6FF00] text-[#111116] px-3 py-1 rounded-lg">
                  MEALS INCLUDED
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white pop-title">
                Hospitality, Hardware Kits &amp; Campus Rules
              </h3>
              
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 font-normal pop-body">
                Bring your own laptops, chargers, hardware kits/FPGAs, and valid College ID cards. SIET provides high-speed Wi-Fi, lab power desks, 3 meals, and 2 refreshments throughout the 24-hour sprint.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/[0.05] border-2 border-white/10 pop-body">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FFE500] text-[#111116] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    🍽️
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-black text-[#FFE500] uppercase tracking-wide block mb-0.5">
                      Food &amp; Refreshments:
                    </span>
                    <span className="text-white/80 font-normal leading-relaxed">
                      Food (3 meals) and 2 refreshment breaks are included across the 24-hour hackathon.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FF2E93] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    🔒
                  </div>
                  <div className="text-xs">
                    <span className="font-mono font-black text-[#FF2E93] uppercase tracking-wide block mb-0.5">
                      Locked 3-Member Roster:
                    </span>
                    <span className="text-white/80 font-normal leading-relaxed">
                      No member substitutions are allowed after team registration and payment submission.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Hospitality & Logistics Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 pop-footer">
                <div className="bg-[#FFE500]/10 border-2 border-[#FFE500]/50 hover:border-[#FFE500] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#FFE500]">
                  <div className="font-mono text-xs text-[#FFE500] font-black tracking-wider">DURATION</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">24 Hours Non-Stop</div>
                </div>
                <div className="bg-[#00E5FF]/10 border-2 border-[#00E5FF]/50 hover:border-[#00E5FF] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#00E5FF]">
                  <div className="font-mono text-xs text-[#00E5FF] font-black tracking-wider">FOOD</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">3 Meals Included</div>
                </div>
                <div className="bg-[#FF2E93]/10 border-2 border-[#FF2E93]/50 hover:border-[#FF2E93] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#FF2E93]">
                  <div className="font-mono text-xs text-[#FF2E93] font-black tracking-wider">BREAKS</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">2 Refreshments</div>
                </div>
                <div className="bg-[#B6FF00]/10 border-2 border-[#B6FF00]/50 hover:border-[#B6FF00] p-3 rounded-xl text-center transition-all duration-200 shadow-[2px_2px_0px_0px_#B6FF00]">
                  <div className="font-mono text-xs text-[#B6FF00] font-black tracking-wider">CAP LIMIT</div>
                  <div className="font-mono text-[11px] text-white/90 mt-1 font-bold">60 Teams Max</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-white/10 font-mono text-xs font-semibold text-white/60 flex items-center justify-between pop-footer">
              <span>VENUE: SIET CAMPUS, COIMBATORE</span>
              <span className="text-[#B6FF00] font-bold">3 MEALS &amp; 2 REFRESHMENTS PROVIDED</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
