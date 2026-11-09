import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { Award, Trophy, Briefcase, FileCheck, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrizeSection() {
  const { prizes } = eventConfig;

  // Interactive 3D Trophy Mouse Tilt
  const [trophyHover, setTrophyHover] = useState({
    active: false,
    x: 0,
    y: 0
  });

  const handleTrophyMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const normX = (cursorX / rect.width) * 2 - 1; // -1 to 1
    const normY = (cursorY / rect.height) * 2 - 1;

    setTrophyHover({
      active: true,
      x: normX,
      y: normY
    });
  };

  const handleTrophyLeave = () => {
    setTrophyHover({ active: false, x: 0, y: 0 });
  };

  return (
    <section id="prizes" className="py-24 bg-white relative border-b-3 border-[#111116] overflow-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-15 bg-dot-grid pointer-events-none" />

      {/* Radiant Color Blur Halos */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FFE500]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF2E93]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4 shadow-sm border border-[#FFE500]/40">
            <span className="w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse-live" />
            <span>CHAPTER 05 // REWARDS & RECOGNITION</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
            Not Just A Trophy. <br />
            <span className="text-[#FF2E93] underline decoration-[#FFE500] decoration-wavy decoration-2">A Direct Career Gate</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed font-normal">
            Standout engineering deserves real impact. Top teams secure winner honours, industry jury mentorship, and verified institutional certificates.
          </p>
        </div>

        {/* 3D Spotlight Championship Stage with Dynamic Mouse Perspective */}
        <div 
          onMouseMove={handleTrophyMove}
          onMouseLeave={handleTrophyLeave}
          className="max-w-5xl mx-auto bg-[#FBFBFB] rounded-3xl p-6 sm:p-10 lg:p-12 border-3 border-[#111116] shadow-[8px_8px_0px_0px_#FFE500] relative overflow-hidden mb-12 cursor-pointer group"
        >
          {/* Internal Breathing Ambient Glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#FFE500]/25 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            
            {/* Left 3D Visual Stage with Geometric Color Planes (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[360px] flex items-center justify-center select-none">
                
                {/* Layer 1: Giant Solar Wafer Yellow Circle with Dynamic Counter-Tilt */}
                <div 
                  style={{
                    transform: trophyHover.active
                      ? `translate(${-trophyHover.x * 15}px, ${-trophyHover.y * 15}px) rotate(${trophyHover.x * -6}deg)`
                      : 'none',
                    transition: 'transform 0.3s ease-out'
                  }}
                  className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-[6px_6px_0px_0px_#111116]"
                >
                  <div className="absolute inset-0 rounded-full opacity-20 bg-dot-grid" />
                </div>

                {/* Layer 2: Tilted Hot Magenta Slab */}
                <div 
                  style={{
                    transform: trophyHover.active
                      ? `translate(${trophyHover.x * 18}px, ${trophyHover.y * 18}px) rotate(16deg)`
                      : 'rotate(12deg) translate(16px, -12px)',
                    transition: 'transform 0.35s ease-out'
                  }}
                  className="absolute w-[190px] h-[240px] sm:w-[220px] sm:h-[270px] bg-[#FF2E93] rounded-2xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116]"
                />

                {/* Layer 3: Deep Obsidian Shard */}
                <div 
                  style={{
                    transform: trophyHover.active
                      ? `translate(${trophyHover.x * -10}px, ${trophyHover.y * 12}px) rotate(-8deg)`
                      : 'rotate(-6deg) translate(-24px, 32px)',
                    transition: 'transform 0.4s ease-out'
                  }}
                  className="absolute w-[150px] h-[150px] bg-[#0D0D11] rounded-2xl border-2 border-[#111116] opacity-90 shadow-[4px_4px_0px_0px_#111116]"
                />

                {/* Layer 4: 3D Championship Golden Wafer Trophy Cutout with 3D Perspective Scale */}
                <div 
                  style={{
                    transform: trophyHover.active
                      ? `perspective(800px) rotateX(${-trophyHover.y * 16}deg) rotateY(${trophyHover.x * 16}deg) scale(1.08)`
                      : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
                    transition: 'transform 0.25s ease-out'
                  }}
                  className="relative z-20 w-[95%] h-[95%] flex items-center justify-center filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)]"
                >
                  <img 
                    src="/images/trophy-transparent.webp" 
                    alt="VELTRAXX 2.0 3D Golden Silicon Championship Award" 
                    width="600"
                    height="600"
                    className="w-full h-full object-contain filter contrast-115 saturate-115"
                    loading="lazy"
                  />
                </div>

                {/* Tilted Neon Badges Overlapping Trophy */}
                <div className="absolute -top-3 right-0 z-30 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] transform rotate-6 group-hover:scale-105 transition-transform">
                  CHAMPIONS
                </div>

                <div className="absolute -bottom-3 -left-2 z-30 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] transform -rotate-4 group-hover:scale-105 transition-transform">
                  ALL TRACKS
                </div>
              </div>
            </div>

            {/* Right Prize Breakdown (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="font-mono text-[11px] font-black bg-[#FFE500] text-[#111116] px-3 py-1 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] uppercase">
                    EXCITING CASH PRIZE POOL
                  </span>
                  <span className="font-mono text-[11px] font-black bg-[#00E5FF] text-[#111116] px-3 py-1 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] uppercase">
                    WINNER TROPHIES & MERIT HONOURS
                  </span>
                  <span className="font-mono text-[11px] font-black bg-[#B6FF00] text-[#111116] px-3 py-1 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] uppercase">
                    INDUSTRY INTERNSHIP SPOTLIGHT
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight mb-4">
                  Grand Champion Trophies, Industry Mentorship & Internships
                </h3>

                <p className="text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
                  The winning teams do not just receive certificates. Veltraxx 2.0 connects standout participants directly with industry leaders, visiting corporate evaluators, and academic research labs.
                </p>

                {/* 3 Interactive Highlight Pillars */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-1 transition-transform">
                    <Trophy className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs uppercase text-[#111116]">Champion & Track Awards</div>
                      <div className="text-xs text-[#111116]/75 mt-0.5">Custom physical trophies, merit citations, and exclusive recognition across all 5 tracks.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-1 transition-transform">
                    <Briefcase className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs uppercase text-[#111116]">Industry Mentorship & Internships</div>
                      <div className="text-xs text-[#111116]/75 mt-0.5">High-performing finalists get fast-tracked for technical interviews and direct internship referrals.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-1 transition-transform">
                    <FileCheck className="w-5 h-5 text-[#B6FF00] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs uppercase text-[#111116]">Verified Merit Certificates</div>
                      <div className="text-xs text-[#111116]/75 mt-0.5">Digital Certificate of Ideation for Round 1 submissions; Hardcopy certificates for Round 2.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#111116]/10 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#111116]/70">
                    ROUND 1 IS 100% FREE
                  </span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-[#111116] hover:text-[#0055FF] underline"
                  >
                    <span>Pitch Your Solution →</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Detailed Benefit Grid Cards with Tactile Hover Physics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <div className="bg-white rounded-2xl p-6 border-3 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#FFE500] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116]">
                🏆
              </div>
              <span className="font-mono text-[10px] font-black uppercase bg-[#111116] text-[#FFE500] px-2 py-0.5 rounded border border-[#111116]">
                CASH POOL
              </span>
            </div>
            <h4 className="text-lg font-black text-[#111116] mb-2">
              {prizes?.highlight1?.title || "Exciting Cash Prize Pool & Track Winners"}
            </h4>
            <p className="text-xs sm:text-sm text-[#111116]/75 leading-relaxed font-normal">
              {prizes?.highlight1?.desc || "Top-performing teams across tracks win official Veltraxx 2.0 Championship Trophies, Merit Honors, and Exciting Cash Prize Rewards."}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-3 border-[#111116] shadow-[4px_4px_0px_0px_#00E5FF] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#00E5FF] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116]">
                💼
              </div>
              <span className="font-mono text-[10px] font-black uppercase bg-[#111116] text-[#00E5FF] px-2 py-0.5 rounded border border-[#111116]">
                INTERNSHIPS
              </span>
            </div>
            <h4 className="text-lg font-black text-[#111116] mb-2">
              {prizes?.highlight2?.title || "Industry Mentorship & Spotlight"}
            </h4>
            <p className="text-xs sm:text-sm text-[#111116]/75 leading-relaxed font-normal">
              {prizes?.highlight2?.desc || "Pitch directly to visiting semiconductor engineers and academic experts. Standout talent is fast-tracked for technical internships."}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-3 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#B6FF00] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B6FF00] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116]">
                📜
              </div>
              <span className="font-mono text-[10px] font-black uppercase bg-[#111116] text-[#B6FF00] px-2 py-0.5 rounded border border-[#111116]">
                HONOURS
              </span>
            </div>
            <h4 className="text-lg font-black text-[#111116] mb-2">
              {prizes?.highlight3?.title || "Winner Trophies & Merit Honours"}
            </h4>
            <p className="text-xs sm:text-sm text-[#111116]/75 leading-relaxed font-normal">
              {prizes?.highlight3?.desc || "Every Round 1 team submitting a valid PPT receives a Digital Certificate of Ideation; all Round 2 finalists receive Hardcopy Merit Certificates."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
