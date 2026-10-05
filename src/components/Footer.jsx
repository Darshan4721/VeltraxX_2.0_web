import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { Cpu, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { event } = eventConfig;

  return (
    <footer className="py-12 bg-white text-[#111116] border-t-2 border-[#111116]/10 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#111116]/10">
          
          {/* Brand & Department */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111116] text-[#FFE500] flex items-center justify-center font-black">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-[#111116]">
                {event.name} — 2026 EDITION
              </div>
              <div className="text-[#6B6B78] text-[11px]">
                {event.institution.department}, {event.institution.shortName}
              </div>
            </div>
          </div>

          {/* Quick Jump Links */}
          <div className="flex flex-wrap items-center gap-6 font-bold text-[#111116]">
            <a href="#overview" className="hover:text-[#0055FF] transition-colors">Overview</a>
            <a href="#challenge" className="hover:text-[#0055FF] transition-colors">Challenge</a>
            <a href="#rulebook" className="hover:text-[#0055FF] transition-colors">BYOD Rules</a>
            <a href="#timeline" className="hover:text-[#0055FF] transition-colors">24H Timeline</a>
            <a href="#prizes" className="hover:text-[#0055FF] transition-colors">Prizes</a>
            <a href="#contact" className="hover:text-[#0055FF] transition-colors">Helpdesk</a>
          </div>

        </div>

        {/* Bottom Credits & Institutional Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B6B78] gap-4">
          <div>
            © 2026 {event.name}. Sri Shakthi Institute of Engineering and Technology. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[#111116]">
              <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span>COIMBATORE, TAMIL NADU</span>
            </span>
            <span>•</span>
            <span className="font-bold text-[#0055FF] bg-[#0055FF]/10 px-2 py-0.5 rounded">
              CHIPS TO STARTUP (C2S) INITIATIVE
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
