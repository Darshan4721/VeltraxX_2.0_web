// src/components/about/AboutHero.jsx
// S1: Asymmetric Hero Stage & 2.5D Interactive Silicon Wafer Portal
// Sourced from official 2026-2027 Department Magazine ('The Young Mind's Magazine')

import React from 'react';
import { Download, ArrowDown, FileText, Cpu, Sparkles } from 'lucide-react';
import { vitalStats } from '../../data/aboutData';
import { smoothScrollTo } from '../ScrollManager';
import Tilt3DCard from './Tilt3DCard';

export default function AboutHero({ onOpenGallery }) {
  const scrollToProjects = (e) => {
    smoothScrollTo('silicon-research', e);
  };

  return (
    <section
      id="journey-hero"
      className="relative w-full pt-8 pb-16 md:py-20 bg-[#FAF8F5] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      {/* Background Architectural Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(#111116 0.75px, transparent 0.75px), radial-gradient(#111116 0.75px, #FAF8F5 0.75px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Decorative Technical Coordinate Badges */}
      <div className="hidden lg:flex absolute top-6 right-8 gap-3 font-mono text-[11px] font-bold text-[#6B6B78] uppercase select-none pointer-events-none">
        <span className="px-2.5 py-1 rounded border-2 border-[#111116]/30 bg-white/70">
          LAT: 11.0168° N // LON: 76.9558° E
        </span>
        <span className="px-2.5 py-1 rounded border-2 border-[#111116]/30 bg-white/70">
          C2S NODE: GPDK 90NM
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 12-Column Asymmetric Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center mb-16">
          {/* Left Column (7 cols): Typography & Mission */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Monospace Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-5 border-2 border-[#111116] shadow-[2px_2px_0px_#FFE500]">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse" />
              <span>ACADEMIC YEAR 2026-2027 // MEITY C2S PROGRAMME • TNEA 2727</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] tracking-tight leading-[0.96] text-[#111116] uppercase mb-4">
              ARCHITECTING <span className="text-[#0055FF]">SILICON.</span>
              <br />
              EMPOWERING <span className="text-[#FF2E93]">MINDS.</span>
            </h1>

            {/* Logic to Enterprise Badge with generous breathing room */}
            <div className="mt-4 mb-8 sm:mt-5 sm:mb-10">
              <span className="inline-block px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-[#FFE500] text-[#111116] border-3 border-[#111116] shadow-[5px_5px_0px_#111116] font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight select-none">
                [ LOGIC TO ENTERPRISE ]
              </span>
            </div>

            {/* Thesis Statement */}
            <p className="font-sans text-base sm:text-lg text-[#111116]/90 leading-relaxed font-medium mb-8 max-w-2xl">
              The <strong className="text-[#111116] font-bold">Department of Electronics Engineering (VLSI Design and Technology)</strong> at
              Sri Shakthi Institute of Engineering and Technology delivers end-to-end semiconductor education - bridging
              algorithmic conception, Cadence and Synopsys EDA physical design, and enterprise-grade hardware fabrication.
            </p>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href="#silicon-research"
                onClick={scrollToProjects}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#111116] text-[#FFE500] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_#00E5FF] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#00E5FF] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Cpu className="w-4 h-4 text-[#00E5FF]" />
                <span>Explore 17 Silicon Projects</span>
                <ArrowDown className="w-4 h-4 text-[#FFE500]" />
              </a>

              <a
                href="/downloads/Collage_vlsi_magazine.pdf"
                download="Collage_vlsi_magazine.pdf"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FFE500] text-[#111116] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Download className="w-4 h-4 text-[#111116]" />
                <span>Download Magazine (PDF • 51 Pages)</span>
              </a>
            </div>
          </div>

          {/* Right Column (5 cols): 2.5D Layered Silicon Wafer & Magazine Portal */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <Tilt3DCard
              maxTilt={7}
              scale={1.03}
              translateZ={30}
              className="w-full max-w-md"
            >
              <div className="relative rounded-3xl bg-[#0D0D11] p-6 border-3 border-[#111116] shadow-[8px_8px_0px_#111116] text-white overflow-hidden">
                {/* Background Silicon Circuit Motif */}
                <div
                  className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#FFE500]/15 blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#FF2E93]/20 blur-2xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Top Telemetry Header */}
                <div className="flex items-center justify-between border-b-2 border-white/15 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF2E93] border border-[#111116]" />
                    <span className="w-3 h-3 rounded-full bg-[#FFE500] border border-[#111116]" />
                    <span className="w-3 h-3 rounded-full bg-[#00E5FF] border border-[#111116]" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#FFE500] uppercase tracking-wider">
                    DEPT MAGAZINE // 51 PAGES
                  </span>
                </div>

                {/* Layered Wafer & Cover Stage */}
                <div className="relative flex justify-center items-center py-4">
                  {/* Outer Layer: Solar Wafer Backplate */}
                  <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[#FFE500] border-3 border-[#111116] shadow-[4px_4px_0px_#FF2E93] -rotate-6 pointer-events-none" />

                  {/* Cyan Layer Accent */}
                  <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#00E5FF] border-3 border-[#111116] rotate-12 opacity-80 pointer-events-none" />

                  {/* Foreground: Magazine Cover Card */}
                  <div className="relative z-10 w-44 sm:w-52 rounded-2xl bg-white p-2 border-3 border-[#111116] shadow-[6px_6px_0px_#111116] -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img
                      src="/images/about/magazine_cover.webp"
                      alt="The Young Mind's Magazine Cover 2026-2027"
                      width="800"
                      height="1200"
                      className="w-full h-auto rounded-xl border border-[#111116]/20 object-cover"
                      loading="eager"
                    />
                    <div className="mt-2 text-center">
                      <span className="font-mono text-[10px] font-black text-[#111116] tracking-widest uppercase">
                        ANNUAL EDITION // 2026-27
                      </span>
                    </div>
                  </div>

                  {/* Floating Sticker 1: Chips to Startup */}
                  <div className="absolute -bottom-2 -left-2 z-20 px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#111116] font-mono text-[11px] font-black border-2 border-[#111116] shadow-[3px_3px_0px_#111116] -rotate-6">
                    ★ MEITY C2S HUB
                  </div>

                  {/* Floating Sticker 2: 17 Silicon Architectures */}
                  <div className="absolute -top-3 -right-2 z-20 px-3 py-1.5 rounded-lg bg-[#FF2E93] text-white font-mono text-[11px] font-black border-2 border-[#111116] shadow-[3px_3px_0px_#111116] rotate-3">
                    17 SILICON CHIPS
                  </div>
                </div>

                {/* Bottom Gallery Action */}
                <div className="mt-5 pt-4 border-t-2 border-white/15 flex items-center justify-between">
                  <span className="font-mono text-xs text-white/70">
                    Official Student Research Archive
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenGallery && onOpenGallery(0)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B6FF00] text-[#111116] font-mono text-xs font-black uppercase border-2 border-[#111116] shadow-[2px_2px_0px_#111116] hover:bg-[#FFE500] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Cover</span>
                  </button>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>

        {/* Ground Vitals Strip (6 Full-Bleed Solid Color Bento Counters) */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93]" />
            <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#111116]">
              DEPARTMENT VITALS & AUTHORIZED MILESTONES // C2S EDA NETWORK
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {vitalStats.map((item, idx) => (
              <Tilt3DCard
                key={idx}
                maxTilt={6}
                scale={1.03}
                translateZ={18}
                className="h-full"
              >
                <div
                  className="h-full rounded-2xl p-4 sm:p-5 border-3 border-[#111116] shadow-[5px_5px_0px_#111116] flex flex-col justify-between transition-transform duration-200"
                  style={{
                    backgroundColor: item.color,
                    color: item.textColor,
                  }}
                >
                  <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    {item.number}
                  </div>
                  <div>
                    <div className="font-sans font-black text-sm sm:text-base uppercase leading-snug">
                      {item.label}
                    </div>
                    <div
                      className="font-mono text-[10px] sm:text-xs font-semibold leading-tight mt-1 opacity-85"
                    >
                      {item.subtext}
                    </div>
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

