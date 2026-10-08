import React from 'react';
import { eventConfig } from '../config/eventConfig';
import { Zap, Cpu, Users, Award, ShieldCheck, MapPin } from 'lucide-react';

export default function MarqueeRibbon() {
  const items = [
    { text: "24 HOURS NON-STOP", color: "bg-[#FFE500] text-[#111116]", icon: Zap },
    { text: "STRICTLY 35 TEAMS CAP", color: "bg-[#00E5FF] text-[#111116]", icon: Users },
    { text: "100% OFFLINE ARENA · SIET COIMBATORE", color: "bg-[#FF2E93] text-[#111116]", icon: MapPin },
    { text: "GRAND PRIZE: DIRECT VLSI INTERNSHIP", color: "bg-[#B6FF00] text-[#111116]", icon: Award },
    { text: "SYNOPSYS WORKSHOP ACCESS", color: "bg-[#7B2FFF] text-white", icon: Cpu },
    { text: "NATIONAL C2S INITIATIVE", color: "bg-white text-[#111116]", icon: ShieldCheck }
  ];

  return (
    <div className="relative py-8 overflow-hidden select-none z-30 my-6">
      
      {/* Ribbon 1: Pitch Black High-Contrast Band (Tilted -2deg) */}
      <div className="transform -rotate-2 -mx-4 sm:-mx-8 bg-[#0D0D11] border-y-2 border-[#FFE500] shadow-2xl py-3.5 sm:py-4 overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 text-white font-mono font-black text-sm sm:text-base tracking-wider">
          
          {/* Double map to create seamless infinite loop */}
          {[...items, ...items, ...items].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 shrink-0">
                <span className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase flex items-center gap-1.5 shadow-sm ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </span>
                <span className="text-[#FFE500] font-black text-xs">///</span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Ribbon 2: Electric Voltage Accent Band (Tilted +1.5deg intersecting) */}
      <div className="transform rotate-1 -mx-4 sm:-mx-8 bg-[#FFE500] text-[#111116] border-y border-[#111116] shadow-md py-2 overflow-hidden -mt-2">
        <div className="animate-marquee-reverse flex items-center gap-6 font-mono font-black text-xs uppercase tracking-widest">
          {[
            "RTL SYNTHESIS",
            "CADENCE INNOVUS",
            "GENUS 180nm/28nm",
            "FPGA HARDWARE IN THE LOOP",
            "STA TIMING CLOSURE",
            "GDSII FLOORPLANNING",
            "DFT ARCHITECTURE",
            "SIET VLSI EXCELLENCE"
          , ...[
            "RTL SYNTHESIS",
            "CADENCE INNOVUS",
            "GENUS 180nm/28nm",
            "FPGA HARDWARE IN THE LOOP",
            "STA TIMING CLOSURE",
            "GDSII FLOORPLANNING",
            "DFT ARCHITECTURE",
            "SIET VLSI EXCELLENCE"
          ]].map((tech, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#111116]" />
                <span>{tech}</span>
              </span>
              <span className="text-[#FF2E93] font-black">★</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
