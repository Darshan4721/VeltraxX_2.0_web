import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { Clock, CheckCircle2, Flame, Award, Users, AlertCircle, Coffee, Play, Send } from 'lucide-react';

export default function TimelineSection() {
  const { schedule, event } = eventConfig;
  const [selectedDay, setSelectedDay] = useState('ALL');

  const day1Events = schedule.filter(item => item.day === 1);
  const day2Events = schedule.filter(item => item.day === 2);

  const displayedEvents = selectedDay === 'ALL' 
    ? schedule 
    : selectedDay === 'DAY1' 
      ? day1Events 
      : day2Events;

  return (
    <section id="timeline" className="py-24 bg-[#F4F4F6] relative border-b border-[#111116]/10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>CHAPTER 04 // 24-HOUR PRECISION CHRONOLOGY</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111116] leading-tight">
              24 Hours Non-Stop. <br />
              <span className="text-[#0055FF]">Rigorous Engineering Milestones</span>.
            </h2>
            <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed">
              Every hour is accounted for. From the 09:30 AM problem orientation on August 28 to the 
              final jury pitches and direct internship announcements on August 29.
            </p>
          </div>

          {/* Interactive Day Filter Pills */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition-all ${
                selectedDay === 'ALL'
                  ? 'bg-[#111116] text-white shadow-xs'
                  : 'text-[#111116] hover:bg-[#111116]/5'
              }`}
            >
              ALL 24H ({schedule.length})
            </button>
            <button
              onClick={() => setSelectedDay('DAY1')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition-all ${
                selectedDay === 'DAY1'
                  ? 'bg-[#FFE500] text-[#111116] shadow-xs'
                  : 'text-[#111116] hover:bg-[#FFE500]/20'
              }`}
            >
              DAY 1 (28 AUG)
            </button>
            <button
              onClick={() => setSelectedDay('DAY2')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black transition-all ${
                selectedDay === 'DAY2'
                  ? 'bg-[#FF2E93] text-white shadow-xs'
                  : 'text-[#111116] hover:bg-[#FF2E93]/20'
              }`}
            >
              DAY 2 (29 AUG)
            </button>
          </div>
        </div>

        {/* Chronological Milestone Rail */}
        <div className="space-y-4">
          {displayedEvents.map((item, index) => {
            const isDay1 = item.day === 1;

            return (
              <div 
                key={item.id}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.isPrimary
                    ? 'bg-[#FFE500] border-[#111116] shadow-[4px_4px_0px_0px_#111116]'
                    : item.isAttendance
                      ? 'bg-white border-[#FF2E93] shadow-[4px_4px_0px_0px_#FF2E93]'
                      : 'bg-white border-[#111116]/15 hover:border-[#111116] shadow-xs hover:shadow-md'
                }`}
              >
                {/* Left Meta info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-black px-3 py-1.5 rounded-lg border border-[#111116] shrink-0 ${
                      isDay1 ? 'bg-[#111116] text-[#FFE500]' : 'bg-[#FF2E93] text-white'
                    }`}>
                      DAY {item.day}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-black text-[#111116] shrink-0 min-w-[150px]">
                      {item.time}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#111116] tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                  {item.isAttendance && (
                    <span className="font-mono text-xs font-black bg-[#FF2E93] text-white px-3 py-1 rounded-lg shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse-live" />
                      <span>SLOT {item.slot} ATTENDANCE</span>
                    </span>
                  )}

                  {item.isPrimary && (
                    <span className="font-mono text-xs font-black bg-[#111116] text-[#FFE500] px-3 py-1 rounded-lg shadow-xs flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-current text-[#FF2E93]" />
                      <span>KEY MILESTONE</span>
                    </span>
                  )}

                  <span className="font-mono text-xs font-bold bg-[#111116]/8 text-[#111116] px-3 py-1 rounded-lg border border-[#111116]/10 uppercase">
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Footer Notice */}
        <div className="mt-8 p-4 rounded-xl bg-white border border-[#111116]/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6B6B78] gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>MEALS & HIGH-TEA SERVED ON-SITE THROUGHOUT BOTH DAYS</span>
          </div>
          <div className="font-bold text-[#111116]">
            STRICT ADHERENCE TO TIME SLOTS ENFORCED BY ORGANIZING COMMITTEE
          </div>
        </div>

      </div>
    </section>
  );
}
