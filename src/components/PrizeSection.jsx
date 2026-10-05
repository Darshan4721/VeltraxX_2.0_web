import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { Award, CheckCircle2, Trophy, Star, Sparkles, Briefcase, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function PrizeSection() {
  const { prizes, registration } = eventConfig;

  return (
    <section id="prizes" className="py-24 bg-white relative border-b border-[#111116]/10 overflow-hidden">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-15 bg-dot-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse-live" />
            <span>CHAPTER 05 // CAREER LAUNCHPAD & REWARDS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
            Not Just A Trophy. <br />
            <span className="text-[#FF2E93]">A Direct VLSI Career Gate</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed">
            The winning team does not walk away with generic merch. All 4 members of the sole champion team 
            secure direct industry internship opportunities and free access to the Synopsys hands-on workshop.
          </p>
        </div>

        {/* 3D Spotlight Championship Stage */}
        <div className="max-w-5xl mx-auto bg-[#FBFBFB] rounded-3xl p-8 sm:p-12 lg:p-14 border-3 border-[#111116] shadow-[8px_8px_0px_0px_#FFE500] relative overflow-hidden mb-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 3D Visual Stage with Geometric Color Planes (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              <div className="relative w-full aspect-square max-w-[380px] flex items-center justify-center select-none">
                
                {/* Layer 1: Giant Solar Wafer Yellow Circle */}
                <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-xl" />

                {/* Layer 2: Tilted Hot Magenta Slab */}
                <div className="absolute w-[200px] h-[250px] sm:w-[230px] sm:h-[280px] bg-[#FF2E93] rounded-2xl transform rotate-12 translate-x-4 -translate-y-3 border-3 border-[#111116] shadow-lg" />

                {/* Layer 3: Deep Obsidian Shard */}
                <div className="absolute w-[160px] h-[160px] bg-[#0D0D11] rounded-2xl transform -rotate-6 -translate-x-6 translate-y-8 opacity-90 shadow-md" />

                {/* Layer 4: 3D Championship Golden Wafer Trophy Cutout */}
                <div className="relative z-20 w-[95%] h-[95%] flex items-center justify-center">
                  <img 
                    src="/images/trophy-transparent.png" 
                    alt="VELTRAXX 2.0 3D Golden Silicon Championship Award" 
                    className="w-full h-full object-contain filter contrast-115 saturate-115 drop-shadow-[0_25px_40px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Tilted Neon Badges Overlapping the Trophy Frame */}
                <div className="absolute -top-3 right-0 z-30 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border-2 border-[#111116] shadow-md transform rotate-6">
                  CHAMPIONS ONLY
                </div>

                <div className="absolute -bottom-3 -left-2 z-30 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border-2 border-[#111116] shadow-md transform -rotate-4">
                  ALL 4 MEMBERS
                </div>

              </div>

            </div>

            {/* Right Prize Breakdown (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs font-black text-[#FF2E93] uppercase tracking-wider bg-[#FF2E93]/10 px-3 py-1 rounded-md">
                    GRAND PRIZE PACKAGE
                  </span>
                  <span className="font-mono text-xs font-bold text-[#111116]/60">
                    SOLE WINNING TEAM
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-4">
                  {prizes.grandPrize.title}
                </h3>

                <p className="text-sm sm:text-base text-[#111116]/80 font-medium leading-relaxed mb-6">
                  {prizes.grandPrize.description}
                </p>

                {/* Detailed Benefit List */}
                <div className="space-y-3 mb-8">
                  {prizes.grandPrize.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border-2 border-[#111116]/10 shadow-xs">
                      <div className="w-5 h-5 rounded-md bg-[#FFE500] text-[#111116] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ✓
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#111116]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Runner-up & Participant Recognition */}
              <div className="p-4 rounded-xl bg-[#0D0D11] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#B6FF00]" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">{prizes.runnerUpPolicy}</div>
                    <div className="text-[11px] font-mono text-white/60">National C2S certificates for all verified attendees</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#FFE500] bg-white/10 px-2.5 py-1 rounded">
                  OFFICIAL
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
