import React from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../config/eventConfig';
import { ArrowLeft, Phone, AlertTriangle, Cpu, Wrench, ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  const coordinator = eventConfig.contacts.students[0] || { name: "R.A. Darshan", phone: "+91-9751340838" };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#111116] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#FFE500] selection:text-[#111116]">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 opacity-10 bg-tech-grid pointer-events-none" />

      {/* Subtle Japanese/VLSI Background Glyph Motif */}
      <span className="absolute top-20 right-8 font-black text-8xl sm:text-9xl text-[#111116]/[0.03] pointer-events-none select-none tracking-tighter">
        未定義
      </span>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase tracking-wider mb-8 border-2 border-[#111116] shadow-[3px_3px_0px_0px_#FF2E93]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF2E93]" />
            <span>00 // HARDWARE BUS ERROR // ADDRESS_NOT_MAPPED</span>
          </div>

          {/* Central 404 Typographic Weave with 3D Silicon ASIC Die Cutout */}
          <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center my-2 select-none">
            
            {/* Background 404 Numbers */}
            <div className="absolute inset-0 flex items-center justify-between text-[8.5rem] sm:text-[12rem] md:text-[14rem] font-black text-[#111116] tracking-tighter leading-none pointer-events-none">
              <span className="transform -translate-x-4 sm:-translate-x-8 drop-shadow-sm">4</span>
              <span className="opacity-0">0</span>
              <span className="transform translate-x-4 sm:translate-x-8 drop-shadow-sm">4</span>
            </div>

            {/* Bent Pin Circuit Accent Plane behind die */}
            <div className="absolute w-44 h-44 sm:w-56 sm:h-56 bg-[#FFE500] rounded-full border-3 border-[#111116] shadow-xl transform -rotate-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-25 bg-dot-grid" />
              <div className="absolute top-4 font-mono text-[10px] font-black text-[#111116]/50">
                ASIC ROUTE: 0x00000000
              </div>
            </div>

            {/* Central 3D Chip Cutout with Bent Pin Motif */}
            <div className="relative z-20 w-48 sm:w-60 h-48 sm:h-60 flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
              <img 
                src="/images/hero-chip-transparent.png" 
                alt="Silicon die address decode fault" 
                className="w-full h-full object-contain filter contrast-110 saturate-110 transform hover:scale-105 transition-transform duration-300"
              />
              
              {/* Bent Pin Error Tag badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#FF2E93] text-white font-mono text-[11px] font-black px-3 py-1.5 rounded-lg border-2 border-[#111116] shadow-md transform rotate-6 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>BENT PIN 0x0</span>
              </div>
            </div>

          </div>

          {/* Tilted Contrast Full-Bleed Ribbon */}
          <div className="w-full max-w-2xl my-8 transform -rotate-2">
            <div className="bg-[#111116] text-[#FFE500] font-mono text-xs sm:text-sm font-black py-2.5 px-6 rounded-xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500] flex items-center justify-center gap-3 overflow-hidden">
              <span className="text-[#FF2E93]">///</span>
              <span className="tracking-wider uppercase">00 // SIGNAL ROUTING FAILED // BUS_ERROR: ADDRESS_NOT_DECODED</span>
              <span className="text-[#FF2E93]">///</span>
            </div>
          </div>

          {/* Descriptive Body Copy (Zero Em-Dashes) */}
          <p className="text-base sm:text-lg text-[#111116]/80 font-medium max-w-xl mb-10 leading-relaxed">
            The requested silicon address is unmapped in the current design hierarchy. 
            Verify your URL, re-check the route table, or return to the main hackathon arena.
          </p>

          {/* Action Buttons: Return Home + Direct Coordinator Phone */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-14">
            <Link
              to="/"
              className="bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-base px-8 py-4 rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] hover:shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[3px] hover:translate-y-[3px] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>RETURN TO HOMEPAGE</span>
            </Link>

            <a
              href={`tel:${coordinator.phone.replace(/[^0-9+]/g, '')}`}
              className="bg-white hover:bg-[#111116] text-[#111116] hover:text-white font-black text-base px-6 py-4 rounded-2xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Phone className="w-4 h-4 text-[#FF2E93]" />
              <span>HELPDESK: {coordinator.phone}</span>
            </a>
          </div>

          {/* Diagnostic Telemetry Cards with Spring Hover Tilt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl text-left">
            
            {/* Diagnostic Card 1: Bus Fault (Magenta Shadow, Tilts Down-Right) */}
            <div className="vital-tilt-box vital-tilt-1 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93] cursor-default select-none">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-black text-[#FF2E93] uppercase">DIAGNOSTIC BUS: FAULT</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E93]" />
              </div>
              <div className="font-mono text-sm font-black text-[#111116]">TARGET: 0xDEADBEEF</div>
              <div className="font-mono text-xs text-[#111116]/60 mt-1 font-semibold">STATUS: ADDR_DECODE_ERR</div>
            </div>

            {/* Diagnostic Card 2: Pin Integrity (Cobalt Shadow, Tilts Up-Left) */}
            <div className="vital-tilt-box vital-tilt-2 bg-white p-5 rounded-2xl border-2 border-[#111116] shadow-[5px_5px_0px_0px_#0055FF] cursor-default select-none">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-black text-[#0055FF] uppercase">PIN INTEGRITY: ERROR</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#0055FF]" />
              </div>
              <div className="font-mono text-sm font-black text-[#111116]">TRACE: UNMAPPED_WIRE</div>
              <div className="font-mono text-xs text-[#111116]/60 mt-1 font-semibold">SIGNAL: FLOATING_HIGH_Z</div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Minimal Notice */}
      <footer className="py-6 border-t-2 border-[#111116]/10 text-center font-mono text-xs text-[#6B6B78] relative z-10">
        <div>VELTRAXX 2.0 // NATIONAL-LEVEL 24-HOUR VLSI & HARDWARE HACKATHON</div>
        <div className="mt-1 text-[11px] text-[#111116]/40">Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore</div>
      </footer>
    </div>
  );
}
