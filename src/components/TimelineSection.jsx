import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { eventConfig } from '../config/eventConfig';
import gsap from 'gsap';
import { 
  Clock, 
  Flame, 
  Award, 
  Users, 
  Calendar, 
  Coffee, 
  Play, 
  Send, 
  Sparkles, 
  Zap, 
  Flag,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function TimelineSection() {
  const { roadmapTimeline = [], finaleSchedule = [] } = eventConfig;
  const [activeTab, setActiveTab] = useState('ROADMAP'); // 'ROADMAP' (Master Roadmap) as default view
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [reachedIndices, setReachedIndices] = useState(new Set());

  const containerRef = useRef(null);
  const lineFillRef = useRef(null);
  const nodeRefs = useRef([]);
  const timelineCardsRef = useRef(null);
  const rafIdRef = useRef(null);
  const prevReachedStrRef = useRef('');

  // Smooth GSAP Stagger Entrance on Tab or Filter Change
  useEffect(() => {
    if (timelineCardsRef.current) {
      const cards = timelineCardsRef.current.querySelectorAll('.timeline-event-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: "power2.out" }
        );
      }
    }
  }, [activeTab, selectedDay]);

  const displayedFinaleEvents = selectedDay === 'ALL'
    ? finaleSchedule
    : selectedDay === 'DAY1'
      ? finaleSchedule.filter(item => item.time.includes('15 Dec'))
      : finaleSchedule.filter(item => item.time.includes('16 Dec'));

  // Ensure nodeRefs array matches displayed events length
  nodeRefs.current = nodeRefs.current.slice(0, displayedFinaleEvents.length);

  /**
   * Real-time 60fps/120fps continuous scroll tracking.
   * Progress:
   * - Start: top of timeline container reaches 60% viewport height
   * - End: bottom of timeline container reaches 40% viewport height
   * - Clamped: 0.0 to 1.0
   * - Direct GPU transform: scaleY(progress) with zero CSS transition delays.
   * - Milestone nodes switch to reached when the line tip crosses vertical center.
   */
  const updateScrollProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;

    // Start when top reaches 60% viewport height; End when bottom reaches 40% viewport height
    const totalTravel = rect.height + vh * 0.2;
    const currentTravel = (vh * 0.6) - rect.top;
    const rawProgress = totalTravel > 0 ? currentTravel / totalTravel : 0;
    const progress = Math.min(1, Math.max(0, rawProgress));

    // Update vertical line transform in real-time with zero delay or snapping
    if (lineFillRef.current) {
      lineFillRef.current.style.transform = `scaleY(${progress})`;
    }

    // Line tip position on screen in viewport coordinates
    const lineTipY = rect.top + (rect.height * progress);

    // Identify which nodes have been reached
    const newlyReached = new Set();
    nodeRefs.current.forEach((nodeEl, idx) => {
      if (nodeEl) {
        const nodeRect = nodeEl.getBoundingClientRect();
        const nodeCenterY = nodeRect.top + (nodeRect.height / 2);
        if (lineTipY >= nodeCenterY) {
          newlyReached.add(idx);
        }
      }
    });

    const newKey = Array.from(newlyReached).sort((a, b) => a - b).join(',');
    if (newKey !== prevReachedStrRef.current) {
      prevReachedStrRef.current = newKey;
      setReachedIndices(newlyReached);
    }
  }, []);

  // RequestAnimationFrame scroll listener for locked 1:1 hardware performance
  useEffect(() => {
    if (activeTab !== 'FINALE') return;

    const onScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Initial run
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [activeTab, selectedDay, updateScrollProgress]);

  // Recalculate when tab or day changes
  useLayoutEffect(() => {
    if (activeTab === 'FINALE') {
      prevReachedStrRef.current = '';
      updateScrollProgress();
    }
  }, [activeTab, selectedDay, updateScrollProgress]);

  return (
    <section id="timeline" className="py-24 bg-[#F4F4F6] relative border-b-2 border-[#111116] overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-tech-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/30 shadow-[2px_2px_0px_0px_#FFE500]">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>CHAPTER 04 // 24-HOUR ARENA & MASTER SCHEDULE</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
              24 Hours Non-Stop. <br />
              <span className="text-[#0055FF]">Rigorous Engineering Milestones</span>.
            </h2>
            
            <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed font-normal">
              Central vertical execution rail. From the 08:30 AM check-in on Dec 15 to the final 24H build demo and direct internship appointments on Dec 16.
            </p>
          </div>

          {/* Dual-Mode Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] shrink-0">
            <button
              onClick={() => setActiveTab('ROADMAP')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ROADMAP'
                  ? 'bg-[#FFE500] text-[#111116] shadow-sm'
                  : 'text-[#111116] hover:bg-[#FFE500]/20'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Master Roadmap (Nov - Dec 16)</span>
            </button>

            <button
              onClick={() => setActiveTab('FINALE')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FINALE'
                  ? 'bg-[#111116] text-[#FFE500] shadow-sm'
                  : 'text-[#111116] hover:bg-[#111116]/10'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>24H Finale Schedule (Dec 15-16)</span>
            </button>
          </div>
        </div>

        {/* Tab B: 24H Finale Vertical Animated Rail */}
        {activeTab === 'FINALE' && (
          <div>
            {/* Day Filter Pills */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <div className="inline-flex items-center gap-1.5 bg-white p-1.5 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116]">
                <button
                  onClick={() => setSelectedDay('ALL')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                    selectedDay === 'ALL'
                      ? 'bg-[#111116] text-white'
                      : 'text-[#111116] hover:bg-black/5'
                  }`}
                >
                  ALL 24H ({finaleSchedule.length})
                </button>
                <button
                  onClick={() => setSelectedDay('DAY1')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                    selectedDay === 'DAY1'
                      ? 'bg-[#FFE500] text-[#111116]'
                      : 'text-[#111116] hover:bg-[#FFE500]/20'
                  }`}
                >
                  DAY 1 (15 DEC)
                </button>
                <button
                  onClick={() => setSelectedDay('DAY2')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                    selectedDay === 'DAY2'
                      ? 'bg-[#FF2E93] text-[#111116]'
                      : 'text-[#111116] hover:bg-[#FF2E93]/20'
                  }`}
                >
                  DAY 2 (16 DEC)
                </button>
              </div>
            </div>

            {/* Central Vertical Rail Container with Real-Time Continuous Scroll-Filling Gradient */}
            <div ref={containerRef} className="relative max-w-5xl mx-auto">
              
              {/* Vertical Rail: Central on Desktop (left-1/2), Left-aligned on Mobile (left-6) */}
              <div className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-1/2 w-1.5 bg-[#111116]/15 rounded-full overflow-hidden">
                {/* 1:1 Continuous Hardware-Accelerated Progress Line (Zero CSS Transition Delay) */}
                <div 
                  ref={lineFillRef}
                  style={{ 
                    transform: 'scaleY(0)', 
                    transformOrigin: 'top' 
                  }}
                  className="w-full h-full bg-gradient-to-b from-[#FFE500] via-[#FF2E93] to-[#0055FF] rounded-full will-change-transform"
                />
              </div>

              {/* Milestone Event Cards */}
              <div ref={timelineCardsRef} className="space-y-8 sm:space-y-12">
                {displayedFinaleEvents.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const isKey = item.isPrimary;
                  const isAudit = item.badge?.includes('AUDIT');
                  const isReached = reachedIndices.has(idx);

                  return (
                    <div 
                      key={`finale-event-${idx}-${item.time}`}
                      className={`timeline-event-card relative flex flex-col md:flex-row items-start md:items-center ${
                        isEven ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Central Node Badge (Tracked by nodeRefs) */}
                      <div 
                        ref={(el) => (nodeRefs.current[idx] = el)}
                        className="absolute left-6 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
                      >
                        <div 
                          className={`w-10 h-10 rounded-full border-3 transition-all duration-200 flex items-center justify-center select-none ${
                            isReached
                              ? isKey
                                ? 'bg-[#FFE500] border-[#111116] scale-115 shadow-[3px_3px_0px_0px_#111116] ring-4 ring-[#FFE500]/40'
                                : isAudit
                                  ? 'bg-[#00E5FF] border-[#111116] scale-115 shadow-[3px_3px_0px_0px_#111116] ring-4 ring-[#00E5FF]/40'
                                  : 'bg-[#B6FF00] border-[#111116] scale-110 shadow-[2px_2px_0px_0px_#111116]'
                              : 'bg-white border-[#111116]/30 scale-95 shadow-none'
                          }`}
                        >
                          <span className={`font-mono text-xs font-black ${
                            isReached ? 'text-[#111116]' : 'text-[#111116]/40'
                          }`}>
                            {idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Card Content (Alternating on Desktop) */}
                      <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                        isEven ? 'md:pr-14 md:text-right' : 'md:pl-14 md:text-left'
                      }`}>
                        <div className={`p-6 rounded-3xl border-3 transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] ${
                          isReached
                            ? isKey
                              ? 'bg-[#FFE500] text-[#111116] border-[#111116] shadow-[6px_6px_0px_0px_#111116]'
                              : isAudit
                                ? 'bg-white border-[#111116] shadow-[5px_5px_0px_0px_#00E5FF]'
                                : 'bg-white border-[#111116] shadow-[5px_5px_0px_0px_#B6FF00]'
                            : 'bg-white/80 border-[#111116]/40 shadow-[3px_3px_0px_0px_#111116]/20 opacity-80'
                        }`}>
                          
                          {/* Tags Row */}
                          <div className={`flex flex-wrap items-center gap-2 mb-3 ${
                            isEven ? 'md:justify-end' : 'md:justify-start'
                          }`}>
                            <span className="font-mono text-xs font-black bg-[#111116] text-[#FFE500] px-2.5 py-1 rounded-lg border border-[#111116]">
                              {item.time}
                            </span>

                            {isKey && (
                              <span className="font-mono text-xs font-black bg-[#FF2E93] text-white px-2.5 py-1 rounded-lg border border-[#111116] flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5 fill-current text-[#FFE500]" />
                                <span>KEY MILESTONE</span>
                              </span>
                            )}

                            <span className="font-mono text-[11px] font-bold bg-white text-[#111116] px-2 py-0.5 rounded border border-[#111116]/20 uppercase">
                              {item.badge}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl font-black text-[#111116] tracking-tight leading-snug mb-2">
                            {item.title}
                          </h3>

                          {/* Time detail */}
                          <div className={`font-mono text-xs font-bold text-[#111116]/70 flex items-center gap-1.5 ${
                            isEven ? 'md:justify-end' : 'md:justify-start'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>SIET Coimbatore Tech Park Arena</span>
                          </div>

                        </div>
                      </div>

                      {/* Spacer for opposite side */}
                      <div className="hidden md:block w-1/2" />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* Tab A: Full Master Roadmap Rail (Central Vertical Roadmap Spine) */}
        {activeTab === 'ROADMAP' && (
          <div className="relative max-w-5xl mx-auto py-4">
            
            {/* Central Continuous Roadmap Rail: Left-6 on mobile, Left-1/2 on Desktop */}
            <div className="absolute top-4 bottom-4 left-6 md:left-1/2 md:-translate-x-1/2 w-1.5 bg-[#111116]/15 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-b from-[#B6FF00] via-[#00E5FF] via-[#FFE500] via-[#FF2E93] to-[#7B2FFF] rounded-full" />
            </div>

            <div className="space-y-10 sm:space-y-16">
              {roadmapTimeline.map((item, idx) => {
                const phaseMetaMap = {
                  "01": {
                    accent: "#B6FF00",
                    shadow: "shadow-[6px_6px_0px_0px_#B6FF00]",
                    nodeBg: "bg-[#B6FF00]",
                    tagText: "text-[#111116]",
                    stageTag: "STAGE 01 // ONLINE ACCESS (₹0)",
                    icon: Flame,
                    deliverable: "₹0 Free Entry · 2-4 Members · Pick Problem Statement",
                  },
                  "02": {
                    accent: "#00E5FF",
                    shadow: "shadow-[6px_6px_0px_0px_#00E5FF]",
                    nodeBg: "bg-[#00E5FF]",
                    tagText: "text-[#111116]",
                    stageTag: "STAGE 02 // 48-HOUR UPLOAD WINDOW",
                    icon: Send,
                    deliverable: "Mandatory 6-Slide SIH Presentation (PDF)",
                  },
                  "03": {
                    accent: "#FFE500",
                    shadow: "shadow-[6px_6px_0px_0px_#FFE500]",
                    nodeBg: "bg-[#FFE500]",
                    tagText: "text-[#111116]",
                    stageTag: "STAGE 03 // JURY TECHNICAL SCREENING",
                    icon: Sparkles,
                    deliverable: "Academic Tier Normalization (Tier A Junior vs Tier B Senior)",
                  },
                  "04": {
                    accent: "#FF2E93",
                    shadow: "shadow-[6px_6px_0px_0px_#FF2E93]",
                    nodeBg: "bg-[#FF2E93]",
                    tagText: "text-white",
                    stageTag: "STAGE 04 // FINALIST TELEPHONY DISPATCH",
                    icon: CheckCircle2,
                    deliverable: "Direct Call from Coordinators + Private Passcode Confirmation",
                  },
                  "05": {
                    accent: "#7B2FFF",
                    shadow: "shadow-[6px_6px_0px_0px_#7B2FFF]",
                    nodeBg: "bg-[#7B2FFF]",
                    tagText: "text-white",
                    stageTag: "STAGE 05 // 24H OFFLINE ARENA FINALE",
                    icon: Award,
                    deliverable: "SIET Coimbatore Campus · Live Twists · Trophies & Internships",
                  }
                };

                const meta = phaseMetaMap[item.phase] || phaseMetaMap["01"];
                const isEven = idx % 2 === 0;
                const IconComponent = meta.icon;
                const isActive = item.status === 'ACTIVE';

                return (
                  <div 
                    key={`roadmap-phase-${item.phase}`}
                    className={`relative flex flex-col md:flex-row items-start md:items-center ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Milestone Node on Central Rail */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-3 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center font-mono font-black text-sm select-none ${meta.nodeBg} ${meta.tagText} ${
                        isActive ? 'ring-4 ring-[#B6FF00]/50 scale-110 shadow-[3px_3px_0px_0px_#111116]' : ''
                      }`}>
                        {item.phase}
                      </div>
                    </div>

                    {/* Milestone Card */}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                      isEven ? 'md:pr-14 md:text-right' : 'md:pl-14 md:text-left'
                    }`}>
                      <div className={`bg-white rounded-3xl border-3 border-[#111116] p-6 sm:p-7 transition-all hover:-translate-y-1 ${meta.shadow} ${
                        isActive ? 'ring-3 ring-[#B6FF00]' : ''
                      }`}>
                        {/* Phase & Live Status Header */}
                        <div className={`flex flex-wrap items-center gap-2 mb-3 ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}>
                          <span className="font-mono text-xs font-black px-3 py-1 rounded-lg bg-[#111116] text-[#FFE500] border border-[#111116]">
                            PHASE {item.phase}
                          </span>

                          <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116] ${
                            isActive 
                              ? 'bg-[#B6FF00] text-[#111116] animate-pulse flex items-center gap-1.5' 
                              : 'bg-[#F4F4F6] text-[#111116]/70'
                          }`}>
                            {isActive && <span className="w-2 h-2 rounded-full bg-[#111116] animate-pulse" />}
                            <span>{isActive ? 'ACTIVE NOW' : item.status}</span>
                          </span>

                          <span className="font-mono text-[11px] font-bold text-[#0055FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {meta.stageTag}
                          </span>
                        </div>

                        {/* Date Window */}
                        <div className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#111116]/80 mb-2 ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}>
                          <Calendar className="w-3.5 h-3.5 text-[#FF2E93]" />
                          <span className="font-extrabold">{item.dates}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl font-black text-[#111116] mb-2 leading-tight">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed font-normal mb-4">
                          {item.desc}
                        </p>

                        {/* Deliverable Pill Footer */}
                        <div className={`pt-3 border-t-2 border-[#111116]/10 flex items-center gap-2 text-xs font-mono font-black ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accent }} />
                          <span className="text-[#111116]/70 text-[11px]">{meta.deliverable}</span>
                        </div>
                      </div>
                    </div>

                    {/* Opposite Side Checkpoint Marker (Desktop only) */}
                    <div className={`hidden md:flex w-1/2 items-center ${
                      isEven ? 'pl-14 text-left justify-start' : 'pr-14 text-right justify-end'
                    }`}>
                      <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116] max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4 text-[#111116]" />
                          <span className="font-mono text-xs font-black text-[#111116] uppercase">
                            {item.dates}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-[#6B6B78] font-bold leading-tight">
                          {meta.stageTag}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Schedule Footer Notice */}
        <div className="mt-16 p-5 rounded-2xl bg-white border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6B6B78] gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse-live" />
            <span className="font-bold text-[#111116]">
              FULL 24-HOUR CATERING: Breakfast, Lunch, Dinner, Midnight Refreshments & Continuous Tea Provided On-Site
            </span>
          </div>
          <div className="font-black text-[#111116] bg-[#FFE500] px-3 py-1 rounded-lg border border-[#111116]">
            STRICT ADHERENCE TO TIME SLOTS ENFORCED
          </div>
        </div>

      </div>
    </section>
  );
}