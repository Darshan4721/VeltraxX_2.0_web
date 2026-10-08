import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { ChevronDown, Phone, Mail, Building, Users, MapPin, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const { contacts, event, registration } = eventConfig;
  
  const faqs = [
    {
      q: "What is the team size and registration fee?",
      a: `Teams must strictly consist of exactly ${registration.teamSize} members (1 Leader + 3 Engineers). The registration fee is ₹${registration.feeINR.toLocaleString()} flat per team (₹${registration.feePerMemberINR} per member). Once the 35-team limit is reached, registration closes permanently.`
    },
    {
      q: "What hardware and EDA tools do we need to bring?",
      a: "This is a strict BYOD (Bring Your Own Device) hackathon. Teams must bring their own configured laptops with their preferred EDA tools (Cadence, Synopsys, OpenLane, Verilator, etc.) or FPGA boards. High-speed Gigabit LAN, uninterrupted UPS power sockets, and workspaces are provided on-site."
    },
    {
      q: "Are inter-college and cross-department teams permitted?",
      a: "Yes! Teams can comprise students from different engineering institutions, departments (ECE, EEE, VLSI, CSE), and academic years (B.E., B.Tech, M.E., M.Tech, and Research Scholars)."
    },
    {
      q: "Will meals and accommodation be provided during the 24 hours?",
      a: "Yes. Breakfast, lunch, dinner, midnight refreshments, and continuous tea/coffee are provided on-campus for all registered team members. Dedicated rest areas and high-security cleanroom labs are arranged."
    },
    {
      q: "How does the problem statement release work?",
      a: "Zero fragmented tracks. Exactly one unified, industrial-grade VLSI problem statement will be released 48 hours prior (26 August 2026, 10:00 AM) to verified paid teams via registered email."
    },
    {
      q: "Are we allowed to use AI tools or pre-written code?",
      a: "AI assistants (Copilot, ChatGPT, Claude) are permitted for syntax reference, scripting, and testbench generation. However, all core RTL architecture and synthesis decisions must be authored live during the 24-hour sprint. Pre-built netlists are strictly barred, and every team member must be able to orally defend every line of code during the jury viva."
    },
    {
      q: "Is accommodation or travel support provided?",
      a: "No travel reimbursement or off-campus hotel accommodation is provided. However, full 24-hour indoor lab workspace, secure rest lounges, campus power/LAN facilities, and all meals/refreshments are provided on-site at the SIET Coimbatore campus throughout the hackathon."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="contact" className="py-24 bg-[#FBFBFB] relative border-b border-[#111116]/10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse-live" />
            <span>CHAPTER 06 // CLARITY & COORDINATION HELPDESK</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111116] leading-tight">
            Frequently Answered. <br />
            <span className="text-[#0055FF]">Direct Contact Points</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B78] mt-4 leading-relaxed">
            Everything you need to know about the arena rules, toolchains, and logistics. 
            Reach out directly to faculty convenors and student coordinators.
          </p>
        </div>

        {/* 2-Column Split: Left FAQ Accordion, Right Organizing Committee Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (7 Cols): Interactive FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-[#111116] mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#0055FF]" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </h3>

            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <div 
                  key={i}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-white border-[#111116] shadow-[4px_4px_0px_0px_#111116]' 
                      : 'bg-white border-[#111116]/10 hover:border-[#111116]/30 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-[#111116]"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-[#111116] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0055FF]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-[#6B6B78] leading-relaxed border-t border-[#111116]/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column (5 Cols): Organizing Committee Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Faculty Advisory */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#111116]/10">
                <span className="font-mono text-xs font-black text-[#111116] uppercase flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0055FF]" />
                  <span>FACULTY ADVISORY (VLSI TEAM)</span>
                </span>
                <span className="font-mono text-[10px] bg-[#FFE500] text-[#111116] font-bold px-2 py-0.5 rounded">
                  OFFICIAL
                </span>
              </div>

              <div className="divide-y divide-[#111116]/8">
                {contacts.faculty.map((f, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-[#111116]">{f.name}</div>
                      <div className="font-mono text-xs text-[#6B6B78]">{f.role}</div>
                    </div>
                    <a 
                      href={`tel:${f.phone.replace(/[^0-9+]/g, '')}`} 
                      className="font-mono text-xs font-black text-[#0055FF] bg-[#0055FF]/10 hover:bg-[#0055FF] hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Coordinators */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#111116]/10">
                <span className="font-mono text-xs font-black text-[#111116] uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF2E93]" />
                  <span>STUDENT COORDINATORS DESK</span>
                </span>
                <span className="font-mono text-[10px] bg-[#FF2E93] text-[#111116] font-bold px-2 py-0.5 rounded">
                  24H HELPDESK
                </span>
              </div>

              <div className="divide-y divide-[#111116]/8">
                {contacts.students.map((s, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-[#111116]">{s.name}</div>
                      <div className="font-mono text-xs text-[#6B6B78]">{s.role}</div>
                    </div>
                    <a 
                      href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} 
                      className="font-mono text-xs font-black text-[#FF2E93] bg-[#FF2E93]/10 hover:bg-[#FF2E93] hover:text-[#111116] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>

              {/* Physical Venue Card */}
              <div className="mt-5 p-4 rounded-xl bg-[#F4F4F6] border border-[#111116]/10">
                <div className="flex items-center gap-2 font-black text-xs text-[#111116] mb-1">
                  <MapPin className="w-4 h-4 text-[#FF2E93]" />
                  <span>PHYSICAL VENUE LOCATION</span>
                </div>
                <div className="text-xs text-[#6B6B78] leading-relaxed">
                  {event.institution.name} ({event.institution.shortName})<br />
                  {event.institution.campus}
                </div>
                <div className="font-mono text-[11px] text-[#111116] font-bold mt-2">
                  COORDINATES: {event.institution.coordinates.display}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
