import React, { useState, useEffect, useRef } from 'react';
import { eventConfig } from '../config/eventConfig';
import { Clock, Flame, Award, Users, AlertCircle, Coffee, Play, Send, Sparkles, Zap, Flag } from 'lucide-react';

export default function TimelineSection() {
  const { schedule, event } = eventConfig;
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      // Start filling when container enters middle of screen
      const current = windowHeight * 0.7 - rect.top;
      const progress = Math.min(Math.max(current / totalHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const day1Events = schedule.filter(item => item.day === 1);
  const day2Events = schedule.filter(item => item.day === 2);

  const displayedEvents = selectedDay === 'ALL' 
    ? schedule 
    : selectedDay === 'DAY1' 
      ? day1Events 
      : day2Events;

  return (
    <section id="timeline" className="py-24 bg-[#F4F4F6] relative border-b-2 border-[#111116] overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-tech-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/30 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>CHAPTER 04 // 24-HOUR EVENT SCHEDULE</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
              24 Hours Non-Stop. <br />
              <span className="text-[#0055FF]">Rigorous Engineering Milestones</span>.
            </h2>
            <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed">
              Central vertical execution rail. From the 09:30 AM problem orientation on August 28 to the 
              final jury defense and direct internship appointments on August 29.
            </p>
          </div>

          {/* Interactive Day Filter Pills */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116]">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                selectedDay === 'ALL'
                  ? 'bg-[#111116] text-white shadow-sm'
                  : 'text-[#111116] hover:bg-[#111116]/10'
              }`}
            >
              ALL 24H ({schedule.length})
            </button>
            <button
              onClick={() => setSelectedDay('DAY1')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                selectedDay === 'DAY1'
                  ? 'bg-[#FFE500] text-[#111116] shadow-sm'
                  : 'text-[#111116] hover:bg-[#FFE500]/20'
              }`}
            >
              DAY 1 (28 AUG)
            </button>
            <button
              onClick={() => setSelectedDay('DAY2')}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                selectedDay === 'DAY2'
                  ? 'bg-[#FF2E93] text-[#111116] shadow-sm'
                  : 'text-[#111116] hover:bg-[#FF2E93]/20'
              }`}
            >
              DAY 2 (29 AUG)
            </button>
          </div>
        </div>

        {/* Central Vertical Rail Container */}
        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          
          {/* Vertical Rail: Central on Desktop (left-1/2), Left-aligned on Mobile (left-6) */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-1/2 w-1.5 bg-[#111116]/15 rounded-full">
            {/* Scroll-Filling Progress Line */}
            <div 
              style={{ height: `${scrollProgress * 100}%` }}
              className="w-full bg-gradient-to-b from-[#FFE500] via-[#FF2E93] to-[#0055FF] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(255,46,147,0.5)]"
            />
          </div>

          {/* DAY 1 HEADER BANNER */}
          {(selectedDay === 'ALL' || selectedDay === 'DAY1') && (
            <div className="relative z-10 flex items-center justify-start md:justify-center mb-12 pl-14 md:pl-0">
              <div className="inline-flex items-center gap-3 bg-[#111116] text-white px-5 py-2.5 rounded-xl border-2 border-[#FFE500] shadow-[4px_4px_0px_0px_#FFE500]">
                <Flame className="w-5 h-5 text-[#FFE500]" />
                <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase">
                  DAY 01 // 28 AUGUST 2026 - 24H SPRINT COMMENCES
                </span>
              </div>
            </div>
          )}

          {/* Chronological Event Nodes */}
          <div className="space-y-12 relative z-10">
            {displayedEvents.map((item, index) => {
              const isEven = index % 2 === 0;
              const isStartNode = item.id === "d1-2"; // 10:15 AM Starts
              const isEndNode = item.id === "d2-4"; // Final Judging
              const isMidnightSplit = item.id === "d2-1" && selectedDay === 'ALL';

              return (
                <React.Fragment key={item.id}>
                  
                  {/* Midnight Split Banner inserted before Day 2 first event if showing ALL */}
                  {isMidnightSplit && (
                    <div className="relative z-20 flex items-center justify-start md:justify-center my-16 pl-14 md:pl-0">
                      <div className="inline-flex items-center gap-3 bg-[#FF2E93] text-[#111116] px-6 py-3 rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116]">
                        <Zap className="w-5 h-5 text-[#FFE500] animate-bounce" />
                        <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase">
                          ⚡ MIDNIGHT CROSSOVER // DAY 02 (29 AUG) - CRITICAL STA CLOSURE
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } group`}>
                    
                    {/* Node on the Rail */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 z-20 flex flex-col items-center">
                      <div className={`rounded-full border-3 border-[#111116] flex items-center justify-center font-mono font-black transition-transform duration-300 group-hover:scale-110 ${
                        isStartNode || isEndNode
                          ? 'w-14 h-14 bg-[#FFE500] text-[#111116] shadow-[0_0_20px_rgba(255,229,0,0.8)] ring-4 ring-[#111116]/20'
                          : item.isPrimary
                            ? 'w-11 h-11 bg-[#FF2E93] text-white shadow-md'
                            : item.isAttendance
                              ? 'w-10 h-10 bg-[#00E5FF] text-[#111116] shadow-sm'
                              : 'w-9 h-9 bg-white text-[#111116] shadow-xs'
                      }`}>
                        {isStartNode ? (
                          <Flame className="w-7 h-7 text-[#FF2E93] animate-pulse" />
                        ) : isEndNode ? (
                          <Award className="w-7 h-7 text-[#0055FF]" />
                        ) : (
                          <span className="text-xs">{String(index + 1).padStart(2, '0')}</span>
                        )}
                      </div>

                      {/* Rail Monospace Timestamp Badge */}
                      <span className="hidden md:block mt-1 font-mono text-[10px] font-black uppercase bg-[#111116] text-[#FFE500] px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                        {item.time.split('–')[0].trim()}
                      </span>
                    </div>

                    {/* Card Content (Alternating on Desktop) */}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                      isEven ? 'md:pr-14 md:text-right' : 'md:pl-14 md:text-left'
                    }`}>
                      <div className={`p-6 rounded-3xl border-3 transition-all duration-300 ${
                        isStartNode || isEndNode
                          ? 'bg-[#FFE500] border-[#111116] shadow-[6px_6px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px]'
                          : item.isPrimary
                            ? 'bg-white border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93] hover:translate-x-[2px] hover:translate-y-[2px]'
                            : item.isAttendance
                              ? 'bg-white border-[#111116] shadow-[5px_5px_0px_0px_#00E5FF] hover:translate-x-[2px] hover:translate-y-[2px]'
                              : 'bg-white border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px]'
                      }`}>
                        
                        {/* Meta Tags Row */}
                        <div className={`flex flex-wrap items-center gap-2 mb-3 ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}>
                          <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border border-[#111116] ${
                            item.day === 1 ? 'bg-[#111116] text-[#FFE500]' : 'bg-[#FF2E93] text-[#111116]'
                          }`}>
                            DAY {item.day}
                          </span>

                          <span className="font-mono text-xs font-black bg-[#111116]/10 text-[#111116] px-2.5 py-1 rounded-lg md:hidden">
                            {item.time}
                          </span>

                          {item.isAttendance && (
                            <span className="font-mono text-xs font-black bg-[#00E5FF] text-[#111116] px-2.5 py-1 rounded-lg border border-[#111116] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#111116] animate-pulse-live" />
                              <span>SLOT {item.slot} ROLL CALL</span>
                            </span>
                          )}

                          {item.isPrimary && (
                            <span className="font-mono text-xs font-black bg-[#111116] text-[#FFE500] px-2.5 py-1 rounded-lg border border-[#FFE500]/50 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 fill-current text-[#FF2E93]" />
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

                        {/* Monospace Time Details */}
                        <div className={`font-mono text-xs font-bold text-[#111116]/70 flex items-center gap-1.5 ${
                          isEven ? 'md:justify-end' : 'md:justify-start'
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-[#111116]" />
                          <span>{item.time} IST</span>
                        </div>

                      </div>
                    </div>

                    {/* Spacer for opposite side on Desktop */}
                    <div className="hidden md:block w-1/2" />

                  </div>
                </React.Fragment>
              );
            })}
          </div>

        </div>

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
