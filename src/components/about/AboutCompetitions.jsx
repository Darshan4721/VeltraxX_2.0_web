// src/components/about/AboutCompetitions.jsx
// S6: Flagship Competitive Arenas (VELTRAXX '26 & The Lost Silicon)
// High-voltage Split Battleground: Dark Chassis (#0D0D11) & Solar Yellow Chassis (#FFE500)

import React from 'react';
import { ArrowRight, Trophy, Zap, Clock, MapPin, Users, Award } from 'lucide-react';
import { competitionsData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutCompetitions() {
  const { veltraxx, lostSilicon } = competitionsData;

  return (
    <section
      id="competitions"
      className="relative w-full py-20 bg-[#F4F4F6] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#FF2E93]">
            <span className="w-2 h-2 rounded-full bg-[#FF2E93]" />
            <span>CHAPTER 05 // COMPETITIVE ARENAS</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            FLAGSHIP ARENAS: <span className="text-[#FF2E93]">VELTRAXX</span> &amp; <span className="text-[#0055FF]">THE LOST SILICON</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 mt-2 font-medium">
            Where theoretical digital logic is tested against the clock, live hardware twist constraints, and physical silicon synthesis gauntlets.
          </p>
        </div>

        {/* Split Battleground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Stage: VELTRAXX '26 (1.0) - Flagship Past Edition (Dark Obsidian Chassis) */}
          <Tilt3DCard maxTilt={5} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#0D0D11] text-white p-7 sm:p-9 border-3 border-[#111116] shadow-[8px_8px_0px_#FF2E93] flex flex-col justify-between">
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="px-3 py-1 rounded-lg bg-[#FF2E93] text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116]">
                    FLAGSHIP PAST EDITION
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#FFE500]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>24 HOURS NON-STOP</span>
                  </div>
                </div>

                <h3 className="font-sans font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mb-2">
                  {veltraxx.edition}
                </h3>

                <div className="font-mono text-xs text-[#FFE500] font-bold mb-4">
                  Dates: {veltraxx.dates} • Venue: {veltraxx.venue}
                </div>

                {/* Motto */}
                <div className="p-4 rounded-xl bg-[#161622] border-2 border-[#FFE500]/40 mb-6">
                  <p className="font-sans text-xs sm:text-sm text-white/90 italic font-medium">
                    &ldquo;{veltraxx.theme}&rdquo;
                  </p>
                </div>

                {/* 4 Pillars */}
                <div className="space-y-3 mb-8">
                  <span className="font-mono text-xs font-black text-white/70 uppercase tracking-wider block">
                    The 4 Core Engineering Pillars:
                  </span>
                  {veltraxx.pillars.map((pillar) => (
                    <div
                      key={pillar.number}
                      className="p-3.5 rounded-xl bg-[#161622] border border-white/10 flex items-start gap-3"
                    >
                      <span className="px-2 py-0.5 rounded bg-[#FF2E93] text-white font-mono text-xs font-black shrink-0">
                        {pillar.number}
                      </span>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-white uppercase leading-snug">
                          {pillar.title}
                        </h4>
                        <p className="font-sans text-xs text-white/70 font-medium mt-0.5">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion CTA to Register for VELTRAXX 2.0 */}
              <div className="pt-5 border-t-2 border-white/15">
                <a
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#FFE500] text-[#111116] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_#FFFFFF] hover:bg-white hover:shadow-[2px_2px_0px_#FFFFFF] transition-all"
                >
                  <span>Register for VELTRAXX 2.0 (100% Free Round 1)</span>
                  <ArrowRight className="w-4 h-4 text-[#111116]" />
                </a>
              </div>
            </div>
          </Tilt3DCard>

          {/* Right Stage: THE LOST SILICON (Solar Yellow Chassis) */}
          <Tilt3DCard maxTilt={5} scale={1.01} translateZ={20} className="h-full">
            <div className="h-full rounded-3xl bg-[#FFE500] text-[#111116] p-7 sm:p-9 border-3 border-[#111116] shadow-[8px_8px_0px_#111116] flex flex-col justify-between">
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="px-3 py-1 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116]">
                    HARDWARE DEBUGGING ARENA
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#111116]">
                    <Trophy className="w-3.5 h-3.5 text-[#0055FF]" />
                    <span>3 GAUNTLET ROUNDS</span>
                  </div>
                </div>

                <h3 className="font-sans font-black text-3xl sm:text-4xl text-[#111116] uppercase tracking-tight mb-2">
                  {lostSilicon.title}
                </h3>

                <div className="font-mono text-xs text-[#111116] font-bold mb-4">
                  Date: {lostSilicon.date} • Venue: {lostSilicon.venue}
                </div>

                {/* Coordinators & Organizers */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-[#111116] mb-5 font-mono text-xs text-[#111116]">
                  <div className="font-bold text-[#0055FF]">
                    Organizers: {lostSilicon.organizers}
                  </div>
                  <div className="mt-1">
                    Staff Lead: {lostSilicon.staffCoordinator}
                  </div>
                  <div>
                    Student Lead: {lostSilicon.studentCoordinator}
                  </div>
                </div>

                {/* Motto */}
                <div className="p-4 rounded-xl bg-[#111116] text-[#FFE500] border-2 border-[#111116] mb-6">
                  <p className="font-sans text-xs sm:text-sm italic font-bold">
                    &ldquo;{lostSilicon.theme}&rdquo;
                  </p>
                </div>

                {/* 3 Progressive Gauntlet Rounds */}
                <div className="space-y-3 mb-8">
                  <span className="font-mono text-xs font-black text-[#111116] uppercase tracking-wider block">
                    The 3 Gauntlet Rounds:
                  </span>
                  {lostSilicon.rounds.map((rnd) => (
                    <div
                      key={rnd.round}
                      className="p-3.5 rounded-xl bg-white border-2 border-[#111116] flex items-start gap-3 shadow-[2px_2px_0px_#111116]"
                    >
                      <span className="px-2 py-0.5 rounded bg-[#0055FF] text-white font-mono text-xs font-black shrink-0">
                        {rnd.round}
                      </span>
                      <div>
                        <h4 className="font-sans font-black text-sm text-[#111116] uppercase leading-snug">
                          {rnd.title}
                        </h4>
                        <p className="font-sans text-xs text-[#111116]/85 font-medium mt-0.5">
                          {rnd.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Summary Stamp */}
              <div className="pt-4 border-t-2 border-[#111116]/20 flex items-center justify-between font-mono text-xs font-bold">
                <span>Annual Circuit Debugging Challenge</span>
                <span className="px-2.5 py-1 rounded bg-[#111116] text-white text-[11px]">
                  VERIFIED COMPETITION
                </span>
              </div>
            </div>
          </Tilt3DCard>
        </div>
      </div>
    </section>
  );
}

