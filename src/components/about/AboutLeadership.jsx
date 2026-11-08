// src/components/about/AboutLeadership.jsx
// S3: Institutional Vision & 5-Stage VLSI Innovation Model
// High-voltage Obsidian Pitch-Black (#0D0D11) chassis with sharp Neo-Brutalist portrait framing

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Award, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import {
  leadershipData,
  fiveStagesInnovation,
  facultyData,
} from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutLeadership() {
  const [activeLeaderId, setActiveLeaderId] = useState('chairman');
  const currentLeader =
    leadershipData.find((l) => l.id === activeLeaderId) || leadershipData[0];

  return (
    <section
      id="leadership"
      className="relative w-full py-20 bg-[#0D0D11] text-white border-b-3 border-[#111116] overflow-hidden"
    >
      {/* Background Subtle Silicon Grid */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] border border-[#FFE500]/40 text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
            <span>CHAPTER 02 // INSTITUTIONAL VISION</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
            LEADERSHIP, VISION <span className="text-[#FFE500]">&amp;</span> VLSI INNOVATION
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/70 max-w-2xl mt-2 font-medium">
            Autonomous curriculum agility and world-class EDA laboratory governance under the stewardship of Sri Shakthi Institute of Engineering and Technology.
          </p>
        </div>

        {/* 5-Tab Leader Selector Bar */}
        <div className="flex flex-wrap gap-2.5 mb-10 pb-2 overflow-x-auto">
          {leadershipData.map((leader) => {
            const isActive = leader.id === activeLeaderId;
            return (
              <button
                key={leader.id}
                type="button"
                onClick={() => setActiveLeaderId(leader.id)}
                className={`px-4 sm:px-5 py-3 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-2 transition-all select-none ${
                  isActive
                    ? 'bg-[#FFE500] text-[#111116] border-[#FFE500] shadow-[4px_4px_0px_#FF2E93] translate-x-0.5 -translate-y-0.5'
                    : 'bg-[#161620] text-white/80 border-white/20 hover:border-white/50 hover:text-white'
                }`}
              >
                {leader.name} ({leader.role.split(' ')[0]})
              </button>
            );
          })}
        </div>

        {/* Active Leader Showcase Card */}
        <div className="mb-16">
          <Tilt3DCard maxTilt={4} scale={1.01} translateZ={20}>
            <div className="rounded-3xl bg-[#161622] p-6 sm:p-8 md:p-10 border-3 border-[#FFE500]/60 shadow-[8px_8px_0px_#111116]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Leader Portrait (Full vibrant color always - NO raw scanned page, NO grayscale) */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative w-56 sm:w-64 rounded-2xl bg-white p-3 border-3 border-[#111116] shadow-[6px_6px_0px_#FFE500]">
                    <img
                      src={currentLeader.image}
                      alt={currentLeader.name}
                      className="w-full h-64 sm:h-72 object-cover object-top rounded-xl border border-[#111116]/20 transition-all duration-300"
                    />
                    <div className="mt-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#111116] text-[#FFE500] font-mono text-[10px] font-black uppercase tracking-widest">
                        {currentLeader.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leader Vision Details & Quotes */}
                <div className="lg:col-span-8 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase">
                      {currentLeader.name}
                    </h3>
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-[#FFE500] uppercase mb-6 tracking-wide">
                    {currentLeader.role} • {currentLeader.organization}
                  </div>

                  {/* Primary Quote Box */}
                  {currentLeader.quote && (
                    <div className="relative p-5 sm:p-6 rounded-2xl bg-[#0D0D11] border-2 border-white/20 mb-6 shadow-[4px_4px_0px_#111116]">
                      <div className="text-3xl text-[#FFE500] font-serif leading-none mb-2 select-none">
                        &ldquo;
                      </div>
                      <p className="font-sans text-sm sm:text-base text-white/90 italic font-medium leading-relaxed">
                        {currentLeader.quote}
                      </p>
                      {currentLeader.attribution && (
                        <div className="mt-3 text-right font-mono text-xs font-bold text-[#FFE500]">
                          - {currentLeader.attribution}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Triad Maxims for Joint Secretary */}
                  {currentLeader.triadMaxims && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {currentLeader.triadMaxims.map((maxim, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-4 rounded-xl bg-[#0D0D11] border-2 border-[#B6FF00]/40 text-left"
                        >
                          <span className="font-mono text-xs font-bold text-[#B6FF00] block mb-1">
                            PILLAR 0{mIdx + 1}
                          </span>
                          <p className="font-sans text-xs text-white/90 font-semibold leading-snug">
                            {maxim}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vision Paragraph */}
                  <p className="font-sans text-sm sm:text-base text-white/80 leading-relaxed font-normal mb-6">
                    {currentLeader.vision}
                  </p>

                  {/* Technical Scope Checklist for HOD */}
                  {currentLeader.technicalScope && (
                    <div className="mb-6 p-4 rounded-xl bg-[#0D0D11] border border-white/15">
                      <span className="font-mono text-xs font-bold text-[#FFE500] uppercase tracking-wider block mb-2.5">
                        Technical Specializations Directed:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentLeader.technicalScope.map((scope, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-2 font-mono text-xs text-white/85"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                            <span>{scope}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Contact Hotline for HOD */}
                  {currentLeader.contact && (
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t-2 border-white/10 font-mono text-xs">
                      <a
                        href={`tel:${currentLeader.contact.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFE500] text-[#111116] font-bold border-2 border-[#111116] shadow-[2px_2px_0px_#FFFFFF] hover:bg-white transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>HOD Hotline: {currentLeader.contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${currentLeader.contact.email}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161620] text-white font-bold border border-white/30 hover:border-white transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>{currentLeader.contact.email}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tilt3DCard>
        </div>

        {/* The 5 Stages of VLSI Innovation Stepper Card */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500]" />
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FFE500]">
              ACADEMIC METHODOLOGY // THE 5 STAGES OF VLSI INNOVATION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {fiveStagesInnovation.map((stage) => (
              <div
                key={stage.step}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = stage.color;
                  e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${stage.color}`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #111116';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
                className="rounded-2xl bg-[#161622] p-5 border-2 border-white/15 shadow-[4px_4px_0px_#111116] flex flex-col justify-between transition-all duration-200 cursor-pointer"
              >
                <div>
                  <div
                    className="inline-block px-2.5 py-1 rounded-md font-mono text-xs font-black mb-3 border border-[#111116]"
                    style={{
                      backgroundColor: stage.color,
                      color: stage.color === '#FFE500' || stage.color === '#B6FF00' || stage.color === '#00E5FF' ? '#111116' : '#FFFFFF',
                    }}
                  >
                    PHASE {stage.step}
                  </div>
                  <h4 className="font-sans font-black text-base text-white uppercase mb-2">
                    {stage.title}
                  </h4>
                  <p className="font-sans text-xs text-white/70 leading-relaxed font-medium">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Faculty Roster (4 Assistant Professors) - High-Voltage Pop */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
                DEPARTMENT FACULTY PILLARS // VLSI DESIGN &amp; TECHNOLOGY
              </h3>
            </div>
            <span className="font-mono text-xs text-white/50">
              Department Desk: ee-vlsi@siet.ac.in
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facultyData.map((faculty, fIdx) => {
              const facultyColors = ['#0055FF', '#FF2E93', '#B6FF00', '#FFE500'];
              const accentColor = facultyColors[fIdx] || '#FFE500';
              const isDarkText = accentColor === '#FFE500' || accentColor === '#B6FF00';

              return (
                <div
                  key={fIdx}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${accentColor}`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #111116';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                  className="rounded-2xl bg-[#161622] p-6 border-2 border-white/15 shadow-[4px_4px_0px_#111116] flex flex-col justify-between transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <span
                      className="inline-block px-2.5 py-1 rounded-md font-mono text-xs font-black uppercase tracking-wider mb-4 border border-[#111116]"
                      style={{
                        backgroundColor: accentColor,
                        color: isDarkText ? '#111116' : '#FFFFFF',
                      }}
                    >
                      {faculty.tag}
                    </span>
                    <h4 className="font-sans font-black text-lg sm:text-xl text-white mb-1.5 leading-snug">
                      {faculty.name}
                    </h4>
                    <div className="font-mono text-xs text-[#FFE500] font-bold mb-3.5">
                      {faculty.designation} • {faculty.qualifications}
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
                      {faculty.specialization}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between font-mono text-xs">
                    <a
                      href={`mailto:${faculty.email}`}
                      className="inline-flex items-center gap-1.5 text-white/80 hover:text-[#00E5FF] transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>{faculty.email}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

