// src/components/about/AboutHonours.jsx
// S8: Fellowships (Samsung India), Startups (InterviewBot) & NPTEL Elite
// High-voltage Obsidian Pitch-Black (#0D0D11) chassis with high-contrast colored cards

import React from 'react';
import { Award, Star, Rocket, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { honoursData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutHonours() {
  const { samsungFellows, startupInterviewBot, hackathonRoleup, nptelAchievers } = honoursData;

  return (
    <section
      id="honours"
      className="relative w-full py-20 bg-[#0D0D11] text-white border-b-3 border-[#111116] overflow-hidden"
    >
      {/* Background Micro Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(#FFE500 0.75px, transparent 0.75px), radial-gradient(#FFE500 0.75px, #0D0D11 0.75px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161622] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border border-[#FFE500]/40">
            <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
            <span>CHAPTER 07 // FELLOWSHIPS &amp; STARTUPS</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
            SAMSUNG FELLOWS, <span className="text-[#00E5FF]">STARTUPS</span> &amp; <span className="text-[#FFE500]">NPTEL ELITE</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/70 max-w-2xl mt-2 font-medium">
            Recognizing excellence beyond standard coursework: competitive industrial fellowships, venture-backed student startups, and national academic certifications.
          </p>
        </div>

        {/* 2x2 High-Voltage Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Samsung India Fellowship Programme */}
          <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#161624] p-7 sm:p-8 border-3 border-[#0055FF] shadow-[8px_8px_0px_#0055FF] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#0055FF] text-white font-mono text-xs font-black uppercase tracking-wider">
                    NATIONAL FELLOWSHIP
                  </span>
                  <span className="font-mono text-xs text-[#FFE500] font-bold">
                    7 VLSI UNDERGRADUATES
                  </span>
                </div>

                <h3 className="font-sans font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mb-3">
                  {samsungFellows.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium mb-6">
                  {samsungFellows.desc}
                </p>

                {/* Photo Thumbnail - Unclipped View */}
                <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0D0D11] p-2 flex items-center justify-center min-h-[200px] max-h-[260px]">
                  <img
                    src={samsungFellows.image}
                    alt={samsungFellows.title}
                    width="800"
                    height="1140"
                    className="w-full h-auto max-h-[240px] object-contain rounded-xl"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0D0D11]/90 text-white font-mono text-[10px] font-bold border border-white/20">
                    Samsung India Research Cohort
                  </div>
                </div>

                {/* 7 Fellows Roster */}
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold text-[#00E5FF] uppercase block">
                    Selected Samsung Fellows:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {samsungFellows.fellows.map((fellow, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#0D0D11] border border-white/15 font-mono text-xs text-white/90 font-bold flex items-center gap-1.5"
                      >
                        <Star className="w-3 h-3 text-[#FFE500] shrink-0" />
                        <span>{fellow}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Tilt3DCard>

          {/* Card 2: Student Startup Founder Spotlight: InterviewBot */}
          <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#161624] p-7 sm:p-8 border-3 border-[#FFE500] shadow-[8px_8px_0px_#FFE500] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase tracking-wider">
                    STUDENT STARTUP SPOTLIGHT
                  </span>
                  <span className="font-mono text-xs text-[#00E5FF] font-bold">
                    FOUNDER @ SIET
                  </span>
                </div>

                <h3 className="font-sans font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mb-1">
                  {startupInterviewBot.founder}
                </h3>
                <div className="font-mono text-xs text-[#FFE500] font-bold mb-4">
                  {startupInterviewBot.batch} • {startupInterviewBot.role}
                </div>

                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium mb-6">
                  {startupInterviewBot.impact}
                </p>

                {/* Photo Thumbnail - Unclipped View */}
                <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0D0D11] p-2 flex items-center justify-center min-h-[200px] max-h-[260px]">
                  <img
                    src={startupInterviewBot.image}
                    alt={startupInterviewBot.founder}
                    width="800"
                    height="1200"
                    className="w-full h-auto max-h-[240px] object-contain rounded-xl"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0D0D11]/90 text-[#FFE500] font-mono text-[10px] font-bold border border-white/20">
                    InterviewBot Automated Screener
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0D11] border border-white/20">
                  <div className="font-mono text-xs font-bold text-[#FFE500] uppercase mb-1">
                    Platform Product:
                  </div>
                  <div className="font-sans text-sm text-white font-semibold">
                    {startupInterviewBot.platform}
                  </div>
                </div>
              </div>
            </div>
          </Tilt3DCard>

          {/* Card 3: AI-ML Hackathon Laureates (Roleup) */}
          <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#161624] p-7 sm:p-8 border-3 border-[#FF2E93] shadow-[8px_8px_0px_#FF2E93] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#FF2E93] text-white font-mono text-xs font-black uppercase tracking-wider">
                    SPECIAL MENTION AWARD
                  </span>
                  <span className="font-mono text-xs text-white/70 font-bold">
                    22 - 23 JULY 2026
                  </span>
                </div>

                <h3 className="font-sans font-black text-2xl text-white uppercase tracking-tight mb-2">
                  {hackathonRoleup.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium mb-5">
                  {hackathonRoleup.summary}
                </p>

                {/* Photo Thumbnail - Unclipped Full Report View */}
                <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0D0D11] p-2 flex items-center justify-center min-h-[220px] max-h-[280px]">
                  <img
                    src={hackathonRoleup.image}
                    alt={hackathonRoleup.project}
                    width="800"
                    height="1200"
                    className="w-full h-auto max-h-[260px] object-contain rounded-xl"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0D0D11]/90 text-white font-mono text-[10px] font-bold border border-white/20">
                    Team Roleup: Dharun Prasanna R, Jeevanandham B, Sundaresh M
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D0D11] border border-white/15">
                  <span className="font-mono text-xs font-bold text-[#FF2E93] uppercase block mb-1">
                    Team Laureates:
                  </span>
                  <div className="flex flex-wrap gap-2 font-mono text-xs text-white/90">
                    {hackathonRoleup.laureates.map((name, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#161622] border border-white/20">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Tilt3DCard>

          {/* Card 4: NPTEL Elite Achievers (VLSI Interconnects) */}
          <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#161624] p-7 sm:p-8 border-3 border-[#B6FF00] shadow-[8px_8px_0px_#B6FF00] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#B6FF00] text-[#111116] font-mono text-xs font-black uppercase tracking-wider">
                    NATIONAL CERTIFICATION
                  </span>
                  <span className="font-mono text-xs text-[#B6FF00] font-bold">
                    21 SCHOLARS CERTIFIED
                  </span>
                </div>

                <h3 className="font-sans font-black text-2xl text-white uppercase tracking-tight mb-2">
                  {nptelAchievers.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium mb-5">
                  Comprehensive national examination in VLSI Interconnects and physical parasitic delays administered by IIT Roorkee and NPTEL.
                </p>

                {/* Photo Thumbnail - Unclipped NPTEL Certificate Showcase */}
                {nptelAchievers.image && (
                  <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0D0D11] p-2 flex items-center justify-center min-h-[180px] max-h-[240px]">
                    <img
                      src={nptelAchievers.image}
                      alt={nptelAchievers.title}
                      width="800"
                      height="1154"
                      className="w-full h-auto max-h-[220px] object-contain rounded-xl"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0D0D11]/90 text-[#B6FF00] font-mono text-[10px] font-bold border border-white/20">
                      NPTEL SWAYAM • VLSI Interconnects Roll of Honour
                    </div>
                  </div>
                )}

                {/* 3 Elite Achievers Spotlight */}
                <div className="space-y-2 mb-5">
                  <span className="font-mono text-xs font-bold text-[#FFE500] uppercase block">
                    Top National Elite Laureates:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {nptelAchievers.eliteAchievers.map((elite, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0D0D11] border-2 border-[#FFE500]/50 text-center"
                      >
                        <div className="font-mono text-[10px] font-black text-[#FFE500] uppercase">
                          {elite.grade}
                        </div>
                        <div className="font-sans font-bold text-xs text-white mt-1">
                          {elite.name}
                        </div>
                        <div className="font-mono text-[10px] text-white/60">
                          {elite.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Certified Scholars */}
                <div className="p-3.5 rounded-xl bg-[#0D0D11] border border-white/15">
                  <span className="font-mono text-[11px] font-bold text-white/70 uppercase block mb-1.5">
                    18 Additional Certified Department Undergraduates:
                  </span>
                  <p className="font-mono text-[11px] text-white/80 leading-relaxed">
                    Thirumurugan S, Ajaikumar G, Srivatsan P, Kavya M, Sakthishree D, Sri Ram M.R, Suman S, Monika M, Elamsaravanan G, Janarthanan V, Sasmitha S.P, Mithun R.N, Harish K, Indhuja J, Akshaya R, Gowtham P, Sheik Kather Asif P.
                  </p>
                </div>
              </div>
            </div>
          </Tilt3DCard>
        </div>
      </div>
    </section>
  );
}

