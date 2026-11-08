// src/components/about/AboutMarqueeStats.jsx
// S2: Dual Intersecting Marquees & Departmental Key Metric Chips
// High-voltage physical band styling breaking the linear grid

import React from 'react';
import {
  marqueeItemsTop,
  marqueeItemsBottom,
  departmentStatsChips,
} from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutMarqueeStats() {
  return (
    <section className="relative w-full py-12 md:py-16 bg-[#F4F4F6] text-[#111116] border-b-3 border-[#111116] overflow-hidden">
      {/* Dual Intersecting Marquee Ribbons */}
      <div className="relative w-full py-6 mb-12 select-none overflow-hidden">
        {/* Ribbon 1: Dark Carbon Band */}
        <div className="relative w-[110%] -left-[5%] -rotate-2 bg-[#0D0D11] text-[#FFE500] py-3.5 border-y-3 border-[#FFE500] shadow-[0px_6px_0px_#111116] z-10 flex overflow-x-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-8 font-mono text-sm sm:text-base font-black uppercase tracking-wider">
            {marqueeItemsTop.concat(marqueeItemsTop).map((item, idx) => (
              <span key={`top-1-${idx}`} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-[#FF2E93] text-lg">★</span>
              </span>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="flex shrink-0 animate-marquee items-center gap-8 font-mono text-sm sm:text-base font-black uppercase tracking-wider"
          >
            {marqueeItemsTop.concat(marqueeItemsTop).map((item, idx) => (
              <span key={`top-2-${idx}`} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-[#FF2E93] text-lg">★</span>
              </span>
            ))}
          </div>
        </div>

        {/* Ribbon 2: Solar Yellow Band (Intersecting with negative margin) */}
        <div className="relative w-[110%] -left-[5%] rotate-1 bg-[#FFE500] text-[#111116] py-3.5 border-y-3 border-[#111116] shadow-[0px_6px_0px_#111116] -mt-3.5 z-20 flex overflow-x-hidden">
          <div className="flex shrink-0 animate-marquee-reverse items-center gap-8 font-mono text-sm sm:text-base font-black uppercase tracking-wider">
            {marqueeItemsBottom.concat(marqueeItemsBottom).map((item, idx) => (
              <span key={`bot-1-${idx}`} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-[#0055FF] text-lg">●</span>
              </span>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="flex shrink-0 animate-marquee-reverse items-center gap-8 font-mono text-sm sm:text-base font-black uppercase tracking-wider"
          >
            {marqueeItemsBottom.concat(marqueeItemsBottom).map((item, idx) => (
              <span key={`bot-2-${idx}`} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-[#0055FF] text-lg">●</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4 High-Voltage Departmental Stat Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departmentStatsChips.map((chip, idx) => (
            <Tilt3DCard
              key={idx}
              maxTilt={6}
              scale={1.02}
              translateZ={16}
              className="h-full"
            >
              <div className="h-full rounded-2xl bg-white p-6 border-3 border-[#111116] shadow-[5px_5px_0px_#111116] flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-2xl sm:text-3xl font-black mb-3 border border-[#111116]">
                    {chip.stat}
                  </div>
                  <h3 className="font-sans font-black text-lg text-[#111116] uppercase leading-snug mb-2">
                    {chip.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#111116]/80 leading-relaxed font-medium">
                    {chip.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#111116]/10 flex items-center justify-between font-mono text-[10px] text-[#6B6B78] uppercase">
                  <span>METRIC // 0{idx + 1}</span>
                  <span className="font-bold text-[#111116]">VERIFIED</span>
                </div>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      </div>
    </section>
  );
}

