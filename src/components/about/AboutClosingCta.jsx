// src/components/about/AboutClosingCta.jsx
// S11: Closing High-Voltage Inquiries & Registration CTA Anchor
// Obsidian Deep Chassis (#0D0D11) with verified institutional contacts and 100% Free Round 1 CTA

import React from 'react';
import { ArrowRight, Mail, Phone, MapPin, Sparkles, Building2, Users } from 'lucide-react';
import Tilt3DCard from './Tilt3DCard';

export default function AboutClosingCta() {
  return (
    <section
      id="connect"
      className="relative w-full py-20 bg-[#0D0D11] text-white border-b-3 border-[#111116] overflow-hidden"
    >
      {/* Radiant Ambient Spotlights */}
      <div
        className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#FFE500]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#FF2E93]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Main Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161622] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/40">
            <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse" />
            <span>CHAPTER 10 // CONNECT WITH VLSI DESIGN &amp; TECHNOLOGY</span>
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight leading-[0.95] mb-6">
            READY TO ARCHITECT <span className="text-[#FFE500]">SILICON?</span>
            <br />
            <span className="text-[#FF2E93]">FROM RTL TO TAPE-OUT,</span>
            <br />
            YOUR JOURNEY STARTS HERE.
          </h2>

          <p className="font-sans text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Whether you are an aspiring chip architect applying through TNEA (Code: 2727), a hackathon squad submitting your Round 1 pitch, or an industry partner seeking EDA collaboration.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#FF2E93] text-white font-mono text-sm sm:text-base font-black uppercase tracking-wider border-3 border-[#111116] shadow-[5px_5px_0px_#FFE500] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#FFE500] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>Register for VELTRAXX 2.0 (100% Free Round 1)</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </a>

            <a
              href="mailto:hod-vlsi@siet.ac.in?subject=C2S%20Lab%20Visit%20Inquiry"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-[#FFE500] text-[#111116] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_#FFFFFF] hover:bg-white transition-all"
            >
              <Mail className="w-4 h-4 text-[#111116]" />
              <span>Schedule C2S Lab Visit</span>
            </a>
          </div>
        </div>

        {/* 3 Direct Institutional Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: HOD Hotline */}
          <Tilt3DCard maxTilt={5} scale={1.02} translateZ={18} className="h-full">
            <div className="h-full rounded-3xl bg-[#161622] p-6 sm:p-7 border-2 border-white/20 shadow-[6px_6px_0px_#111116] flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-[#FFE500] text-[#111116] font-mono text-[10px] font-black uppercase tracking-wider mb-4">
                  HEAD OF DEPARTMENT
                </span>
                <h3 className="font-sans font-black text-xl text-white uppercase mb-1">
                  Dr. P. Dhilipkumar
                </h3>
                <div className="font-mono text-xs text-[#FFE500] font-bold mb-4">
                  Associate Professor &amp; HOD
                </div>
                <p className="font-sans text-xs text-white/70 leading-relaxed font-medium mb-6">
                  Advanced VLSI Research Lab, Sri Shakthi Tech Park, Chinniyampalayam Post, Coimbatore - 641062.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10 font-mono text-xs">
                <a
                  href="mailto:hod-vlsi@siet.ac.in"
                  className="flex items-center gap-2 text-white/90 hover:text-[#FFE500] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>hod-vlsi@siet.ac.in</span>
                </a>
                <div className="flex items-center gap-2 text-white/60">
                  <Building2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Department Secretariat · Room 304</span>
                </div>
              </div>
            </div>
          </Tilt3DCard>

          {/* Card 2: TNEA Admissions Hotline */}
          <Tilt3DCard maxTilt={5} scale={1.02} translateZ={18} className="h-full">
            <div className="h-full rounded-3xl bg-[#161622] p-6 sm:p-7 border-2 border-white/20 shadow-[6px_6px_0px_#111116] flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-[#00E5FF] text-[#111116] font-mono text-[10px] font-black uppercase tracking-wider mb-4">
                  TNEA ADMISSIONS
                </span>
                <h3 className="font-sans font-black text-xl text-white uppercase mb-1">
                  Counselling Code: 2727
                </h3>
                <div className="font-mono text-xs text-[#00E5FF] font-bold mb-4">
                  B.E. Electronics Engineering (VLSI Design &amp; Technology)
                </div>
                <p className="font-sans text-xs text-white/70 leading-relaxed font-medium mb-6">
                  Autonomous degree curriculum with direct industry tool integration from second year onwards.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10 font-mono text-xs">
                <div className="flex items-start gap-2 text-white/80">
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                  <span>Sri Shakthi Tech Park, L&amp;T Bypass, Coimbatore</span>
                </div>
                <a
                  href="mailto:ee-vlsi@siet.ac.in"
                  className="flex items-center gap-2 text-white/80 hover:text-[#FFE500] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>ee-vlsi@siet.ac.in</span>
                </a>
              </div>
            </div>
          </Tilt3DCard>

          {/* Card 3: Hackathon & Student Coordinators */}
          <Tilt3DCard maxTilt={5} scale={1.02} translateZ={18} className="h-full">
            <div className="h-full rounded-3xl bg-[#161622] p-6 sm:p-7 border-2 border-white/20 shadow-[6px_6px_0px_#111116] flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-[#FF2E93] text-white font-mono text-[10px] font-black uppercase tracking-wider mb-4">
                  HACKATHON DESK
                </span>
                <h3 className="font-sans font-black text-xl text-white uppercase mb-1">
                  Student Coordinators
                </h3>
                <div className="font-mono text-xs text-[#FF2E93] font-bold mb-4">
                  VELTRAXX 2.0 Organizing Secretariat
                </div>
                <p className="font-sans text-xs text-white/70 leading-relaxed font-medium mb-6">
                  Contact student coordinators directly for team registration guidance, PPT template submission, and offline lab access queries.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10 font-mono text-xs">
                <a
                  href="tel:+919751340838"
                  className="flex items-center gap-2 text-white/90 hover:text-[#FFE500] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>R.A. Darshan · +91 97513 40838</span>
                </a>
                <a
                  href="tel:+919344705387"
                  className="flex items-center gap-2 text-white/90 hover:text-[#FFE500] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>L.Subiksha · +91 93447 05387</span>
                </a>
              </div>
            </div>
          </Tilt3DCard>
        </div>
      </div>
    </section>
  );
}

