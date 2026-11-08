// src/components/about/AboutWorkshops.jsx
// S4: MeitY C2S EDA Labs & 7 Commercial Workshops Timeline
// High-voltage FULL-BLEED SOLID COLOR Bento Cards with real-time continuous scroll progress

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Cpu, Wrench, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
import { workshopsData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutWorkshops() {
  const [expandedRosters, setExpandedRosters] = useState({
    w6: false,
    w7: false,
  });

  const timelineRef = useRef(null);
  const lineFillRef = useRef(null);

  const toggleRoster = (id) => {
    setExpandedRosters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 60fps Real-Time Continuous Scroll Progress Line
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!timelineRef.current || !lineFillRef.current) return;
          const rect = timelineRef.current.getBoundingClientRect();
          const vh = window.innerHeight;

          // Start when top of container hits 65% of viewport, finish when bottom hits 35%
          const start = vh * 0.65;
          const totalTravel = rect.height;
          const currentTravel = start - rect.top;
          const progress = Math.max(0, Math.min(1, currentTravel / totalTravel));

          lineFillRef.current.style.transform = `scaleY(${progress})`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="workshops"
      className="relative w-full py-20 bg-[#FAF8F5] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#FFE500]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>CHAPTER 03 // MEITY CHIPS TO STARTUP (C2S)</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            COMMERCIAL EDA LABS <span className="text-[#0055FF]">&amp;</span> 7 INDUSTRY WORKSHOPS
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 max-w-2xl mt-2 font-medium">
            Over 50 Linux workstations equipped with server-side Cadence and Synopsys toolchains powering continuous physical design and verification bootcamps.
          </p>
        </div>

        {/* MeitY C2S Infrastructure Banner */}
        <div className="rounded-3xl bg-[#0D0D11] text-white p-6 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_#FFE500] mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-block px-3 py-1 rounded-lg bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase mb-3 border border-[#111116]">
                GOVERNMENT OF INDIA • MEITY C2S FACILITY
              </div>
              <h3 className="font-sans font-black text-2xl sm:text-3xl text-white uppercase mb-3">
                High-Performance Computing Cluster &amp; EDA Toolchains
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-medium mb-5">
                Our Advanced VLSI Research Laboratory operates under the national Chips to Startup (C2S) initiative, providing undergraduate students with unobstructed access to enterprise silicon synthesis engines.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Cadence Innovus (Place & Route)',
                  'Cadence Genus (Synthesis)',
                  'Synopsys PrimeTime (STA)',
                  'Synopsys Design Compiler',
                  'Cadence Tempus Timing Sign-off',
                  'GPDK 90nm PDK',
                ].map((tool, tIdx) => (
                  <span
                    key={`infra-${tIdx}`}
                    className="px-3 py-1 rounded-md bg-[#161622] text-[#00E5FF] font-mono text-xs font-bold border border-white/15"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-[#161622] border-2 border-[#00E5FF]/40">
                <div className="font-mono text-2xl font-black text-[#00E5FF]">50+</div>
                <div className="font-mono text-xs text-white/80 uppercase">Dedicated Linux Workstations</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#161622] border-2 border-[#FFE500]/40">
                <div className="font-mono text-2xl font-black text-[#FFE500]">24/7</div>
                <div className="font-mono text-xs text-white/80 uppercase">Server-Side EDA Simulation Licensing</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Verified Workshops with Real-Time Continuous Scroll Line */}
        <div ref={timelineRef} className="relative">
          {/* Vertical Real-Time Progress Line Container */}
          <div
            className="hidden md:block absolute left-8 top-4 bottom-4 w-1.5 bg-[#111116]/15 rounded-full pointer-events-none"
            aria-hidden="true"
          >
            {/* The Active Filled Line */}
            <div
              ref={lineFillRef}
              className="w-full bg-[#0055FF] rounded-full origin-top transition-transform duration-75 ease-linear will-change-transform"
              style={{ height: '100%', transform: 'scaleY(0)' }}
            />
          </div>

          <div className="space-y-8 md:pl-20">
            {workshopsData.map((ws) => (
              <div key={ws.id} className="relative">
                {/* Milestone Node Badge */}
                <div className="hidden md:flex absolute -left-[76px] top-6 w-9 h-9 rounded-xl bg-[#111116] text-[#FFE500] font-mono text-xs font-black items-center justify-center border-2 border-[#FFE500] shadow-[2px_2px_0px_#111116] z-10 select-none">
                  {ws.number}
                </div>

                <Tilt3DCard maxTilt={4} scale={1.01} translateZ={16}>
                  <div
                    className={`rounded-3xl p-6 sm:p-8 border-3 ${ws.id === 'w7' ? 'border-[#FFE500] shadow-[6px_6px_0px_#FFE500]' : 'border-[#111116] shadow-[6px_6px_0px_#111116]'} transition-transform duration-200`}
                    style={{
                      backgroundColor: ws.cardFill,
                      color: ws.cardText,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116] ${ws.id === 'w7' ? 'shadow-[2px_2px_0px_#111116]' : ''}`}
                          style={{
                            backgroundColor: ws.badgeBg,
                            color: ws.badgeText,
                          }}
                        >
                          {ws.category}
                        </span>
                        <span className="font-mono text-xs font-bold opacity-80">
                          {ws.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ws.dates}</span>
                      </div>
                    </div>

                    <h3 className={`font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight mb-2 ${ws.id === 'w7' ? 'text-white' : ''}`}>
                      {ws.title}
                    </h3>

                    <div className={`font-mono text-xs font-bold mb-4 ${ws.id === 'w7' ? 'text-white/80' : 'opacity-85'}`}>
                      Partner: {ws.partner} • Venue: {ws.venue}
                    </div>

                    <p className={`font-sans text-sm sm:text-base font-medium leading-relaxed mb-6 ${ws.id === 'w7' ? 'text-white/90' : 'opacity-95'}`}>
                      {ws.description}
                    </p>

                    {/* Tools Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="font-mono text-xs font-black uppercase mr-1">
                        Toolchain:
                      </span>
                      {ws.tools.map((tool, tIdx) => (
                        <span
                          key={`${ws.id}-tool-${tIdx}`}
                          className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border ${ws.id === 'w7' ? 'bg-[#161622] text-[#FFE500] border-[#FFE500]/40' : 'bg-[#111116] text-white border-[#111116]'}`}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {/* Outcomes / Cohort Roster */}
                    {ws.outcomes && (
                      <div className="font-mono text-xs font-bold opacity-90 pt-3 border-t-2 border-current/20">
                        Sign-off: {ws.outcomes}
                      </div>
                    )}

                    {/* Expandable Student Roster for W6 and W7 */}
                    {ws.roster && (
                      <div className="mt-5 pt-4 border-t-2 border-current/25">
                        <button
                          type="button"
                          onClick={() => toggleRoster(ws.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116] shadow-[2px_2px_0px_#111116] hover:bg-white transition-colors cursor-pointer"
                        >
                          <span>{ws.rosterTitle}</span>
                          {expandedRosters[ws.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedRosters[ws.id] && (
                          <div
                            className={`mt-4 p-5 rounded-2xl border-2 shadow-[4px_4px_0px_#111116] ${
                              ws.id === 'w7'
                                ? 'bg-[#161622] text-white border-[#FFE500]/40 shadow-[4px_4px_0px_#FFE500]'
                                : 'bg-white text-[#111116] border-[#111116]'
                            }`}
                          >
                            <div
                              className={`font-mono text-xs font-black uppercase mb-3 ${
                                ws.id === 'w7' ? 'text-[#00E5FF]' : 'text-[#0055FF]'
                              }`}
                            >
                              Official Student Delegate Roster ({ws.roster.length} Undergraduates):
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {ws.roster.map((student, sIdx) => (
                                <div
                                  key={`${ws.id}-student-${sIdx}`}
                                  className={`flex items-center gap-1.5 font-mono text-xs font-bold ${
                                    ws.id === 'w7' ? 'text-[#FFE500]' : 'text-[#111116]'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      ws.id === 'w7' ? 'bg-[#00E5FF]' : 'bg-[#0055FF]'
                                    }`}
                                  />
                                  <span>{student}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Tilt3DCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

