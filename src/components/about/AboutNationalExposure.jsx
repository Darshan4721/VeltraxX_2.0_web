// src/components/about/AboutNationalExposure.jsx
// S7: National Delegations & Conclaves Rail (SEMICON India, VDAT, DIRV IIT Madras, IEEE CAS)
// Continuous vertical execution rail with student delegate rosters and awards

import React from 'react';
import { MapPin, Calendar, Award, ExternalLink, Users, Sparkles } from 'lucide-react';
import { nationalExposureData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

export default function AboutNationalExposure({ onOpenGallery }) {
  return (
    <section
      id="national-exposure"
      className="relative w-full py-20 bg-[#FAF8F5] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#00E5FF]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>CHAPTER 06 // NATIONAL FOOTPRINT</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            IIT DELEGATIONS <span className="text-[#0055FF]">&amp;</span> NATIONAL CONCLAVES
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 max-w-2xl mt-2 font-medium">
            From SEMICON India at Yashobhoomi to DIRV RISC-V at IIT Madras and IEEE CAS in Kerala, our student engineers actively present research across India.
          </p>
        </div>

        {/* Delegations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nationalExposureData.map((item, idx) => (
            <Tilt3DCard
              key={item.id}
              maxTilt={5}
              scale={1.02}
              translateZ={18}
              className="h-full"
            >
              <div className="h-full rounded-3xl bg-white p-6 border-3 border-[#111116] shadow-[6px_6px_0px_#111116] flex flex-col justify-between hover:shadow-[8px_8px_0px_#111116] transition-all">
                <div>
                  {/* Photo Thumbnail if available */}
                  {item.image && (
                    <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-[#111116] shadow-[3px_3px_0px_#111116] bg-[#0D0D11]/5 flex items-center justify-center p-2 min-h-[220px] max-h-[280px] group">
                      <img
                        src={item.image}
                        alt={item.title}
                        width="800"
                        height="1200"
                        className="w-full h-auto max-h-[260px] object-contain rounded-xl group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenGallery && onOpenGallery(idx)}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-[11px] font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#FFE500] border border-[#111116] hover:bg-white hover:text-[#111116] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Full Page</span>
                      </button>
                    </div>
                  )}

                  {/* Header Badge & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md font-mono text-xs font-black uppercase border-2 border-[#111116]"
                      style={{
                        backgroundColor: item.badgeColor,
                        color: item.badgeTextColor,
                      }}
                    >
                      {item.badge}
                    </span>
                    <span className="font-mono text-xs text-[#6B6B78] font-bold">
                      {item.dates}
                    </span>
                  </div>

                  <h3 className="font-sans font-black text-xl text-[#111116] uppercase tracking-tight leading-snug mb-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-[#0055FF] font-bold mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.venue}</span>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#111116]/85 font-medium leading-relaxed mb-4">
                    {item.summary}
                  </p>

                  {/* Podium Awards for IEEE CAS */}
                  {item.awards && (
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border-2 border-[#FFE500] mb-4 space-y-2">
                      <div className="font-mono text-xs font-black text-[#111116] uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#0055FF]" />
                        <span>Verified Podium Laureates:</span>
                      </div>
                      {item.awards.map((aw, aIdx) => (
                        <div
                          key={aIdx}
                          className="font-mono text-xs flex items-center justify-between gap-2 pt-1 border-t border-[#111116]/10"
                        >
                          <span className="font-bold text-[#111116]">{aw.student}</span>
                          <span className="text-[#0055FF] font-bold">{aw.place}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlights Bullet List */}
                  {item.highlights && (
                    <div className="space-y-1.5 mb-4">
                      {item.highlights.map((hl, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-start gap-2 font-mono text-xs text-[#111116]/85"
                        >
                          <span className="text-[#0055FF] font-black">›</span>
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delegates count pill */}
                  {item.delegates && (
                    <div className="pt-3 border-t border-[#111116]/15 font-mono text-xs text-[#6B6B78]">
                      Delegation size: <strong className="text-[#111116]">{item.delegates.length} student representatives</strong>
                    </div>
                  )}
                </div>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      </div>
    </section>
  );
}

