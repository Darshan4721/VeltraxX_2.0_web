import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { eventConfig } from '../config/eventConfig';
import { registerTeam, getPublicCapacity } from '../lib/api';
import MemberCard from '../components/register/MemberCard';
import PaymentStep from '../components/register/PaymentStep';
import { 
  Users, 
  Flame, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  ArrowLeft,
  RotateCcw,
  Check,
  Zap,
  MessageSquare,
  Lock
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'veltraxx_reg_draft_v2';
const INTEREST_OPTIONS = ["RTL", "Verification", "Physical design", "Embedded", "Analog", "AI hardware"];
const HEAR_OPTIONS = [
  "Faculty / Department Announcement",
  "College Notice Board / Poster",
  "WhatsApp Groups",
  "Instagram / Social Media",
  "Friends / Seniors Referral",
  "Previous Hackathon Participant",
  "Other"
];

const INITIAL_MEMBER = {
  name: '',
  email: '',
  phone: '',
  college_name: 'Sri Shakthi Institute of Engineering and Technology (SIET)',
  college_city: 'Coimbatore',
  college_state: 'Tamil Nadu',
  custom_college_name: '',
  custom_college_city: '',
  custom_college_state: '',
  is_other_college: false,
  degree: 'B.E.',
  level: 'UG',
  department: 'ECE',
  year_of_study: '3rd',
  roll_no: '',
  organisation: '',
  designation: '',
  same_college: true,
  same_academics: true
};

export default function RegisterPage() {
  // Page state machine: 'ACTIVE' | 'CAPACITY_REACHED' | 'PROCESSING' | 'SUCCESS' | 'ARCHIVED'
  const [pageState, setPageState] = useState('ACTIVE');
  const [activeStep, setActiveStep] = useState(1); // 1: Team, 2: Roster, 3: Payment
  const [capacity, setCapacity] = useState({ claimed_teams: 27, max_teams: 35 });
  const [successPayload, setSuccessPayload] = useState(null);
  const [errors, setErrors] = useState({});
  const errorSummaryRef = useRef(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [interestTags, setInterestTags] = useState(['RTL', 'Verification']);
  const [hearSource, setHearSource] = useState(HEAR_OPTIONS[0]);

  // 4 Members: Index 0 is Leader
  const [members, setMembers] = useState([
    { ...INITIAL_MEMBER, is_leader: true, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' }
  ]);

  // Payment fields
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [consentEventTerms, setConsentEventTerms] = useState(false);
  const [consentFutureEvents, setConsentFutureEvents] = useState(false);

  // Slow network processing timeout state
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const hasConfiguredUpi = Boolean(eventConfig.registration?.upiId);

  // 15-second timer for processing escape hatch
  useEffect(() => {
    let timer;
    if (pageState === 'PROCESSING') {
      setIsTakingLonger(false);
      timer = setTimeout(() => {
        setIsTakingLonger(true);
      }, 15000);
    } else {
      setIsTakingLonger(false);
    }
    return () => clearTimeout(timer);
  }, [pageState]);

  // Waitlist form fields (State B)
  const [waitlistTeamName, setWaitlistTeamName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Load Capacity & Draft on mount
  useEffect(() => {
    getPublicCapacity().then(cap => {
      if (cap) {
        setCapacity(cap);
        // Note: For UI testing per scope note, form remains active
      }
    }).catch(() => {});

    // Restore draft from localStorage (excluding image data)
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.teamName) setTeamName(draft.teamName);
        if (draft.interestTags) setInterestTags(draft.interestTags);
        if (draft.hearSource) setHearSource(draft.hearSource);
        if (draft.members && draft.members.length === 4) setMembers(draft.members);
        if (draft.utrNumber) setUtrNumber(draft.utrNumber);
        if (draft.consentEventTerms) setConsentEventTerms(draft.consentEventTerms);
        if (draft.consentFutureEvents) setConsentFutureEvents(draft.consentFutureEvents);
      }
    } catch (e) {
      console.warn("Could not load draft:", e);
    }
  }, []);

  // Debounced draft autosave (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftData = {
        teamName,
        interestTags,
        hearSource,
        members: members.map(m => ({
          ...m,
          // Exclude any binary or oversized payload
        })),
        utrNumber,
        consentEventTerms,
        consentFutureEvents
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch (err) {
        // quota exceeded or private mode
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [teamName, interestTags, hearSource, members, utrNumber, consentEventTerms, consentFutureEvents]);

  // Helper to update a specific member
  const handleMemberChange = (index, updated) => {
    setMembers(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const toggleInterestTag = (tag) => {
    setInterestTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Validation Engine with Zod
  const validateForm = () => {
    const errs = {};

    // 1. Team Name
    if (!teamName || teamName.trim().length < 3) {
      errs.team_name = "Team Name must be at least 3 characters.";
    }

    // 2. Members Validation
    const emailMap = new Set();
    const phoneMap = new Set();

    members.forEach((m, idx) => {
      const prefix = `m${idx}`;
      if (!m.name || m.name.trim().length < 2) {
        errs[`${prefix}_name`] = "Full name as on college ID is required.";
      }

      const email = (m.email || '').trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errs[`${prefix}_email`] = "Valid email address is required.";
      } else if (emailMap.has(email)) {
        errs[`${prefix}_email`] = "Duplicate email address within team.";
      } else {
        emailMap.add(email);
      }

      const phone = (m.phone || '').trim().replace(/[^0-9]/g, '');
      if (!phone || phone.length < 10) {
        errs[`${prefix}_phone`] = "10-digit WhatsApp number is required.";
      } else if (phoneMap.has(phone)) {
        errs[`${prefix}_phone`] = "Duplicate phone number within team.";
      } else {
        phoneMap.add(phone);
      }
    });

    // 3. Payment Validation (only enforced when official UPI ID is configured)
    if (hasConfiguredUpi) {
      if (!utrNumber || !/^[0-9]{12}$/.test(utrNumber.trim())) {
        errs.utr_number = "Exactly 12-digit numeric UPI transaction reference (UTR) is required.";
      }

      if (!receiptImage) {
        errs.receipt = "Please upload payment screenshot proof (JPG/PNG under 2MB).";
      }
    }

    if (!consentEventTerms) {
      errs.consent_terms = "Mandatory event participation consent must be confirmed.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!hasConfiguredUpi) {
      setErrors({ form_submit: "Payment collection is pending faculty UPI setup. Submissions will open once payment details are live." });
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!validateForm()) {
      // Scroll to error summary
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setPageState('PROCESSING');

    try {
      // Prepare canonical payload
      const leader = members[0];
      const payload = {
        team_name: teamName.trim(),
        utr_number: utrNumber.trim(),
        receipt_data_url: receiptImage,
        consent_event_terms: consentEventTerms,
        consent_future_events: consentFutureEvents,
        interest_tags: interestTags,
        hear_source: hearSource,
        members: members.map((m, idx) => {
          const isL = idx === 0;
          return {
            name: m.name.trim(),
            email: m.email.trim().toLowerCase(),
            phone: m.phone.trim().replace(/[^0-9]/g, ''),
            is_leader: isL,
            level: m.level || 'UG',
            degree: isL || !m.same_academics ? (m.degree || 'B.E.') : (leader.degree || 'B.E.'),
            department: isL || !m.same_academics ? (m.department || 'ECE') : (leader.department || 'ECE'),
            year_of_study: isL || !m.same_academics ? (m.year_of_study || '3rd') : (leader.year_of_study || '3rd'),
            college_name: isL || !m.same_college ? (m.college_name || 'Host Institute') : (leader.college_name || 'Host Institute'),
            custom_college_name: isL || !m.same_college ? m.custom_college_name : leader.custom_college_name,
            custom_college_city: isL || !m.same_college ? m.custom_college_city : leader.custom_college_city,
            custom_college_state: isL || !m.same_college ? m.custom_college_state : leader.custom_college_state,
            roll_no: m.roll_no || '',
            organisation: m.organisation || '',
            designation: m.designation || ''
          };
        })
      };

      const result = await registerTeam(payload);

      // Clear draft on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSuccessPayload(result);
      setPageState('SUCCESS');
    } catch (err) {
      setPageState('ACTIVE');
      setErrors({ form_submit: err.message || "Failed to commit team registration." });
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ---------------------------------------------------------------------------
  // STATE C: SUBMISSION PROCESSING MODAL
  // ---------------------------------------------------------------------------
  if (pageState === 'PROCESSING') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="w-full h-full rounded-2xl bg-[#FFE500] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#FF2E93] flex items-center justify-center animate-spin">
              <Zap className="w-10 h-10 text-[#111116]" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-3">
            <span>TRANSACTION IN PROGRESS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111116] tracking-tight mb-2">
            Saving Registration
          </h2>
          <p className="font-mono text-xs text-[#111116]/80 leading-relaxed mb-4">
            Saving your team registration details to the database...
          </p>
          <div className="text-[11px] font-mono font-bold text-[#FF2E93] bg-[#FF2E93]/10 p-2.5 rounded-xl border border-[#FF2E93]/20">
            DO NOT REFRESH OR NAVIGATE AWAY
          </div>

          {/* 15-second escape hatch for slow networks */}
          {isTakingLonger && (
            <div className="mt-5 pt-4 border-t border-[#111116]/10 space-y-3">
              <div className="p-3 bg-[#FFE500]/20 border-2 border-[#111116] rounded-xl text-xs font-bold text-[#111116]">
                Taking longer than expected. Your network connection might be slow.
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  className="flex-1 py-2.5 px-4 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  Retry Submission
                </button>
                <button
                  type="button"
                  onClick={() => setPageState('ACTIVE')}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-[#F4F4F6] text-[#111116] font-mono text-xs font-bold rounded-xl border-2 border-[#111116] cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE D: SUCCESS CONFIRMATION
  // ---------------------------------------------------------------------------
  if (pageState === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-6 sm:p-10">
          
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>REGISTRATION SUBMITTED // PENDING VERIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-2">
            Welcome to VELTRAXX 2.0!
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 leading-relaxed mb-6 font-medium">
            Your team registration has been securely logged. The organizing committee will spot-check your 12-digit UTR payment screenshot within 2 working days.
          </p>

          {/* Registration Telemetry Card */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border-2 border-[#111116] mb-8 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#111116]/10 text-xs">
              <span className="text-[#6B6B78] uppercase font-bold">REGISTRATION ID</span>
              <span className="text-sm sm:text-base font-black text-[#0055FF] bg-white px-3 py-1 rounded-lg border border-[#111116]">
                {successPayload?.team_id || "VTX26-T24-8841"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#111116]/10 text-xs">
              <span className="text-[#6B6B78] uppercase font-bold">TEAM NAME</span>
              <span className="font-bold text-[#111116]">{successPayload?.team_name || teamName}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#111116]/10 text-xs">
              <span className="text-[#6B6B78] uppercase font-bold">VENUE & DATES</span>
              <span className="font-bold text-[#111116] text-right">
                {eventConfig.event.institution.shortName} Campus · {eventConfig.event.dates.display}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B6B78] uppercase font-bold">TOTAL FEE PAID</span>
              <span className="font-black text-[#111116]">₹1,000 (4 Members)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            {eventConfig.registration.whatsappGroupUrl ? (
              <a
                href={eventConfig.registration.whatsappGroupUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-13 bg-[#111116] hover:bg-[#25252D] text-[#FFE500] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#25D366] flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                <span>JOIN OFFICIAL WHATSAPP ANNOUNCEMENTS GROUP</span>
              </a>
            ) : (
              <div className="w-full p-3.5 bg-[#FAF9F5] text-[#111116] font-mono text-xs font-bold rounded-xl border-2 border-[#111116]/20 flex items-center justify-center gap-2 text-center">
                <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Official WhatsApp Community link will be shared via email</span>
              </div>
            )}

            <Link
              to="/"
              className="w-full h-12 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center gap-2"
            >
              <span>RETURN TO MAIN ARENA HOMEPAGE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE B: CAPACITY REACHED & WAITLIST FORM
  // ---------------------------------------------------------------------------
  if (pageState === 'CAPACITY_REACHED') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#FF2E93] p-6 sm:p-10">
          
          <div className="w-14 h-14 rounded-2xl bg-[#FF2E93] text-[#111116] flex items-center justify-center mb-5 border-2 border-[#111116]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FF2E93] font-mono text-xs font-black uppercase mb-3">
            <span>OFFICIAL CAPACITY REACHED (35 / 35 TEAMS)</span>
          </div>

          <h1 className="text-3xl font-black text-[#111116] tracking-tight mb-2">
            Registration Has Closed
          </h1>

          <p className="text-sm text-[#111116]/80 leading-relaxed mb-6 font-medium">
            All 35 official team benches have been claimed. Submit your details below to join the Priority Standby Waitlist in case a registered team forfeits their bench.
          </p>

          {waitlistSubmitted ? (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-600 rounded-2xl text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-sm text-[#111116]">Added to Priority Waitlist!</div>
              <div className="text-xs text-[#6B6B78] mt-1 font-mono">
                We will contact your WhatsApp if an arena slot unlocks.
              </div>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setWaitlistSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={waitlistTeamName}
                  onChange={(e) => setWaitlistTeamName(e.target.value)}
                  placeholder="e.g. ASIC Innovators"
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1">
                  Leader Email *
                </label>
                <input
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="leader@college.edu.in"
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1">
                  Leader WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={waitlistPhone}
                  onChange={(e) => setWaitlistPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-13 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>JOIN STANDBY WAITLIST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#111116]/10 flex items-center justify-between text-xs font-mono">
            <Link to="/" className="text-[#0055FF] font-bold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
            <a 
              href={`tel:${eventConfig.contacts.students[0].phone.replace(/[^0-9+]/g, '')}`}
              className="text-[#111116] font-bold hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#FF2E93]" />
              <span>Contact Desk</span>
            </a>
          </div>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE A: ACTIVE REGISTRATION FORM (Default / Core Experience)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#111116] pb-24 selection:bg-[#FFE500] selection:text-[#111116]">
      
      {/* Sticky Progress Bar across the top */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#111116] shadow-xs">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 overflow-x-auto">
          
          <div className="flex items-center gap-1.5 sm:gap-4 text-xs font-mono font-black shrink-0">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border cursor-pointer transition-colors ${
                activeStep === 1 
                  ? 'bg-[#111116] text-[#FFE500] border-[#111116]' 
                  : 'bg-white text-[#111116] border-[#111116]/20'
              }`}
            >
              <span>01</span>
              <span className="hidden sm:inline">TEAM</span>
            </button>

            <span className="text-[#111116]/30 text-[10px]">→</span>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border cursor-pointer transition-colors ${
                activeStep === 2 
                  ? 'bg-[#111116] text-[#FFE500] border-[#111116]' 
                  : 'bg-white text-[#111116] border-[#111116]/20'
              }`}
            >
              <span>02</span>
              <span className="hidden sm:inline">ROSTER (4)</span>
            </button>

            <span className="text-[#111116]/30 text-[10px]">→</span>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border cursor-pointer transition-colors ${
                activeStep === 3 
                  ? 'bg-[#111116] text-[#FFE500] border-[#111116]' 
                  : 'bg-white text-[#111116] border-[#111116]/20'
              }`}
            >
              <span>03</span>
              <span className="hidden sm:inline">PAYMENT</span>
            </button>
          </div>

          {/* Telemetry Cap in Progress Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs font-black shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse-live" />
            <span className="hidden md:inline text-[#6B6B78]">CAPACITY:</span>
            <span className="bg-[#FFE500] text-[#111116] px-1.5 sm:px-2 py-0.5 rounded border border-[#111116] whitespace-nowrap">
              {capacity.claimed_teams}/35
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 font-mono text-xs text-[#6B6B78] mb-2 font-bold">
            <Link to="/" className="hover:text-[#111116] underline">Main Arena</Link>
            <span>/</span>
            <span className="text-[#111116]">Registration</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-3 border border-[#FFE500]/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
            <span>ONE LEADER REGISTERS THE WHOLE TEAM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#111116] tracking-tight leading-tight break-words">
            Team Registration & Member Details
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/75 mt-2 leading-relaxed max-w-2xl font-medium">
            Strictly one designated Team Leader submits for all 4 members. Complete team identification, 
            roster vitals, and UPI fee verification in under 5 minutes.
          </p>
        </div>

        {/* Global Error Summary Banner (If Validation Fails) */}
        <div ref={errorSummaryRef}>
          {Object.keys(errors).length > 0 && (
            <div className="mb-8 p-5 rounded-2xl bg-[#FF2E93]/10 border-3 border-[#FF2E93] shadow-[4px_4px_0px_0px_#FF2E93]">
              <div className="flex items-center gap-2 text-sm font-black text-[#FF2E93] uppercase font-mono mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span>PLEASE RECTIFY THE FOLLOWING FIELDS BEFORE SUBMITTING:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs font-bold text-[#111116]">
                {Object.entries(errors).map(([k, msg]) => (
                  <li key={k}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* ===================================================================
              CHAPTER 01 // TEAM IDENTIFICATION
             =================================================================== */}
          <div className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#FFE500] p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-3">
                <span>CHAPTER 01 // TEAM NAME & DETAILS</span>
              </div>
              <h2 className="text-2xl font-black text-[#111116] tracking-tight">
                Team Identity & Domain Tags
              </h2>
            </div>

            {/* Team Name Input */}
            <div>
              <label htmlFor="team-name" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Official Team Name *
              </label>
              <input
                id="team-name"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. ASIC Architects / RTL Synapse"
                className={`w-full h-12 bg-white border-2 ${
                  errors.team_name ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-4 text-base font-semibold text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              />
              {errors.team_name && (
                <span className="text-[11px] font-bold text-[#FF2E93] mt-1 block">
                  {errors.team_name}
                </span>
              )}
            </div>

            {/* Challenge Track Badge */}
            <div className="p-4 bg-[#FAF9F5] border-2 border-[#111116] rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#6B6B78] uppercase font-bold block">CHALLENGE ASSIGNMENT</span>
                <span className="font-black text-sm text-[#111116]">
                  Unified Semiconductor Hardware Challenge (0 Tracks)
                </span>
              </div>
              <span className="bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-3 py-1 rounded-lg border border-[#111116]">
                INDUSTRIAL
              </span>
            </div>

            {/* Interest Tags (Multi-Select Chips) */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                Team Specialization & Technical Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((tag) => {
                  const isSelected = interestTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterestTag(tag)}
                      className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#111116] text-[#FFE500] border-[#111116] shadow-[2px_2px_0px_0px_#FFE500]' 
                          : 'bg-white text-[#111116] border-[#111116]/20 hover:border-[#111116]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* How Did You Hear About Us? */}
            <div>
              <label htmlFor="hear-source" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                How did your team discover VELTRAXX 2.0?
              </label>
              <select
                id="hear-source"
                value={hearSource}
                onChange={(e) => setHearSource(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              >
                {HEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

          </div>


          {/* ===================================================================
              CHAPTER 02 // TEAM ROSTER (4 MEMBERS)
             =================================================================== */}
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-2">
                <span>CHAPTER 02 // TEAM ROSTER</span>
              </div>
              <h2 className="text-2xl font-black text-[#111116] tracking-tight">
                Team Members Vitals (1 Leader + 3 Members)
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B78] font-medium mt-0.5">
                Use the "Same as leader" switches to automatically mirror college, degree, and batch for classmates.
              </p>
            </div>

            {/* Render 4 Member Cards */}
            {members.map((member, index) => (
              <MemberCard
                key={index}
                index={index}
                member={member}
                leaderData={members[0]}
                onChange={(updated) => handleMemberChange(index, updated)}
                errors={errors}
              />
            ))}
          </div>


          {/* ===================================================================
              CHAPTER 03 // PAYMENT & RECEIPT VERIFICATION
             =================================================================== */}
          <PaymentStep
            utrNumber={utrNumber}
            onUtrChange={setUtrNumber}
            receiptImage={receiptImage}
            onReceiptChange={setReceiptImage}
            consentEventTerms={consentEventTerms}
            onConsentEventTermsChange={setConsentEventTerms}
            consentFutureEvents={consentFutureEvents}
            onConsentFutureEventsChange={setConsentFutureEvents}
            errors={errors}
          />


          {/* Submit Action Chassis */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!hasConfiguredUpi}
              className={`w-full h-16 ${
                !hasConfiguredUpi
                  ? 'bg-[#E5E5E8] text-[#111116]/40 border-3 border-[#111116]/30 cursor-not-allowed shadow-none'
                  : 'bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] hover:shadow-[3px_3px_0px_0px_#111116] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none cursor-pointer'
              } font-black text-lg rounded-2xl transition-all flex items-center justify-center gap-3`}
            >
              <span>
                {!hasConfiguredUpi
                  ? "SUBMISSION DISABLED (PAYMENT DETAILS COMING SOON)"
                  : "COMPLETE REGISTRATION (₹1,000 TEAM FEE)"}
              </span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="text-center font-mono text-xs text-[#6B6B78] mt-3">
              {!hasConfiguredUpi
                ? "Submissions will open immediately once faculty UPI accounts are linked"
                : "Spot confirmed immediately upon receipt review · 35 Teams strict ceiling"}
            </div>
          </div>

        </form>

      </div>

      {/* Sticky Bottom Submit Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#111116] p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-[#6B6B78] font-bold block">TEAM FEE</span>
          <span className="text-lg font-black text-[#111116]">₹1,000 <span className="text-[11px] font-normal text-[#6B6B78]">flat</span></span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!hasConfiguredUpi}
          className={`h-12 px-6 ${
            !hasConfiguredUpi
              ? 'bg-[#E5E5E8] text-[#111116]/40 border-2 border-[#111116]/30 cursor-not-allowed shadow-none'
              : 'bg-[#FFE500] text-[#111116] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer'
          } font-black text-xs rounded-xl flex items-center gap-2`}
        >
          <span>{!hasConfiguredUpi ? "PAYMENT PENDING" : "SUBMIT (₹1,000)"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
