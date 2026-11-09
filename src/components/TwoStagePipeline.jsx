import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  UploadCloud, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users,
  Award,
  Layers,
  Flame
} from 'lucide-react';

export default function TwoStagePipeline() {
  // Interactive 3D Stage Floating & Magnetic Proximity (Restored from HEAD)
  const [stageHover, setStageHover] = useState({
    active: false,
    x: 0,
    y: 0,
    pill1: { x: 0, y: 0, r: 0 },
    pill2: { x: 0, y: 0, r: 0 },
  });

  const handleStageMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const normX = (cursorX / rect.width) * 2 - 1; // -1 to 1
    const normY = (cursorY / rect.height) * 2 - 1;

    // Magnetic Proximity for Pill 1 (Top-Right)
    const p1x = rect.width - 50;
    const p1y = 30;
    const d1 = Math.hypot(cursorX - p1x, cursorY - p1y);
    let pill1Off = { x: 0, y: 0, r: 0 };
    if (d1 < 140) {
      const force1 = (1 - d1 / 140);
      pill1Off = {
        x: ((p1x - cursorX) / (d1 || 1)) * force1 * 22,
        y: ((p1y - cursorY) / (d1 || 1)) * force1 * 22,
        r: (cursorX > p1x ? -5 : 5) * force1
      };
    }

    // Magnetic Proximity for Pill 2 (Bottom-Left)
    const p2x = 70;
    const p2y = rect.height - 30;
    const d2 = Math.hypot(cursorX - p2x, cursorY - p2y);
    let pill2Off = { x: 0, y: 0, r: 0 };
    if (d2 < 140) {
      const force2 = (1 - d2 / 140);
      pill2Off = {
        x: ((p2x - cursorX) / (d2 || 1)) * force2 * 22,
        y: ((p2y - cursorY) / (d2 || 1)) * force2 * 22,
        r: (cursorX > p2x ? -5 : 5) * force2
      };
    }

    setStageHover({
      active: true,
      x: normX,
      y: normY,
      pill1: pill1Off,
      pill2: pill2Off
    });
  };

  const handleStageLeave = () => {
    setStageHover({
      active: false,
      x: 0,
      y: 0,
      pill1: { x: 0, y: 0, r: 0 },
      pill2: { x: 0, y: 0, r: 0 }
    });
  };

  const steps = [
    {
      step: "01",
      title: "Register & Pick Your Track",
      window: "Until 01 Dec 2026 (11:59 PM)",
      badge: "₹0 FREE ENTRY",
      badgeColor: "bg-[#B6FF00] text-[#111116]",
      tagColor: "text-[#00E5FF]",
      tagText: "GATEWAY: INSTANT TEAM ID · 100% FREE",
      borderColor: "hover:border-[#B6FF00]",
      numBg: "bg-[#B6FF00] text-[#111116]",
      description: "Form a team of 2 to 4 members. Browse the 25 problem statements across 5 domains, lock in your registration for ₹0, and draft your architecture with our official 6-slide template.",
      highlights: [
        "2 to 4 members (cross-dept allowed)",
        "Zero registration fee for Round 1",
        "Atomic Team ID issued immediately"
      ],
      icon: Users,
      accentGlow: "shadow-[4px_4px_0px_0px_#B6FF00]",
      cta: { text: "Register Free Now →", href: "/register", isRouter: true }
    },
    {
      step: "02",
      title: "48H PPT Blueprint Sprint",
      window: "02 Dec (00:00) to 03 Dec (23:59)",
      badge: "48-HOUR SPRINT",
      badgeColor: "bg-[#FFE500] text-[#111116]",
      tagColor: "text-[#FFE500]",
      tagText: "DELIVERABLE: 6-SLIDE BLUEPRINT (PDF)",
      borderColor: "hover:border-[#FFE500]",
      numBg: "bg-[#FFE500] text-[#111116]",
      description: "Submit your 6-slide presentation as a PDF via our submission portal. In-browser text extraction feeds our single-shot evaluation engine, scored fairly across academic tiers.",
      highlights: [
        "Official 6-slide SIH-style presentation format",
        "Direct Google Drive upload (5TB folder)",
        "Evaluated by academic tier for fairness"
      ],
      icon: UploadCloud,
      accentGlow: "shadow-[4px_4px_0px_0px_#FFE500]",
      cta: { text: "Download PPT Template ↓", href: "#downloads", isRouter: false }
    },
    {
      step: "03",
      title: "Shortlist & 24H Live Twist Finale",
      window: "15 - 16 Dec 2026 @ SIET Coimbatore",
      badge: "SHORTLISTED SQUADS",
      badgeColor: "bg-[#FF2E93] text-white",
      tagColor: "text-[#FF2E93]",
      tagText: "LIVE ARENA: 50% BUILD + 50% LIVE TWIST",
      borderColor: "hover:border-[#FF2E93]",
      numBg: "bg-[#FF2E93] text-white",
      description: "Shortlisted teams receive phone verification and Round 2 passes. Build your Round 1 blueprint live at SIET, plus surprise jury twists and constraints injected on Day 1.",
      highlights: [
        "24-hour non-stop build marathon at SIET",
        "50% Core Blueprint + 50% Live Twist weightage",
        "Full hospitality, meals, rest zones & power provided"
      ],
      icon: Cpu,
      accentGlow: "shadow-[4px_4px_0px_0px_#FF2E93]",
      cta: { text: "Round 2 Gatekeeper →", href: "/round2-confirm", isRouter: true }
    }
  ];

  return (
    <section id="pipeline" className="py-24 bg-[#0D0D11] bg-gradient-to-b from-[#111116] to-[#0D0D11] text-white relative overflow-hidden border-b-3 border-[#111116]">
      
      {/* Background Radiant Neon Ambient Halos (Solar Yellow & Hot Magenta Energy) */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FFE500]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-[#FF2E93]/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-15 bg-tech-grid pointer-events-none" />

      {/* Subtle Japanese/VLSI Kanji Watermark from Reference 2 */}
      <span className="absolute -bottom-10 right-4 font-black text-8xl sm:text-9xl text-white/[0.04] pointer-events-none select-none tracking-tighter">
        集積回路
      </span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] border border-[#FFE500]/30 text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>CHAPTER 01 // THE TWO-STAGE GAUNTLET</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Two Rounds. <span className="text-[#FFE500] underline decoration-[#FF2E93] decoration-wavy decoration-2">One Evolving Architecture</span>.
            </h2>
            
            <p className="text-base sm:text-lg text-white/80 mt-4 leading-relaxed font-normal">
              We ditched the pay-first lottery. Round 1 is completely free. Prove your engineering blueprint in an SIH-style PPT pitch. If your team makes the cut, you receive an official invitation to the 24-hour offline build marathon at SIET.
            </p>
          </div>

          <div className="shrink-0 bg-[#111116] border-2 border-white/20 rounded-2xl p-5 shadow-[6px_6px_0px_0px_#00E5FF] flex flex-col gap-2">
            <span className="font-mono text-xs text-[#00E5FF] font-bold uppercase tracking-wider">
              ROUND 1 PITCH WINDOW
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#FFE500]">
              02 DEC // 00:00 - 03 DEC // 23:59
            </div>
            <span className="font-mono text-xs text-white/50">
              48 Hours · 100% Free · Google Drive Automated Vault
            </span>
          </div>
        </div>

        {/* 2-Column High-Voltage Layout: Left 3-Step Gauntlet, Right Layered Exploded 3D Chip Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          
          {/* Left Column (7 Cols): 3 Interactive Gauntlet Cards */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className={`bg-[#111116] rounded-2xl p-6 border-2 border-white/15 ${item.borderColor} ${item.accentGlow} hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${item.numBg} flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#111116] shrink-0`}>
                        {item.step}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black uppercase border border-[#111116] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.window}</span>
                    </div>
                    <div className={`font-mono text-[11px] font-bold ${item.tagColor}`}>
                      {item.tagText}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4 font-normal">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/10 gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-white/60 font-mono">
                      {item.highlights.slice(0, 2).map((h, hIdx) => (
                        <span key={hIdx} className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF00]" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>

                    {item.cta.isRouter ? (
                      <Link
                        to={item.cta.href}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-[#FFE500] hover:text-white transition-colors"
                      >
                        <span>{item.cta.text}</span>
                      </Link>
                    ) : (
                      <a
                        href={item.cta.href}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-[#FFE500] hover:text-white transition-colors"
                      >
                        <span>{item.cta.text}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (5 Cols): Restored Exploded 5-Tier 3D ASIC Chip Stack with Magnetic Proximity */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            <div 
              onMouseMove={handleStageMove}
              onMouseLeave={handleStageLeave}
              className="relative w-full aspect-square max-w-[440px] flex items-center justify-center select-none cursor-pointer group"
            >
              
              {/* Layer 1: Giant Solar Wafer Yellow Circle (#FFE500) - Slides / Tilts Left */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(-24px, ${stageHover.y * 10}px) rotate(-8deg)` 
                    : 'none',
                  transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] max-w-[calc(100vw-3rem)] max-h-[calc(100vw-3rem)] rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-[8px_8px_0px_0px_#111116] pointer-events-none"
              >
                <div className="absolute inset-0 rounded-full opacity-20 bg-dot-grid" />
                <span className="absolute top-6 left-6 font-mono text-xs font-black text-[#111116]/60 uppercase tracking-widest">
                  SILICON DIE // 2-STAGE
                </span>
              </div>

              {/* Layer 2: Tilted Hot Magenta Slab (#FF2E93) - Slides / Tilts Right */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(28px, ${-stageHover.y * 12}px) rotate(16deg)` 
                    : 'rotate(-12deg) translate(24px, -16px)',
                  transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[220px] h-[280px] sm:w-[260px] sm:h-[320px] bg-[#FF2E93] rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] pointer-events-none"
              >
                <div className="absolute bottom-4 right-4 font-mono text-xs font-black text-white/70">
                  SIET ARENA
                </div>
              </div>

              {/* Layer 3: Electric Violet Wedge - Lags Slightly */}
              <div 
                style={{
                  transform: stageHover.active 
                    ? `translate(16px, 24px) rotate(-14deg)` 
                    : 'rotate(12deg) translate(-48px, 48px)',
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                className="absolute w-[180px] h-[180px] bg-[#7B2FFF] rounded-2xl border-2 border-[#111116] opacity-90 shadow-[4px_4px_0px_0px_#111116] pointer-events-none" 
              />

              {/* Layer 4: Exploded 5-Tier 3D ASIC Chip Stack Cutout */}
              <div 
                style={{
                  transform: stageHover.active
                    ? `perspective(1000px) rotateX(${-stageHover.y * 14}deg) rotateY(${stageHover.x * 14}deg) scale(1.08)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                  transition: 'transform 0.25s ease-out'
                }}
                className="relative z-20 w-[95%] h-[95%] flex items-center justify-center filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] pointer-events-none"
              >
                <img 
                  src="/images/chip-stack-exploded-transparent.webp" 
                  alt="VELTRAXX 2.0 Exploded 5-Tier 3D Silicon ASIC Architecture" 
                  width="800"
                  height="800"
                  className="w-full h-full object-contain filter contrast-110 saturate-110"
                  loading="lazy"
                />
              </div>

              {/* Layer 5: Floating Badges with Magnetic Pointer Proximity */}
              <div 
                style={{
                  transform: `rotate(6deg) translate(${stageHover.pill1.x}px, ${stageHover.pill1.y}px) rotate(${stageHover.pill1.r}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="absolute -top-3 right-0 z-30 bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] pointer-events-none"
              >
                ROUND 1: ₹0 FREE
              </div>

              <div 
                style={{
                  transform: `rotate(-6deg) translate(${stageHover.pill2.x}px, ${stageHover.pill2.y}px) rotate(${stageHover.pill2.r}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="absolute -bottom-4 left-2 z-30 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-4 py-2 rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] pointer-events-none"
              >
                SHORTLISTED SQUADS FINALE
              </div>

            </div>

          </div>

        </div>

        {/* Evaluation Fairness & Anti-Slop Banner */}
        <div className="bg-[#111116] rounded-2xl p-6 sm:p-7 border-2 border-[#FFE500]/40 shadow-[4px_4px_0px_0px_#FFE500] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-black text-xl shrink-0 border-2 border-[#111116]">
              ⚖️
            </div>
            <div>
              <div className="font-mono text-xs font-black text-[#B6FF00] uppercase tracking-wider mb-1">
                ACADEMIC TIER NORMALIZATION & LIVE TWIST DEFENSE
              </div>
              <h4 className="text-lg font-black text-white">
                Evaluated fairly by student year. Pre-built projects fail by design.
              </h4>
              <p className="text-sm text-white/70 mt-1 max-w-3xl font-normal">
                1st and 2nd-year UG projects are benchmarked against foundational criteria, while Senior UG, PG and Scholars are held to rigorous architectural depth. When the 24H Live Twist drops on Dec 15, static copy-paste repositories cannot adapt. Only genuine engineers survive.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/register"
              className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-xs px-5 py-3 rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2"
            >
              <span>Register Free Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
