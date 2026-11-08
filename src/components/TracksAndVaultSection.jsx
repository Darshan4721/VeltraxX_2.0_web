import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../config/eventConfig';
import { 
  Cpu, 
  Layers, 
  Sparkles, 
  Radio, 
  Compass, 
  Download, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  ShieldCheck, 
  BookOpen,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function TracksAndVaultSection() {
  const { tracks = [] } = eventConfig;
  const [expandedTrackId, setExpandedTrackId] = useState(null);
  const [hoveredTrackId, setHoveredTrackId] = useState(null);

  const toggleTrack = (id) => {
    setExpandedTrackId(prev => (prev === id ? null : id));
  };

  const trackIcons = {
    "track-1": Cpu,
    "track-2": Layers,
    "track-3": Sparkles,
    "track-4": Radio,
    "track-5": Compass
  };

  const trackThemeColors = {
    "track-1": {
      accent: "#FFE500",
      tagBg: "bg-[#FFE500]",
      tagText: "text-[#111116]",
      border: "border-[#111116]",
      shadow: "shadow-[6px_6px_0px_0px_#FFE500]",
      hoverShadow: "hover:shadow-[8px_8px_0px_0px_#FFE500]",
      dot: "bg-[#FFE500]"
    },
    "track-2": {
      accent: "#00E5FF",
      tagBg: "bg-[#00E5FF]",
      tagText: "text-[#111116]",
      border: "border-[#111116]",
      shadow: "shadow-[6px_6px_0px_0px_#00E5FF]",
      hoverShadow: "hover:shadow-[8px_8px_0px_0px_#00E5FF]",
      dot: "bg-[#00E5FF]"
    },
    "track-3": {
      accent: "#FF2E93",
      tagBg: "bg-[#FF2E93]",
      tagText: "text-white",
      border: "border-[#111116]",
      shadow: "shadow-[6px_6px_0px_0px_#FF2E93]",
      hoverShadow: "hover:shadow-[8px_8px_0px_0px_#FF2E93]",
      dot: "bg-[#FF2E93]"
    },
    "track-4": {
      accent: "#B6FF00",
      tagBg: "bg-[#B6FF00]",
      tagText: "text-[#111116]",
      border: "border-[#111116]",
      shadow: "shadow-[6px_6px_0px_0px_#B6FF00]",
      hoverShadow: "hover:shadow-[8px_8px_0px_0px_#B6FF00]",
      dot: "bg-[#B6FF00]"
    },
    "track-5": {
      accent: "#0055FF",
      tagBg: "bg-[#0055FF]",
      tagText: "text-white",
      border: "border-[#111116]",
      shadow: "shadow-[6px_6px_0px_0px_#0055FF]",
      hoverShadow: "hover:shadow-[8px_8px_0px_0px_#0055FF]",
      dot: "bg-[#0055FF]"
    }
  };

  return (
    <section id="tracks" className="py-24 bg-[#FBFBFB] text-[#111116] relative overflow-hidden border-b-3 border-[#111116]">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 opacity-15 bg-tech-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>CHAPTER 02 // 5 DOMAINS · 25 PROBLEM STATEMENTS</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
              Choose Your <span className="underline decoration-[#FFE500] decoration-4">Battlefield</span>.
            </h2>

            <p className="text-base sm:text-lg text-[#111116]/80 mt-4 leading-relaxed font-normal">
              Select one of the 5 industrial domains below. Each track features 5 curated problem statements built for both prototype simulation in Round 1 and physical/simulation build during the 24-hour finale.
            </p>
          </div>

          <div className="shrink-0">
            <div className="bg-white border-3 border-[#111116] rounded-xl px-4 py-3 shadow-[4px_4px_0px_0px_#111116] font-mono text-xs font-bold text-[#111116] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse" />
              <span>Evaluated by Academic Tier: Junior UG vs Senior / PG</span>
            </div>
          </div>
        </div>

        {/* 5 Track Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {tracks.map((track, idx) => {
            const Icon = trackIcons[track.id] || Cpu;
            const theme = trackThemeColors[track.id] || trackThemeColors["track-1"];
            const isExpanded = expandedTrackId === track.id;
            const isHovered = hoveredTrackId === track.id;
            const isFeaturedLast = idx === 4;

            return (
              <div
                key={track.id}
                onMouseEnter={() => setHoveredTrackId(track.id)}
                onMouseLeave={() => setHoveredTrackId(null)}
                className={`bg-white rounded-3xl border-3 border-[#111116] p-7 flex flex-col justify-between transition-all duration-300 ${
                  isHovered ? theme.hoverShadow : theme.shadow
                } hover:-translate-y-1.5 hover:-translate-x-0.5 ${
                  isFeaturedLast ? "md:col-span-2 lg:col-span-1" : ""
                } relative overflow-hidden`}
              >
                {/* Vibrant Domain Top Accent Strip */}
                <div 
                  style={{ backgroundColor: theme.accent }}
                  className="absolute top-0 left-0 right-0 h-2.5" 
                />

                <div>
                  {/* Track Header Pill */}
                  <div className="flex items-center justify-between mb-5 mt-1">
                    <span className={`px-3 py-1 rounded-lg font-mono text-xs font-black uppercase border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] ${theme.tagBg} ${theme.tagText}`}>
                      {track.code}
                    </span>
                    <span className="font-mono text-xs font-black text-[#111116] bg-[#F4F4F6] px-2.5 py-1 rounded-md border border-[#111116]/20">
                      {track.problems?.length || 5} Statements
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div 
                      style={{ backgroundColor: theme.accent }}
                      className={`w-12 h-12 rounded-2xl ${theme.tagText} flex items-center justify-center shrink-0 border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#111116] leading-tight">
                        {track.name}
                      </h3>
                      <div className="font-mono text-[11px] font-bold text-[#6B6B78] uppercase mt-0.5">
                        Track {idx + 1} of 5
                      </div>
                    </div>
                  </div>

                  {/* Track Description */}
                  <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-5 font-normal">
                    {track.tagline}
                  </p>

                  {/* Target Audience / Depts */}
                  <div className="mb-5 p-3 rounded-xl bg-[#FAF8F5] border-2 border-[#111116]/15 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#6B6B78]">Target Branches:</span>
                    <span className="font-black text-[#111116] bg-white px-2 py-0.5 rounded border border-[#111116]/20">
                      {track.targetAudience}
                    </span>
                  </div>

                  {/* Collapsible Problems List */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t-2 border-[#111116] space-y-3 animate-in fade-in duration-200">
                      <div className="font-mono text-xs font-black text-[#111116] uppercase tracking-wider flex items-center justify-between">
                        <span>Problem Statements ({track.code}):</span>
                        <span className="text-[10px] text-[#0055FF]">Round 1 + Round 2</span>
                      </div>
                      {track.problems?.map((prob) => (
                        <div 
                          key={prob.code} 
                          className="p-3.5 bg-[#F4F4F6] rounded-xl border-2 border-[#111116] text-left hover:bg-white transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-black text-[#0055FF]">
                              {prob.code}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#111116] font-bold">
                              {prob.focus || "INDUSTRIAL SPEC"}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-[#111116] mb-1">
                            {prob.title}
                          </div>
                          {prob.summary && (
                            <div className="text-[11px] text-[#111116]/75 leading-relaxed font-normal">
                              {prob.summary}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Toggle & Pick Track Buttons */}
                <div className="mt-6 pt-4 border-t-2 border-[#111116]/15 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className="font-mono text-xs font-black text-[#111116] hover:text-[#0055FF] flex items-center gap-1.5 py-1 focus:outline-none cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? "Hide Statements" : "View 5 Statements"}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <Link
                    to={`/register?track=${track.id}`}
                    className="font-mono text-xs font-black bg-[#111116] text-[#FFE500] hover:bg-[#FFE500] hover:text-[#111116] px-3 py-1.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Pick Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            EMBEDDED DOWNLOAD VAULT (3 High-Contrast Action Cards)
           ========================================================================= */}
        <div id="downloads" className="pt-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase mb-3 border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
              <span>OFFICIAL ASSET VAULT</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-[#111116]">
              Download Hackathon Resources
            </h3>
            <p className="text-sm sm:text-base text-[#111116]/80 mt-2 font-normal">
              Everything your team needs to register, draft your PPT blueprint, and prepare for the 24H build.
            </p>
          </div>

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
              <h4 className="text-xl font-black text-[#111116] mb-2 group-hover:text-[#0055FF] transition-colors">
                Problem Statements Book
              </h4>
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
            <a
              href="/downloads/VELTRAXX_2.0_Round1_Template.pptx"
              download
              className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#00E5FF] p-7 hover:-translate-y-1.5 hover:shadow-[8px_8px_0px_0px_#00E5FF] transition-all group block select-none"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#00E5FF] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-black bg-[#111116] text-[#00E5FF] px-2.5 py-1 rounded-lg border border-[#111116]">
                  PPTX · 6 SLIDES
                </span>
              </div>
              <h4 className="text-xl font-black text-[#111116] mb-2 group-hover:text-[#0055FF] transition-colors">
                Official PPT Pitch Template
              </h4>
              <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
                Mandatory 6-slide SIH-style presentation format with pre-styled slides for Title, Problem, Block Diagram, Hardware Stack, Execution, and Expected Output.
              </p>
              <div className="pt-4 border-t-2 border-[#111116]/10 flex items-center justify-between font-mono text-xs font-black text-[#111116]">
                <span className="flex items-center gap-1.5 text-[#0055FF]">
                  <Download className="w-4 h-4" />
                  <span>Download Template (.PPTX)</span>
                </span>
                <span className="text-[#111116]/50">2.8 MB</span>
              </div>
            </a>

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
              <h4 className="text-xl font-black text-[#111116] mb-2 group-hover:text-[#0055FF] transition-colors">
                Official Rulebook & Guide
              </h4>
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

      </div>
    </section>
  );
}