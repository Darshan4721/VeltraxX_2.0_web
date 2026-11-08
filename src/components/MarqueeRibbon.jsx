import React from 'react';
import { Zap, Cpu, Users, Award, ShieldCheck, MapPin, Sparkles, Layers } from 'lucide-react';

export default function MarqueeRibbon() {
  const items = [
    { text: "FREE ROUND 1 REGISTRATION", color: "bg-[#B6FF00] text-[#111116]", icon: Zap },
    { text: "OPEN TO UG / PG / SCHOLARS", color: "bg-[#FFE500] text-[#111116]", icon: Users },
    { text: "ASIC & RTL DIGITAL DESIGN", color: "bg-[#00E5FF] text-[#111116]", icon: Cpu },
    { text: "FPGA ACCELERATION & RISC-V", color: "bg-[#FF2E93] text-white", icon: Layers },
    { text: "EDGE AI & TINYML SYSTEMS", color: "bg-[#7B2FFF] text-white", icon: Sparkles },
    { text: "SMART IOT & CYBER-PHYSICAL", color: "bg-[#FFE500] text-[#111116]", icon: Cpu },
    { text: "SIH-STYLE PPT PITCH", color: "bg-white text-[#111116]", icon: Award },
    { text: "24-HOUR OFFLINE FINALE @ SIET COIMBATORE", color: "bg-[#B6FF00] text-[#111116]", icon: MapPin }
  ];

  const subItems = [
    "RTL SYNTHESIS",
    "CADENCE INNOVUS",
    "GENUS 180nm/28nm",
    "FPGA HARDWARE-IN-THE-LOOP",
    "TINYML EDGE INFERENCE",
    "RISC-V PROTOTYPING",
    "ZERO-FEE ROUND 1",
    "SIET VLSI EXCELLENCE",
    "50/50 LIVE JURY TWIST",
    "24-HOUR NON-STOP ARENA"
  ];

  return (
    <div className="relative py-8 overflow-hidden select-none z-30 my-6">
      
      {/* Ribbon 1: Pitch Black High-Contrast Band (Tilted -2deg) */}
      <div className="transform -rotate-2 -mx-4 sm:-mx-8 bg-[#0D0D11] border-y-3 border-[#FFE500] shadow-[0_4px_0px_0px_#111116] py-3.5 sm:py-4 overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 text-white font-mono font-black text-sm sm:text-base tracking-wider">
          
          {/* Double map for seamless infinite loop */}
          {[...items, ...items, ...items].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 shrink-0">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </span>
                <span className="text-[#FFE500] font-black text-xs">★</span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Ribbon 2: Electric Voltage Accent Band (Tilted +1.5deg intersecting) */}
      <div className="transform rotate-1 -mx-4 sm:-mx-8 bg-[#FFE500] text-[#111116] border-y-2 border-[#111116] shadow-[0_4px_0px_0px_#111116] py-2 overflow-hidden -mt-2">
        <div className="animate-marquee-reverse flex items-center gap-6 font-mono font-black text-xs uppercase tracking-widest">
          {[...subItems, ...subItems, ...subItems].map((tech, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#111116]" />
                <span>{tech}</span>
              </span>
              <span className="text-[#FF2E93] font-black">●</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
