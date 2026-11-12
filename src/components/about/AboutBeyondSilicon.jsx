// src/components/about/AboutBeyondSilicon.jsx
// S9: Holistic Excellence Beyond Silicon (Sports, NCC, Cultural & Clubs)
// High-voltage FULL-BLEED SOLID COLOR Bento Cards matching the Home Page aesthetic

import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Palette, Users, Award, Star, ExternalLink, X, Download } from 'lucide-react';
import { beyondSiliconData } from '../../data/aboutData';
import Tilt3DCard from './Tilt3DCard';

/**
 * Unclipped archival magazine poster frame with a dedicated chrome header bar
 * so labels and actions never overlap magazine artwork or athlete text.
 */
function PosterShowcaseFrame({
  image,
  alt,
  width = 800,
  height = 1132,
  badge,
  badgeClassName = 'text-white',
  frameBorderClassName = 'border-[#111116]',
  heightClassName = 'h-80 sm:h-[22rem]',
  onOpen,
}) {
  return (
    <div
      onClick={onOpen}
      className={`flex flex-col mb-5 rounded-2xl overflow-hidden border-2 ${frameBorderClassName} shadow-[3px_3px_0px_#111116] ${heightClassName} bg-[#0D0D11] group cursor-pointer`}
    >
      {/* Dedicated Top Chrome Bar */}
      <div className="px-3 py-2 bg-[#161622] border-b border-white/15 flex items-center justify-between gap-2.5 shrink-0">
        <span
          className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-snug ${badgeClassName}`}
        >
          {badge}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          aria-label={`View full poster for ${alt}`}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFE500] text-[#111116] font-mono text-[10px] font-black uppercase border border-[#111116] shadow-[2px_2px_0px_#111116] hover:bg-white transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Full Page</span>
        </button>
      </div>

      {/* Unobstructed Portrait / Landscape Poster Stage */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-2.5 sm:p-3 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#181824] via-[#0D0D11] to-[#0A0A0E] opacity-80 pointer-events-none" />
        <img
          src={image}
          alt={alt}
          width={width}
          height={height}
          className="relative z-10 max-h-full w-auto max-w-full object-contain rounded-lg drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function AboutBeyondSilicon() {
  const [activeTab, setActiveTab] = useState('sports');
  const [activePosterModal, setActivePosterModal] = useState(null);
  const { sports, ncc, cultural, clubs } = beyondSiliconData;

  // Escape key listener & body scroll lock for self-contained poster modal
  useEffect(() => {
    if (!activePosterModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActivePosterModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activePosterModal]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="flex-1 flex flex-col">
                    {/* Photo or Styled Sports Podium Banner */}
                    {athlete.image ? (
                      <PosterShowcaseFrame
                        image={athlete.image}
                        alt={`${athlete.name} - ${athlete.sport}`}
                        badge={athlete.sport}
                        onOpen={() =>
                          setActivePosterModal({
                            image: athlete.image,
                            title: athlete.name,
                            category: athlete.sport,
                            subtitle: athlete.medals,
                            desc: athlete.quote || athlete.highlights?.[0] || '',
                          })
                        }
                      />
                    ) : (
                      <div className="flex flex-col mb-5 rounded-2xl overflow-hidden border-2 border-[#111116] shadow-[3px_3px_0px_#111116] h-80 sm:h-[22rem] bg-[#0D0D11] text-white select-none">
                        {/* Matching Top Chrome Bar */}
                        <div className="px-3 py-2 bg-[#161622] border-b border-white/15 flex items-center justify-between gap-2.5 shrink-0">
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-snug text-white">
                            {athlete.sport}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/40">
                            {athlete.badge || 'PODIUM FINISHER'}
                          </span>
                        </div>

                        {/* Inner Podium Stage */}
                        <div className="relative flex-1 min-h-0 p-5 sm:p-6 flex flex-col justify-between">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#181824] via-[#0D0D11] to-[#0A0A0E] opacity-80 pointer-events-none" />

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black border border-[#111116] shadow-[2px_2px_0px_#111116]">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                              OFFLINE ARCHIVE
                            </span>
                          </div>

                          <div className="relative z-10 my-auto py-2">
                            <div className="font-mono text-[10px] text-white/65 uppercase tracking-widest mb-1">
                              {athlete.event || `${athlete.sport} Championship`}
                            </div>
                            <div className="font-sans font-black text-xl sm:text-2xl text-white uppercase leading-tight tracking-tight mb-1.5">
                              {athlete.tournament || athlete.medals || 'Anna University Sports Board'}
                            </div>
                            <div className="font-mono text-xs text-[#00E5FF] font-bold leading-snug">
                              {athlete.venue || athlete.details || 'Department of EE - VDT'}
                            </div>
                          </div>

                          <div className="relative z-10 px-2.5 py-1 rounded bg-[#111116] text-[#B6FF00] font-mono text-[11px] font-bold self-start border border-[#B6FF00]/40 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF00]" />
                            <span>{athlete.year} Zonal Record</span>
                          </div>
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
                  <PosterShowcaseFrame
                    image={ncc.image}
                    alt="Department NCC Cadets"
                    width={800}
                    height={1200}
                    badge={ncc.unit}
                    badgeClassName="text-[#B6FF00]"
                    frameBorderClassName="border-white/25"
                    heightClassName="h-96 sm:h-[26rem]"
                    onOpen={() =>
                      setActivePosterModal({
                        image: ncc.image,
                        title: 'Department NCC Cadets',
                        category: 'National Cadet Corps (NCC)',
                        subtitle: ncc.unit,
                        desc: 'Department cadets selected for prestigious national camps including Republic Day Parade (RDC) and Army Attachment training with 4/8 Gorkha Rifles.',
                      })
                    }
                  />
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
                  <PosterShowcaseFrame
                    image={cultural.danceCrew.image}
                    alt={cultural.danceCrew.name}
                    width={800}
                    height={1157}
                    badge={`Members: ${cultural.danceCrew.members}`}
                    heightClassName="h-96 sm:h-[26rem]"
                    onOpen={() =>
                      setActivePosterModal({
                        image: cultural.danceCrew.image,
                        title: cultural.danceCrew.name,
                        category: 'Collegiate Dance Duo',
                        subtitle: `Members: ${cultural.danceCrew.members}`,
                        desc: cultural.danceCrew.quote,
                      })
                    }
                  />

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
                  <PosterShowcaseFrame
                    image={cultural.artCorner.image}
                    alt={cultural.artCorner.title}
                    width={800}
                    height={1200}
                    badge="Student Creative Portfolio"
                    badgeClassName="text-[#FFE500]"
                    heightClassName="h-96 sm:h-[26rem]"
                    onOpen={() =>
                      setActivePosterModal({
                        image: cultural.artCorner.image,
                        title: cultural.artCorner.title,
                        category: 'Visual Arts Showcase',
                        subtitle: 'Student Creative Portfolio',
                        desc: 'Curated gallery of department student pencil sketches, ink drawings, and canvas artworks.',
                      })
                    }
                  />

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

      {/* Self-Contained Neo-Brutalist Lightbox Modal */}
      {activePosterModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activePosterModal.title} Poster Lightbox`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D0D11]/95 backdrop-blur-md"
          onClick={() => setActivePosterModal(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-[#161622] p-5 sm:p-6 border-3 border-[#FFE500] shadow-[10px_10px_0px_#111116] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/20">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-[#FFE500] text-[#111116] font-mono text-[11px] font-black uppercase inline-block mb-1">
                  {activePosterModal.category}
                </span>
                <h3 className="font-sans font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                  {activePosterModal.title}
                </h3>
                {activePosterModal.subtitle && (
                  <p className="font-mono text-xs text-[#00E5FF] font-semibold">
                    {activePosterModal.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActivePosterModal(null)}
                aria-label="Close poster view"
                className="w-9 h-9 rounded-xl bg-white text-[#111116] border-2 border-[#111116] flex items-center justify-center hover:bg-[#FF2E93] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Central Poster Viewport */}
            <div className="relative flex-1 min-h-[300px] max-h-[64vh] flex items-center justify-center overflow-hidden rounded-2xl bg-[#0D0D11] border-2 border-white/20 p-2">
              <img
                src={activePosterModal.image}
                alt={activePosterModal.title}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl drop-shadow-2xl"
              />
            </div>

            {/* Bottom Details Bar */}
            <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              {activePosterModal.desc ? (
                <p className="font-sans text-xs sm:text-sm text-white/70 font-medium max-w-xl">
                  {activePosterModal.desc}
                </p>
              ) : (
                <span className="font-mono text-xs text-white/50 uppercase">
                  Department of EE - VDT Verified Archive
                </span>
              )}
              <a
                href={activePosterModal.image}
                download
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-xs font-bold border border-white/30 hover:border-[#FFE500] hover:bg-white hover:text-[#111116] transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

