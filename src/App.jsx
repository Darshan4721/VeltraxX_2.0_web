import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import { eventConfig } from './config/eventConfig';
import { 
  Cpu, 
  Terminal, 
  Clock, 
  Award, 
  Layers, 
  Check, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Building, 
  ArrowUpRight, 
  FileCode, 
  ShieldAlert, 
  HelpCircle, 
  ExternalLink,
  Users
} from 'lucide-react';

export default function App() {
  const { event, registration, challenge, prizes, contacts, schedule } = eventConfig;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#111116] selection:bg-[#FFE500] selection:text-[#111116]">
      <Navbar />
      
      <main className="flex-1">
        {/* CHAPTER 1 — SECTION 01: Hero Stage with Atropos 2.5D Stage */}
        <HeroSection />

        {/* CHAPTER 1 — SECTION 02 & 03: Event Overview & Foundation */}
        <section id="overview" className="py-20 bg-white border-b border-[#111116]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs font-bold text-[#0055FF] uppercase tracking-widest">
                CHAPTER 01 // FOUNDATION & MISSION
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111116] mt-2 mb-4">
                National-Level Silicon Engineering Arena
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B78] leading-relaxed">
                VELTRAXX 2.0 is a 24-hour hardcore semiconductor engineering hackathon organized by the 
                VLSI Faculty Team & Department of ECE at Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore.
                Driven by India's Chips to Startup (C2S) initiative, teams will architect, synthesize, and validate 
                digital systems under strict real-world constraints.
              </p>
            </div>

            {/* Asymmetric Highlights Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: 0 Tracks / Unified Industry Statement */}
              <div className="glass-surface p-7 rounded-2xl border border-[#111116]/10 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] flex items-center justify-center font-bold mb-5 shadow-xs">
                    01
                  </div>
                  <span className="font-mono text-xs text-[#6B6B78] uppercase font-semibold">Challenge Architecture</span>
                  <h3 className="text-xl font-bold text-[#111116] mt-1 mb-3">Unified Industry Problem</h3>
                  <p className="text-sm text-[#6B6B78] leading-relaxed">
                    Zero fragmented tracks. Exactly one comprehensive industry-grade RTL/synthesis challenge released 2 days prior (August 26) to paid teams.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#111116]/8 font-mono text-xs text-[#0055FF] font-semibold">
                  RELEASE: 26 AUG 2026 // 10:00 AM
                </div>
              </div>

              {/* Card 2: BYOD Protocol */}
              <div className="glass-surface p-7 rounded-2xl border border-[#111116]/10 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#111116] text-[#FFE500] flex items-center justify-center font-bold mb-5 shadow-xs">
                    02
                  </div>
                  <span className="font-mono text-xs text-[#6B6B78] uppercase font-semibold">Hardware Protocol</span>
                  <h3 className="text-xl font-bold text-[#111116] mt-1 mb-3">Strict BYOD Engineering</h3>
                  <p className="text-sm text-[#6B6B78] leading-relaxed">
                    Participants must bring their own configured laptops, licensed EDA tools (Cadence / Synopsys / OpenLane / Verilator), and FPGA boards if required. High-speed power & network provided.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#111116]/8 font-mono text-xs text-[#111116] font-semibold">
                  POWER & HIGH-SPEED GIGABIT LAN READY
                </div>
              </div>

              {/* Card 3: Sole Championship */}
              <div className="glass-surface p-7 rounded-2xl border border-[#111116]/10 flex flex-col justify-between bg-gradient-to-br from-white to-[#FFE500]/10 hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FF2A4B] text-white flex items-center justify-center font-bold mb-5 shadow-xs">
                    03
                  </div>
                  <span className="font-mono text-xs text-[#6B6B78] uppercase font-semibold">Validation & Career</span>
                  <h3 className="text-xl font-bold text-[#111116] mt-1 mb-3">Direct Industry Internship</h3>
                  <p className="text-sm text-[#6B6B78] leading-relaxed">
                    Sole winning team champions receive direct internship opportunities in top VLSI corporations, plus free access to the Synopsys hands-on workshop.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#111116]/8 font-mono text-xs text-emerald-600 font-semibold">
                  FOR ALL 4 WINNING MEMBERS
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CHAPTER 3 — SECTION 06: 24-Hour Timeline */}
        <section id="timeline" className="py-20 bg-[#F4F4F6] border-b border-[#111116]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="font-mono text-xs font-bold text-[#0055FF] uppercase tracking-widest">
                  CHAPTER 03 // 24-HOUR CHRONOLOGY
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111116] mt-2">
                  Precision Hackathon Timeline
                </h2>
              </div>
              <div className="mt-4 sm:mt-0 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-[#111116]/10 text-[#6B6B78]">
                TOTAL: 24 HOURS (28–29 AUGUST 2026)
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
              {schedule.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isPrimary 
                      ? 'bg-[#FFE500]/20 border-[#FFE500] shadow-sm' 
                      : 'bg-white border-[#111116]/8 hover:border-[#111116]/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#111116] text-white shrink-0">
                      DAY {item.day}
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#111116] shrink-0 min-w-[140px]">
                      {item.time}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#111116]">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.isAttendance && (
                      <span className="font-mono text-[10px] font-semibold bg-[#0055FF]/10 text-[#0055FF] px-2 py-0.5 rounded">
                        SLOT {item.slot} ATTENDANCE
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-bold bg-[#111116]/5 text-[#6B6B78] px-2 py-0.5 rounded uppercase">
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CHAPTER 4 — SECTION 10: Prizes & Industry Recognition */}
        <section id="prizes" className="py-20 bg-white border-b border-[#111116]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="font-mono text-xs font-bold text-[#FF2A4B] uppercase tracking-widest">
                CHAPTER 04 // VALIDATION & REWARDS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111116] mt-2 mb-3">
                {prizes.grandPrize.title}
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B78]">
                {prizes.runnerUpPolicy} National-level MEMS certificates for all verified attendees.
              </p>
            </div>

            {/* Spotlight Championship Card */}
            <div className="max-w-4xl mx-auto glass-surface rounded-3xl p-8 sm:p-12 border-2 border-[#FFE500] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FFE500] text-[#111116] font-mono text-xs font-bold px-4 py-1 rounded-bl-xl border-l border-b border-[#111116]/15">
                CHAMPION REWARD
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#111116] flex items-center justify-center text-[#FFE500] shrink-0 shadow-lg">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>

                <div className="flex-1 text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111116] mb-4">
                    Exclusive Direct Career Fast-Track
                  </h3>
                  <ul className="space-y-3">
                    {prizes.grandPrize.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#111116]">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 5 — SECTION 13: Organizing Committee & Helpdesk */}
        <section id="contact" className="py-20 bg-[#F4F4F6] border-b border-[#111116]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="font-mono text-xs font-bold text-[#0055FF] uppercase tracking-widest">
                CHAPTER 05 // COORDINATION & SUPPORT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111116] mt-2 mb-3">
                Faculty & Student Helpdesk
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B78]">
                Direct contact points for institutional queries, payment verification, and logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Faculty Desk */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#111116]/10 shadow-xs">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#6B6B78] font-bold mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0055FF]" />
                  <span>FACULTY ADVISORY COMMITTEE (ECE / VLSI TEAM)</span>
                </h3>
                <div className="divide-y divide-[#111116]/5">
                  {contacts.faculty.map((f, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#111116]">{f.name}</div>
                        <div className="font-mono text-xs text-[#6B6B78]">{f.role}</div>
                      </div>
                      <a 
                        href={`tel:${f.phone.replace(/[^0-9+]/g, '')}`} 
                        className="font-mono text-xs font-semibold text-[#0055FF] hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{f.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Desk */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#111116]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#6B6B78] font-bold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FFE500] fill-current" />
                    <span>STUDENT COORDINATORS & DESK</span>
                  </h3>
                  <div className="divide-y divide-[#111116]/5">
                    {contacts.students.map((s, i) => (
                      <div key={i} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-[#111116]">{s.name}</div>
                          <div className="font-mono text-xs text-[#6B6B78]">{s.role}</div>
                        </div>
                        <a 
                          href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} 
                          className="font-mono text-xs font-semibold text-[#0055FF] hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{s.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-[#FFE500]/15 border border-[#FFE500]/40">
                  <div className="font-bold text-xs text-[#111116] mb-1">Venue Address</div>
                  <div className="text-xs text-[#6B6B78] leading-relaxed">
                    {event.institution.name} ({event.institution.shortName}),<br />
                    {event.institution.campus}
                  </div>
                  <div className="font-mono text-[11px] text-[#111116] mt-2 font-medium">
                    📍 {event.institution.coordinates.display}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 14: Final Registration Conversion Anchor */}
        <section id="register" className="py-20 bg-[#111116] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-dot-grid" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="font-mono text-xs font-bold text-[#FFE500] uppercase tracking-widest">
              STRICT CAPACITY CAP // {registration.maxTeams} TEAMS ONLY
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-3 mb-4">
              Secure Your Team's Arena Slot
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Registration fee is strictly ₹{registration.feeINR.toLocaleString()} per team of {registration.teamSize} members 
              (₹{registration.feePerMemberINR} per member). Once 35 teams are verified, the portal permanently locks.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:contact@siet.ac.in?subject=VELTRAXX 2.0 Registration Inquiry"
                className="bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-extrabold text-base px-8 py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>INITIATE TEAM REGISTRATION</span>
                <ArrowUpRight className="w-5 h-5" />
              </a>
              <a
                href="#overview"
                className="px-6 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors text-sm"
              >
                Review Hackathon Rules
              </a>
            </div>

            <div className="mt-8 font-mono text-xs text-white/40">
              PAYMENT METHOD: UPI SCAN & RECEIPT UPLOAD · SERVER-AUTHORITATIVE CAPACITY ENFORCEMENT
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="py-8 bg-white border-t border-[#111116]/10 text-xs font-mono text-[#6B6B78]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 {eventConfig.event.name}. Organized by {eventConfig.event.institution.department}, {eventConfig.event.institution.shortName}.
          </div>
          <div className="flex items-center gap-4">
            <span>OFFLINE ARENA // COIMBATORE</span>
            <span>•</span>
            <span className="text-[#0055FF] font-semibold">C2S INITIATIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
