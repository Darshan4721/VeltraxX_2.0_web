// src/components/about/AboutSiliconResearch.jsx
// S5: 17 Undergraduate Silicon Research Architectures Bento
// Domain tabs + Flagship 6 toggle on 'ALL' to eliminate 17-card scroll fatigue

import React, { useState } from 'react';
import { Cpu, Shield, Brain, Layers, Eye, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { siliconProjectsData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutSiliconResearch() {
  const [activeTab, setActiveTab] = useState('all');
  const [showAllCards, setShowAllCards] = useState(false);

  const tabs = [
    { id: 'all', label: 'ALL (17)', count: 17 },
    { id: 'security', label: 'HARDWARE SECURITY & DFT (4)', count: 4 },
    { id: 'ai', label: 'AI & NEUROMORPHIC (5)', count: 5 },
    { id: 'soc', label: 'SOC & INTERCONNECTS (4)', count: 4 },
    { id: 'vision', label: 'VISION & SMART SYSTEMS (4)', count: 4 },
  ];

  const filteredProjects = siliconProjectsData.filter((project) => {
    if (activeTab === 'all') return true;
    return project.domainKey === activeTab;
  });

  // When on 'all' tab, respect the showAllCards toggle; otherwise show all matching the domain
  const displayedProjects =
    activeTab === 'all' && !showAllCards
      ? filteredProjects.filter((p) => p.flagship)
      : filteredProjects;

  return (
    <section
      id="silicon-research"
      className="relative w-full py-20 bg-[#FAF8F5] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#FF2E93]">
            <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
            <span>CHAPTER 04 // UNDERGRADUATE SILICON RESEARCH</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            17 PROPRIETARY <span className="text-[#FF2E93]">ASIC</span> &amp; <span className="text-[#0055FF]">SOC</span> ARCHITECTURES
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 max-w-2xl mt-2 font-medium">
            Designed, synthesized, and verified by undergraduate student researchers in our MeitY C2S EDA Laboratory using commercial GPDK 90nm and FPGA workflows.
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-2.5 mb-10 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAllCards(false);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-2 transition-all select-none ${
                  isActive
                    ? 'bg-[#111116] text-[#FFE500] border-[#111116] shadow-[4px_4px_0px_#FFE500] translate-x-0.5 -translate-y-0.5'
                    : 'bg-white text-[#111116] border-[#111116] hover:bg-[#FFE500]/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Asymmetric Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayedProjects.map((project) => (
            <Tilt3DCard
              key={project.id}
              maxTilt={6}
              scale={1.02}
              translateZ={22}
              className="h-full"
            >
              <div className="h-full rounded-3xl bg-white p-6 sm:p-7 border-3 border-[#111116] shadow-[6px_6px_0px_#111116] flex flex-col justify-between hover:shadow-[8px_8px_0px_#111116] transition-all">
                <div>
                  {/* Top Domain Colored Strip & Project ID */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className="px-3 py-1 rounded-md font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116]"
                      style={{
                        backgroundColor: project.color,
                        color: project.color === '#0055FF' ? '#FFFFFF' : '#111116',
                      }}
                    >
                      {project.domain}
                    </span>

                    <span className="font-mono text-xs font-black text-[#6B6B78] px-2 py-0.5 rounded bg-[#F4F4F6] border border-[#111116]/20">
                      {project.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-sans font-black text-xl sm:text-2xl text-[#111116] uppercase tracking-tight leading-snug mb-3">
                    {project.title}
                  </h3>

                  {/* Author & Year Badge */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#111116]/30 font-mono text-xs font-bold text-[#111116] mb-4">
                    <span className="text-[#0055FF]">Lead:</span>
                    <span>{project.author}</span>
                    <span className="text-[#6B6B78]">({project.year})</span>
                  </div>

                  {/* Abstract */}
                  <p className="font-sans text-xs sm:text-sm text-[#111116]/85 leading-relaxed font-medium mb-6">
                    {project.abstract}
                  </p>
                </div>

                {/* Footer Tools Badges */}
                <div className="pt-4 border-t-2 border-[#111116]/10">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#F4F4F6] text-[#111116] font-mono text-[10px] font-bold border border-[#111116]/30"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt3DCard>
          ))}
        </div>

        {/* Flagship Toggle Button for 'ALL (17)' Tab */}
        {activeTab === 'all' && (
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllCards(!showAllCards)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#FFE500] text-[#111116] font-mono text-sm sm:text-base font-black uppercase tracking-wider border-3 border-[#111116] shadow-[5px_5px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#111116] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all select-none"
            >
              <Sparkles className="w-5 h-5 text-[#FF2E93]" />
              <span>
                {showAllCards
                  ? '▲ SHOW FEATURED 6 FLAGSHIPS ONLY'
                  : '⚡ SHOW ALL 17 SILICON ARCHITECTURES (+11 MORE) ↓'}
              </span>
              {showAllCards ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <span className="font-mono text-xs text-[#6B6B78] mt-3 uppercase tracking-wider">
              {showAllCards
                ? 'Displaying full verified compendium of 17 student ASIC designs'
                : 'Displaying top 6 Flagship Hero projects • Click to view all 17'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

