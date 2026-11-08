import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Radio, Clock, ArrowRight } from 'lucide-react';
import { getLiveEventState } from '../lib/api';

export default function LiveArenaBanner() {
  const [eventState, setEventState] = useState(null);

  useEffect(() => {
    let mounted = true;
    getLiveEventState().then(state => {
      if (mounted && state) setEventState(state);
    });

    const interval = setInterval(() => {
      getLiveEventState().then(state => {
        if (mounted && state) setEventState(state);
      });
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!eventState || !eventState.is_clock_public) {
    return null;
  }

  return (
    <div className="bg-[#111116] text-white border-b-3 border-[#FFE500] px-4 py-2.5 z-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        
        {/* Left Live Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 bg-[#FF2E93] text-white font-black px-2.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE ARENA</span>
          </span>
          <span className="font-bold text-[#FFE500] hidden md:inline">
            24-HOUR FINALE BUILD IN PROGRESS
          </span>
        </div>

        {/* Center Live Announcement Ticker */}
        <div className="flex-1 max-w-xl text-center truncate text-white/90 font-medium px-2">
          <span className="text-[#00E5FF] font-black mr-2">ANNOUNCEMENT:</span>
          <span>{eventState.live_announcement_text || '24-Hour countdown active. Live jury audits in progress.'}</span>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/live"
            className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black px-3.5 py-1.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#FF2E93] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>OPEN ARENA STAGE VIEW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}

