import React from 'react';
import { BookOpen, Layers, ShieldCheck, Download } from 'lucide-react';

export default function DownloadVault() {
  return (
    <section id="downloads" className="py-24 bg-[#FAF8F5] text-[#111116] relative overflow-hidden border-b-3 border-[#111116]">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-15 bg-tech-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
            <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
            <span>OFFICIAL ASSET VAULT // ROUND 1 BLUEPRINTS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
            Download Hackathon <span className="underline decoration-[#00E5FF] decoration-4">Resources</span>.
          </h2>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-4 leading-relaxed font-normal max-w-3xl">
            Everything your team needs to register, draft your PPT blueprint, and prepare for the 24H build. All assets are free and open-access.
          </p>
        </div>

        {/* 3 High-Contrast Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Vault Card 1: Problem Statements Book (PDF) - Acid Yellow Shadow */}
          <a
            href="/downloads/VELTRAXX_2.0_Problem_Statements.pdf"
            download
            className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#FFE500] p-7 hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_0px_#FFE500] transition-all group block select-none"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black bg-[#111116] text-[#FFE500] px-2.5 py-1 rounded-lg border border-[#111116]">
                PDF · 25 PROBLEMS
              </span>
            </div>
            <h3 className="text-xl font-black text-[#111116] mb-2 group-hover:text-[#0055FF] transition-colors">
              Problem Statements Book
            </h3>
            <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
              Complete compendium of all 25 problem statements across 5 tracks, including input specifications, technical constraints, and evaluation rubrics.
            </p>
            <div className="pt-4 border-t-2 border-[#111116]/10 flex items-center justify-between font-mono text-xs font-black text-[#111116]">
              <span className="flex items-center gap-1.5 text-[#0055FF]">
                <Download className="w-4 h-4" />
                <span>Download Book (.PDF)</span>
              </span>
              <span className="text-[#111116]/50">1.4 MB</span>
            </div>
          </a>

          {/* Vault Card 2: Official 6-Slide PPT Template (.PPTX) - Electric Cyan Shadow */}
          <div className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#00E5FF] p-7 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#00E5FF] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black bg-[#111116] text-[#00E5FF] px-2.5 py-1 rounded-lg border border-[#111116]">
                  PPTX · 6 SLIDES
                </span>
              </div>
              <h3 className="text-xl font-black text-[#111116] mb-2">
                Official PPT Pitch Decks
              </h3>
              <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
                Mandatory 6-slide SIH-style presentation format with pre-styled slides for Title, Problem, Block Diagram, Hardware Stack, Execution, and Expected Output.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-[#111116]/10 space-y-2.5">
              <a
                href="/downloads/VELTRAXX_2.0_Round1_Template.pptx"
                download
                className="w-full py-2.5 px-3.5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#111116] rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-between font-mono text-xs font-black transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Blank Template (.PPTX)</span>
                </span>
                <span className="text-[11px] opacity-75">244 KB</span>
              </a>

              <a
                href="/downloads/VELTRAXX_2.0_Round1_Reference_Example.pptx"
                download
                className="w-full py-2.5 px-3.5 bg-white hover:bg-[#FF2E93]/10 text-[#111116] hover:text-[#FF2E93] rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#FF2E93] flex items-center justify-between font-mono text-xs font-black transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>Sample Reference Deck (.PPTX)</span>
                </span>
                <span className="text-[11px] opacity-75">283 KB</span>
              </a>
            </div>
          </div>

          {/* Vault Card 3: Complete Hackathon Rulebook & Brochure (PDF) - Hot Pink Shadow */}
          <a
            href="/downloads/VELTRAXX_2.0_Rulebook.pdf"
            download
            className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#FF2E93] p-7 hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_0px_#FF2E93] transition-all group block select-none"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF2E93] text-white flex items-center justify-center font-black border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-black bg-[#111116] text-[#FF2E93] px-2.5 py-1 rounded-lg border border-[#111116]">
                PDF · OFFICIAL GUIDE
              </span>
            </div>
            <h3 className="text-xl font-black text-[#111116] mb-2 group-hover:text-[#0055FF] transition-colors">
              Official Rulebook & Guide
            </h3>
            <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
              Comprehensive guidelines covering team composition, academic tier fairness rules, the 50/50 live twist grading rubric, and campus logistics at SIET.
            </p>
            <div className="pt-4 border-t-2 border-[#111116]/10 flex items-center justify-between font-mono text-xs font-black text-[#111116]">
              <span className="flex items-center gap-1.5 text-[#0055FF]">
                <Download className="w-4 h-4" />
                <span>Download Rulebook (.PDF)</span>
              </span>
              <span className="text-[#111116]/50">920 KB</span>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
}
