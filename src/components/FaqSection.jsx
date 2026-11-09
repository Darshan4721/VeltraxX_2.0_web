import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { ChevronDown, Building, Users, MapPin, HelpCircle } from 'lucide-react';
import ContactActionGroup from './ContactActionGroup';

export default function FaqSection() {
  const { contacts, event } = eventConfig;
  
  const faqs = [
    {
      q: "Is Round 1 really 100% free?",
      a: "Yes. Registering your team and submitting your Round 1 PPT blueprint costs ₹0. There is no fee required to pitch your idea online."
    },
    {
      q: "What happens if our team gets shortlisted for Round 2?",
      a: "Our coordinators will call your Team Leader directly to confirm your physical seat and send an exclusive invitation email containing the Round 2 passcode and nominal offline hospitality details."
    },
    {
      q: "I am a 1st-year student / from CSE or IT. Can I participate?",
      a: "Absolutely. We feature 5 tracks covering AI, IoT, Embedded Systems, FPGA, and VLSI. Our jury normalizes evaluation relative to your academic year (1st/2nd-year UG vs Senior UG/PG/Scholars)."
    },
    {
      q: "What is the allowed team size?",
      a: "Teams can consist of 2, 3, or 4 members. Cross-department collaborations (e.g. ECE + CSE or VLSI + IT) within your institution are welcome."
    },
    {
      q: "How do we submit our PPT on Dec 2-3?",
      a: "Download the official 6-slide template from this website, complete your architecture, save it as a PDF (under 3MB), and upload it directly via the 'Submit PPT' portal on Dec 2-3 using your Team ID."
    },
    {
      q: "Will food and overnight stay be provided during the Dec 15-16 finale?",
      a: "Yes. Comprehensive hospitality including working lunch, dinner, midnight refreshments, breakfast, and dedicated resting zones for boys and girls is provided at the SIET campus."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faqs" className="py-24 bg-[#FBFBFB] relative border-b-3 border-[#111116]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-10 bg-tech-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-widest mb-4 border border-[#FFE500]/40">
            <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse-live" />
            <span>CHAPTER 06 // CLARITY & COORDINATION HELPDESK</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111116] leading-tight">
            Frequently Answered. <br />
            <span className="underline decoration-[#0055FF] decoration-4">Direct Contact Points</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#111116]/80 mt-4 leading-relaxed font-normal">
            Everything you need to know about the two-round format, team composition, and campus logistics. Reach out directly to faculty convenors and student coordinators.
          </p>
        </div>

        {/* 2-Column Split: Left FAQ Accordion, Right Organizing Committee Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
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
                  className={`rounded-2xl border-3 border-[#111116] transition-all overflow-hidden ${
                    isOpen 
                      ? 'bg-white shadow-[4px_4px_0px_0px_#111116]' 
                      : 'bg-white hover:shadow-[2px_2px_0px_0px_#111116]'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-[#111116] cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-[#111116] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0055FF]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-[#111116]/80 leading-relaxed border-t-2 border-[#111116]/10 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column (5 Cols): Direct Helpdesk & Venue Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Coordinators Card */}
            <div className="bg-white rounded-2xl p-6 border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500]">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#111116]" />
                <h4 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  STUDENT COORDINATORS
                </h4>
              </div>

              <div className="space-y-3">
                {contacts.students.map((student, sIdx) => (
                  <ContactActionGroup
                    key={sIdx}
                    name={student.name}
                    role={student.role}
                    phone={student.phone}
                    showWhatsApp={true}
                    callColor="bg-[#FFE500]"
                    callTitle={`Call ${student.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Faculty Convenors Card */}
            <div className="bg-white rounded-2xl p-6 border-3 border-[#111116] shadow-[5px_5px_0px_0px_#00E5FF]">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-[#111116]" />
                <h4 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  FACULTY CONVENORS
                </h4>
              </div>

              <div className="space-y-3">
                {contacts.faculty.map((faculty, fIdx) => (
                  <ContactActionGroup
                    key={fIdx}
                    name={faculty.name}
                    role={`${faculty.role} · SIET EE/VLSI`}
                    phone={faculty.phone}
                    showWhatsApp={false}
                    callColor="bg-[#00E5FF]"
                    callTitle={`Call ${faculty.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Venue & Location Card */}
            <div className="bg-[#111116] text-white rounded-2xl p-6 border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FF2E93]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-[#FFE500]" />
                <h4 className="font-mono text-xs font-black uppercase text-[#FFE500] tracking-wider">
                  EVENT VENUE
                </h4>
              </div>

              <div className="font-black text-base text-white mb-1">
                {event.institution.fullName}
              </div>
              <div className="font-mono text-xs text-white/70 leading-relaxed mb-4">
                {event.institution.address}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#00E5FF]">
                <span>COIMBATORE // TAMIL NADU</span>
                <span className="font-bold">PIN: 641062</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
