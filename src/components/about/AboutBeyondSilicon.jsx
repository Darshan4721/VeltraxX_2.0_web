// src/components/about/AboutBeyondSilicon.jsx
// S9: Holistic Excellence Beyond Silicon (Sports, NCC, Cultural & Clubs)
// High-voltage FULL-BLEED SOLID COLOR Bento Cards matching the Home Page aesthetic

import React, { useState } from 'react';
import { Trophy, Shield, Palette, Users, Award, Star, ExternalLink } from 'lucide-react';
import { beyondSiliconData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutBeyondSilicon() {
  const [activeTab, setActiveTab] = useState('sports');
  const { sports, ncc, cultural, clubs } = beyondSiliconData;

  const tabs = [
    { id: 'sports', label: 'SPORTS CHAMPIONS (6)', icon: Trophy },
    { id: 'ncc', label: 'NCC CADETS (7)', icon: Shield },
    { id: 'cultural', label: 'CULTURAL & ARTS (6)', icon: Palette },
    { id: 'clubs', label: 'STUDENT CLUBS (3)', icon: Users },
  ];

  return (
    <section
      id="beyond-silicon"
      className="relative w-full py-20 bg-[#FAF8F5] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#B6FF00]">
            <span className="w-2 h-2 rounded-full bg-[#B6FF00]" />
            <span>CHAPTER 08 // HOLISTIC EXCELLENCE</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            CHAMPIONS <span className="text-[#FF2E93]">BEYOND</span> THE SILICON DIE
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 max-w-2xl mt-2 font-medium">
            From South Zone shooting golds and Republic Day NCC parades to national dance podiums and student-led tech clubs.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-10 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-2 transition-all select-none ${
                  isActive
                    ? 'bg-[#111116] text-[#FFE500] border-[#111116] shadow-[4px_4px_0px_#FFE500] translate-x-0.5 -translate-y-0.5'
                    : 'bg-white text-[#111116] border-[#111116] hover:bg-[#FFE500]/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Sports Champions (Full-Bleed Solid Color Bento Cards) */}
        {activeTab === 'sports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((athlete, idx) => (
              <Tilt3DCard
                key={idx}
                maxTilt={6}
                scale={1.02}
                translateZ={20}
                className="h-full"
              >
                <div
                  className="h-full rounded-3xl p-6 sm:p-7 border-3 border-[#111116] shadow-[6px_6px_0px_#111116] flex flex-col justify-between"
                  style={{
                    backgroundColor: athlete.cardFill,
                    color: athlete.cardText,
                  }}
                >
                  <div>
                    {/* Photo if available */}
                    {athlete.image && (
                      <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                        <img
                          src={athlete.image}
                          alt={athlete.name}
                          className="w-full h-44 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-[#111116] text-white font-mono text-[10px] font-bold">
                          {athlete.sport}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold uppercase opacity-80">
                        {athlete.year} Department Athlete
                      </span>
                    </div>

                    <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                      {athlete.name}
                    </h3>

                    {/* Medals Pill */}
                    <div className="inline-block px-3 py-1 rounded-lg bg-[#111116] text-white font-mono text-xs font-bold mb-4">
                      {athlete.medals}
                    </div>

                    {athlete.quote && (
                      <div className="p-3.5 rounded-xl bg-black/10 border border-current/20 mb-4 italic text-xs sm:text-sm font-medium">
                        &ldquo;{athlete.quote}&rdquo;
                      </div>
                    )}

                    {/* Highlights */}
                    <div className="space-y-1.5 mb-4">
                      {athlete.highlights.map((hl, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-2 font-mono text-xs opacity-90"
                        >
                          <span className="font-black">›</span>
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-current/20 font-mono text-xs font-bold flex items-center justify-between">
                    <span>Anna University / Zonal</span>
                    <span>VERIFIED RECORD</span>
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        )}

        {/* Tab 2: NCC Cadets */}
        {activeTab === 'ncc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <Tilt3DCard maxTilt={5} scale={1.01} translateZ={20}>
                <div className="rounded-3xl bg-[#0D0D11] text-white p-6 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_#B6FF00]">
                  <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img
                      src={ncc.image}
                      alt="Department NCC Cadets"
                      className="w-full h-64 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0D0D11]/90 text-[#B6FF00] font-mono text-xs font-bold">
                      {ncc.unit}
                    </div>
                  </div>
                  <h3 className="font-sans font-black text-2xl text-white uppercase mb-2">
                    National Cadet Corps (NCC)
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                    Department cadets selected for prestigious national camps including Republic Day Parade (RDC) training and specialized Army Attachment training with 4/8 Gorkha Rifles.
                  </p>
                </div>
              </Tilt3DCard>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {ncc.cadets.map((cadet, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border-3 border-[#111116] shadow-[4px_4px_0px_#111116] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:translate-x-1 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#B6FF00] text-[#111116] font-mono text-xs font-black flex items-center justify-center border border-[#111116] shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-sans font-black text-base text-[#111116]">
                      {cadet.name}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#0055FF] font-bold">
                    {cadet.achievement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Cultural & Art Corner */}
        {activeTab === 'cultural' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Illusion Crew */}
            <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
              <div className="h-full rounded-3xl bg-[#FF2E93] text-white p-7 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_#111116] flex flex-col justify-between">
                <div>
                  <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                    <img
                      src={cultural.danceCrew.image}
                      alt={cultural.danceCrew.name}
                      className="w-full h-52 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#111116] text-white font-mono text-xs font-bold">
                      Members: {cultural.danceCrew.members}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase tracking-wider inline-block mb-3">
                    COLLEGIATE DANCE DUO
                  </span>

                  <h3 className="font-sans font-black text-3xl uppercase tracking-tight mb-2">
                    {cultural.danceCrew.name}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-black/15 border border-white/20 mb-5 italic font-sans text-xs sm:text-sm">
                    &ldquo;{cultural.danceCrew.quote}&rdquo;
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <span className="font-mono text-xs font-bold uppercase block text-white/80">
                      Major Tournament Accolades:
                    </span>
                    {cultural.danceCrew.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="font-mono text-xs flex items-center gap-2">
                        <span className="text-[#FFE500] font-black">★</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt3DCard>

            {/* Art Corner */}
            <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20} className="h-full">
              <div className="h-full rounded-3xl bg-[#FFE500] text-[#111116] p-7 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_#111116] flex flex-col justify-between">
                <div>
                  <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                    <img
                      src={cultural.artCorner.image}
                      alt={cultural.artCorner.title}
                      className="w-full h-52 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#111116] text-[#FFE500] font-mono text-xs font-bold">
                      Student Creative Portfolio
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-[#111116] text-white font-mono text-xs font-black uppercase tracking-wider inline-block mb-3">
                    VISUAL ARTS SHOWCASE
                  </span>

                  <h3 className="font-sans font-black text-3xl uppercase tracking-tight mb-4">
                    {cultural.artCorner.title}
                  </h3>

                  <div className="space-y-2 mb-6">
                    {cultural.artCorner.artists.map((artist, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border-2 border-[#111116] flex items-center justify-between gap-3 shadow-[2px_2px_0px_#111116]"
                      >
                        <span className="font-sans font-bold text-sm text-[#111116]">
                          {artist.name}
                        </span>
                        <span className="font-mono text-xs text-[#0055FF] font-semibold">
                          {artist.work}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        )}

        {/* Tab 4: Student Governance & Clubs */}
        {activeTab === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubs.map((club, idx) => (
              <Tilt3DCard
                key={idx}
                maxTilt={6}
                scale={1.02}
                translateZ={18}
                className="h-full"
              >
                <div className="h-full rounded-3xl bg-white p-6 sm:p-7 border-3 border-[#111116] shadow-[6px_6px_0px_#111116] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#00E5FF] text-[#111116] font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116] mb-4">
                      {club.role}
                    </span>
                    <h3 className="font-sans font-black text-2xl text-[#111116] uppercase tracking-tight mb-3">
                      {club.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#111116]/80 leading-relaxed font-medium mb-5">
                      {club.desc}
                    </p>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border-2 border-[#111116]/20 mb-3 font-mono text-xs">
                      <span className="font-bold text-[#0055FF] block mb-1">Coordinators:</span>
                      <span className="text-[#111116]">{club.coordinators}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#111116]/15 font-mono text-xs text-[#6B6B78]">
                    Members: {club.members}
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

