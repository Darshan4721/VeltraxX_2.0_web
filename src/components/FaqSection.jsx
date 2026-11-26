import React, { useState } from 'react';
import { eventConfig } from '../config/eventConfig';
import { ChevronDown, Building, Users, MapPin, HelpCircle } from 'lucide-react';
import ContactActionGroup from './ContactActionGroup';

export default function FaqSection() {
  const { contacts, event } = eventConfig;
  
  const faqs = [
    {
      q: "Is there any online preliminary round or PPT submission?",
      a: "No. VELTRAXX 2.0 is a direct single-round, 24-hour onsite hackathon held on December 15-16, 2026 at SIET Coimbatore. No preliminary PPT upload or online shortlisting is required."
    },
    {
      q: "What is the registration fee and how is our team registration completed?",
      a: "The fee is ₹500 per member (₹1,500 total per 3-member team). VELTRAXX 2.0 has one unified paid registration flow: fill the 3-member form, click Proceed to Payment, accept the rules in the checkout popup, transfer ₹1,500 via UPI, and upload your 12-digit UTR and screenshot to Complete Registration. Official confirmation emails are sent manually from vlsireseachlab@siet.ac.in after bank credit verification."
    },
    {
      q: "Who is eligible to participate and what is the team size?",
      a: "Team size is strictly fixed at 3 members (1 Team Leader + 2 Team Members). Open to all academic disciplines across UG, PG, and research scholars, subject to applicable institutional eligibility and minor-safety requirements. Capacity is strictly capped at 60 teams (180 participants)."
    },
    {
      q: "When do registrations close and how does checkout capacity protection work?",
      a: "Registrations close on December 12, 2026 at 11:59 PM IST (or earlier once all 60 team seats are filled). Clicking Proceed to Payment holds your seat temporarily for 5 minutes while you complete the UPI transfer and screenshot upload; your registration is recorded only when Complete Registration succeeds."
    },
    {
      q: "What food and facilities are provided during the 24-hour hackathon?",
      a: "Food (3 meals) and 2 refreshments are included across the 24-hour onsite hackathon, alongside lab power desks and high-speed campus Wi-Fi. Bring your own laptops, chargers, hardware kits, and valid college ID cards."
    },
    {
      q: "What are the rewards for winning teams?",
      a: "Winning teams receive the VELTRAXX 2.0 Trophy, Cash Prize rewards (exact prize amounts to be revealed later by the organizing committee), and VLSI internship opportunities subject to approved arrangements."
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
            Everything you need to know about single-round registration, ₹1,500 team confirmation, 60-team capacity, and onsite logistics. Reach out directly to faculty convenors and student coordinators.
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
                {event.institution.name}
              </div>
              <div className="font-mono text-xs text-white/70 leading-relaxed mb-4">
                {event.institution.department} · {event.institution.campus}
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
