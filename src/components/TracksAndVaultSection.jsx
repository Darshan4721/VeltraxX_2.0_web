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

  const trackMeta = {
    "track_01": {
      icon: Cpu,
      accent: "#FFE500",
      tagBg: "bg-[#FFE500]",
      tagText: "text-[#111116]",
      shadow: "shadow-[8px_8px_0px_0px_#FFE500]",
      hoverShadow: "hover:shadow-[12px_12px_0px_0px_#FFE500]",
      branches: "ECE · EEE · VLSI · Microelectronics",
      badge: "CORE SILICON",
      hoverBtnBg: "hover:bg-[#FFE500] hover:text-[#111116]"
    },
    "track_02": {
      icon: Layers,
      accent: "#00E5FF",
      tagBg: "bg-[#00E5FF]",
      tagText: "text-[#111116]",
      shadow: "shadow-[8px_8px_0px_0px_#00E5FF]",
      hoverShadow: "hover:shadow-[12px_12px_0px_0px_#00E5FF]",
      branches: "ECE · EIE · Embedded Systems · Mechatronics",
      badge: "RECONFIGURABLE",
      hoverBtnBg: "hover:bg-[#00E5FF] hover:text-[#111116]"
    },
    "track_03": {
      icon: Sparkles,
      accent: "#FF2E93",
      tagBg: "bg-[#FF2E93]",
      tagText: "text-white",
      shadow: "shadow-[8px_8px_0px_0px_#FF2E93]",
      hoverShadow: "hover:shadow-[12px_12px_0px_0px_#FF2E93]",
      branches: "CSE · AI & Data Science · IT · Robotics",
      badge: "TINYML & CV",
      hoverBtnBg: "hover:bg-[#FF2E93] hover:text-white"
    },
    "track_04": {
      icon: Radio,
      accent: "#B6FF00",
      tagBg: "bg-[#B6FF00]",
      tagText: "text-[#111116]",
      shadow: "shadow-[8px_8px_0px_0px_#B6FF00]",
      hoverShadow: "hover:shadow-[12px_12px_0px_0px_#B6FF00]",
      branches: "EEE · ECE · Mech · IoT · Bio-Medical",
      badge: "CYBER-PHYSICAL",
      hoverBtnBg: "hover:bg-[#B6FF00] hover:text-[#111116]"
    },
    "track_05": {
      icon: Compass,
      accent: "#7B2FFF",
      tagBg: "bg-[#7B2FFF]",
      tagText: "text-white",
      shadow: "shadow-[8px_8px_0px_0px_#7B2FFF]",
      hoverShadow: "hover:shadow-[12px_12px_0px_0px_#7B2FFF]",
      branches: "All Engineering Branches (Multidisciplinary)",
      badge: "OPEN CHALLENGE",
      hoverBtnBg: "hover:bg-[#7B2FFF] hover:text-white"
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

        {/* 5 Track Bento Grid (3 Top, 2 Wide Bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-20">
          {tracks.map((track, idx) => {
            const meta = trackMeta[track.id] || trackMeta["track_01"];
            const Icon = meta.icon;
            const isExpanded = expandedTrackId === track.id;
            const isHovered = hoveredTrackId === track.id;
            // 3-col on row 1 (4 cols each), 2-col on row 2 (6 cols each)
            const colSpan = idx < 3 ? "lg:col-span-4" : "lg:col-span-6";

            return (
              <div
                key={track.id}
                onMouseEnter={() => setHoveredTrackId(track.id)}
                onMouseLeave={() => setHoveredTrackId(null)}
                className={`bg-white rounded-3xl border-3 border-[#111116] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isHovered ? meta.hoverShadow : meta.shadow
                } hover:-translate-y-1.5 hover:-translate-x-1 ${colSpan} relative`}
              >
                <div>
                  {/* Track Header Badges (Wrapping Flex Row with Zero Overlap) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black uppercase border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] ${meta.tagBg} ${meta.tagText} whitespace-nowrap`}>
                        {track.code}
                      </span>
                      {meta.badge && (
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-[#111116] text-[#FFE500] px-2.5 py-1 rounded-md border border-[#111116] whitespace-nowrap">
                          {meta.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-black text-[#111116] bg-[#F4F4F6] px-2.5 py-1 rounded-md border border-[#111116]/20 whitespace-nowrap">
                      5 Statements
                    </span>
                  </div>

                  {/* Icon & Title Row */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div 
                      style={{ backgroundColor: meta.accent }}
                      className={`w-13 h-13 rounded-2xl ${meta.tagText} flex items-center justify-center shrink-0 border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-[#111116] leading-tight tracking-tight uppercase">
                        {track.name}
                      </h3>
                      <div className="font-mono text-xs font-bold text-[#6B6B78] uppercase mt-1 tracking-wider truncate">
                        {track.domain}
                      </div>
                    </div>
                  </div>

                  {/* Track Description */}
                  <p className="text-xs sm:text-sm text-[#111116]/85 font-medium leading-relaxed mb-5">
                    {track.description}
                  </p>

                  {/* Target Disciplines Specification Box */}
                  <div className="mb-5 p-3.5 rounded-2xl bg-[#FAF8F5] border-2 border-[#111116]/20 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-mono text-[11px] font-black uppercase text-[#6B6B78]">
                      <span>Target Disciplines</span>
                      <span className="text-[#111116] font-bold">Open to All Years</span>
                    </div>
                    <div className="font-mono text-xs font-black text-[#111116] flex items-center gap-2 flex-wrap">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.accent }} />
                      <span>{meta.branches}</span>
                    </div>
                  </div>

                  {/* Collapsible Problems List */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t-2 border-[#111116] space-y-3 animate-in fade-in duration-200">
                      <div className="font-mono text-xs font-black text-[#111116] uppercase tracking-wider flex items-center justify-between">
                        <span>Problem Statements ({track.code}):</span>
                        <span className="text-[10px] text-[#0055FF] font-bold">Round 1 Blueprint + R2 Build</span>
                      </div>
                      {track.problems?.map((prob) => (
                        <div 
                          key={prob.code} 
                          className="p-3.5 bg-[#F4F4F6] rounded-xl border-2 border-[#111116] text-left hover:bg-white transition-colors shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-[#0055FF] bg-white px-2 py-0.5 rounded border border-[#111116]/20">
                              {prob.code}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111116] text-[#FFE500] font-black uppercase">
                              Industrial Spec
                            </span>
                          </div>
                          <div className="font-black text-xs text-[#111116] leading-snug">
                            {prob.title}
                          </div>
                          {prob.challenge && (
                            <div className="text-[11px] text-[#111116]/80 leading-relaxed font-medium">
                              {prob.challenge}
                            </div>
                          )}
                          {(prob.tierA || prob.tierB) && (
                            <div className="pt-2 border-t border-[#111116]/10 flex flex-col gap-1 text-[10px] font-mono">
                              {prob.tierA && (
                                <div className="text-[#111116]/80">
                                  <strong className="text-[#0055FF] uppercase font-black">Tier A (Jr UG):</strong> {prob.tierA}
                                </div>
                              )}
                              {prob.tierB && (
                                <div className="text-[#111116]/80">
                                  <strong className="text-[#111116] uppercase font-black">Tier B (Sr UG/PG):</strong> {prob.tierB}
                                </div>
                              )}
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
                    className={`font-mono text-xs font-black bg-[#111116] text-[#FFE500] ${meta.hoverBtnBg} px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 shrink-0`}
                  >
                    <span>Pick Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}