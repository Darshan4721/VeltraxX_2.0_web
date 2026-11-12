// src/components/about/AboutMagazineVault.jsx
// S10: Departmental Magazine Vault, 51-Page PDF & Builder Voices
// High-visibility download station + 9 authentic student builder voices

import React from 'react';
import { Download, FileText, Sparkles, BookOpen, ExternalLink, Quote } from 'lucide-react';
import { magazineVaultData, builderQuotesData } from '../../data/aboutData';
import { smoothScrollTo } from '../ScrollManager';
import Tilt3DCard from './Tilt3DCard';

export default function AboutMagazineVault({ onOpenGallery }) {
  const { title, edition, pages, fileSize, downloadUrl, fileName, editorialBoard } =
    magazineVaultData;

  return (
    <section
      id="magazine-vault"
      className="relative w-full py-20 bg-[#F4F4F6] text-[#111116] border-b-3 border-[#111116] overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_#FFE500]">
            <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
            <span>CHAPTER 09 // DEPARTMENT PUBLICATION VAULT</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-[#111116] tracking-tight uppercase">
            51-PAGE DIGITAL MAGAZINE <span className="text-[#0055FF]">&amp;</span> BUILDER VOICES
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#111116]/80 max-w-2xl mt-2 font-medium">
            Download the complete 2026-2027 Department Magazine detailing student chip designs, conference achievements, and laboratory milestones.
          </p>
        </div>

        {/* Immersive Magazine Download Station */}
        <div className="rounded-3xl bg-[#0D0D11] text-white p-7 sm:p-10 border-3 border-[#111116] shadow-[8px_8px_0px_#FFE500] mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Magazine Cover & Quick Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <Tilt3DCard maxTilt={5} scale={1.02} translateZ={24} className="w-full max-w-xs">
                <div className="rounded-2xl bg-white p-3 border-3 border-[#111116] shadow-[6px_6px_0px_#FF2E93] text-[#111116]">
                  <img
                    src="/images/about/magazine_cover.webp"
                    alt="The Young Mind's Magazine"
                    width="800"
                    height="1200"
                    className="w-full h-auto rounded-xl border border-[#111116]/20 object-cover"
                    loading="lazy"
                  />
                  <div className="mt-3 flex items-center justify-between font-mono text-xs font-bold">
                    <span>51 PAGES • HIGH-RES</span>
                    <button
                      type="button"
                      onClick={() => onOpenGallery && onOpenGallery(0)}
                      className="px-2 py-0.5 rounded bg-[#FFE500] text-[#111116] text-[10px] font-black uppercase"
                    >
                      PREVIEW
                    </button>
                  </div>
                </div>
              </Tilt3DCard>
            </div>

            {/* Right Column: Metadata & Download Triggers */}
            <div className="lg:col-span-7">
              <span className="inline-block px-3 py-1 rounded-md bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase mb-3">
                OFFICIAL DEPARTMENT ARCHIVE
              </span>

              <h3 className="font-sans font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mb-2">
                {title}
              </h3>

              <div className="font-mono text-xs text-[#00E5FF] font-bold mb-4">
                {edition} • Department of EE (VLSI Design and Technology)
              </div>

              <p className="font-sans text-xs sm:text-sm text-white/80 font-medium leading-relaxed mb-6">
                Published annually by student editors and faculty mentors, this 51-page compendium contains complete verified records of undergraduate silicon prototypes, national conference delegations, sports trophies, and the 24-hour VELTRAXX hackathon.
              </p>

              {/* Editorial Board Summary */}
              <div className="p-4 rounded-2xl bg-[#161622] border border-white/20 mb-8 font-mono text-xs">
                <div className="font-bold text-[#FFE500] uppercase mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Student Editorial Roster:</span>
                </div>
                <div className="text-white/80">
                  <strong className="text-white">Editorial Heads:</strong> {editorialBoard.heads.join(', ')}
                </div>
                <div className="text-white/70 mt-1">
                  <strong className="text-white">Technical Team:</strong> {editorialBoard.technical.join(', ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-[#FFE500] text-[#111116] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_#FFFFFF] hover:bg-white hover:shadow-[2px_2px_0px_#FFFFFF] transition-all"
                >
                  <Download className="w-4 h-4 text-[#111116]" />
                  <span>Download Full PDF ({fileSize})</span>
                </a>

                <a
                  href="#silicon-research"
                  onClick={(e) => smoothScrollTo('silicon-research', e)}
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-xl bg-[#161622] text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border border-white/30 hover:border-white transition-colors"
                >
                  <span>17 Silicon Compendium</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 9 Authentic Student Builder Voices */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93]" />
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#111116]">
              AUTHENTIC VOICES // 9 STUDENT BUILDERS FROM THE MAGAZINE
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builderQuotesData.map((quote, idx) => (
              <Tilt3DCard
                key={idx}
                maxTilt={6}
                scale={1.02}
                translateZ={18}
                className="h-full"
              >
                <div className="h-full rounded-3xl bg-white p-6 sm:p-7 border-3 border-[#111116] shadow-[5px_5px_0px_#111116] flex flex-col justify-between hover:shadow-[7px_7px_0px_#111116] transition-all">
                  <div>
                    {/* Top Accent Strip */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="px-2.5 py-0.5 rounded font-mono text-[11px] font-black uppercase border border-[#111116]"
                        style={{
                          backgroundColor: quote.color,
                          color: quote.color === '#0055FF' ? '#FFFFFF' : '#111116',
                        }}
                      >
                        {quote.role}
                      </span>
                      <Quote className="w-4 h-4 text-[#6B6B78]" />
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#111116]/90 font-medium leading-relaxed italic mb-6">
                      &ldquo;{quote.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-[#111116]/10 flex items-center justify-between font-mono text-xs">
                    <span className="font-black text-[#111116]">{quote.author}</span>
                    <span className="text-[#6B6B78] font-bold">{quote.year} Undergrad</span>
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

