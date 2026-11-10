import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { eventConfig } from '../config/eventConfig';
import { registerFreeTeam, getPublicCapacity, computeAcademicTier } from '../lib/api';
import MemberCard from '../components/register/MemberCard';
import { 
  Users, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Download,
  MessageSquare,
  FileText,
  Clock,
  Layers,
  Award
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'veltraxx_reg_free_draft_v3';

const TIER_METADATA = {
  tier_a: { label: 'TIER A: JUNIOR UG DIVISION', shortLabel: 'Tier A', desc: '1st & 2nd Year UG only · Foundational rubric' },
  tier_b: { label: 'TIER B: SENIOR & RESEARCH DIVISION', shortLabel: 'Tier B', desc: '3rd/4th/5th Year UG, PG, Research Scholar & Professional' }
};

const INITIAL_MEMBER = {
  name: '',
  email: '',
  phone: '',
  college_name: '',
  college_city: '',
  college_state: '',
  custom_college_name: '',
  custom_college_city: '',
  custom_college_state: '',
  is_other_college: false,
  degree: '',
  level: 'UG',
  department: '',
  year_of_study: '',
  roll_no: '',
  organisation: '',
  designation: '',
  same_college: true,
  same_academics: true
};

export default function RegisterPage() {
  // Page state machine: 'ACTIVE' | 'PROCESSING' | 'SUCCESS'
  const [pageState, setPageState] = useState('ACTIVE');
  const [successPayload, setSuccessPayload] = useState(null);
  const [errors, setErrors] = useState({});
  const errorSummaryRef = useRef(null);

  const [searchParams] = useSearchParams();
  const paramTrackId = searchParams.get('track');
  const paramProblemCode = searchParams.get('problem');
  const initialTrack = eventConfig.tracks.find(t => t.id === paramTrackId);

  // Form State: Team Identity & Track
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(4); // 2, 3, or 4 members
  const [selectedTrackId, setSelectedTrackId] = useState(initialTrack?.id || '');
  const [problemCode, setProblemCode] = useState(paramProblemCode || '');
  // Members array (Length matches teamSize)
  const [members, setMembers] = useState([
    { ...INITIAL_MEMBER, is_leader: true, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' }
  ]);

  // Dynamic Academic Tier: auto-computed via member seniority (R1 Anti-Exploit)
  // If ALL members are 1st/2nd Year UG -> tier_a (Junior UG Division)
  // If ANY member is 3rd/4th/5th Year UG, PG, Research Scholar, or Working Professional -> tier_b (Senior & Research Division)
  const academicTier = useMemo(() => {
    const activeMembers = members.slice(0, teamSize);
    const leader = activeMembers[0] || {};
    const resolvedMembers = activeMembers.map((m, idx) => {
      const isL = idx === 0;
      return {
        ...m,
        level: isL || !m.same_academics ? (m.level || 'UG') : (leader.level || 'UG'),
        year_of_study: isL || !m.same_academics ? (m.year_of_study || '') : (leader.year_of_study || '')
      };
    });
    return computeAcademicTier(resolvedMembers);
  }, [members, teamSize]);

  // Mandatory Free Round 1 Consent
  const [consentRound1Terms, setConsentRound1Terms] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // When track changes, update available problems without forcing problemCode
  const currentTrack = eventConfig.tracks.find(t => t.id === selectedTrackId);
  const availableProblems = currentTrack?.problems || [];

  const handleTrackChange = (newTrackId) => {
    setSelectedTrackId(newTrackId);
    setProblemCode(''); // Let participant explicitly choose their problem statement
  };

  // Adjust members count dynamically when teamSize changes
  const handleTeamSizeChange = (newSize) => {
    setTeamSize(newSize);
    setMembers(prev => {
      if (newSize > prev.length) {
        const added = Array.from({ length: newSize - prev.length }, () => ({
          ...INITIAL_MEMBER,
          is_leader: false,
          name: ''
        }));
        return [...prev, ...added];
      } else {
        return prev.slice(0, newSize);
      }
    });
  };

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.teamName) setTeamName(draft.teamName);
        if (draft.teamSize) {
          setTeamSize(draft.teamSize);
          if (draft.members && draft.members.length === draft.teamSize) {
            setMembers(draft.members);
          }
        }
        if (draft.selectedTrackId) setSelectedTrackId(draft.selectedTrackId);
        if (draft.problemCode) setProblemCode(draft.problemCode);
      }
    } catch (e) {
      console.warn("Could not load draft:", e);
    }
  }, []);

  // Autosave draft
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftData = {
        teamName,
        teamSize,
        selectedTrackId,
        problemCode,
        academicTier,
        members
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      } catch (err) {}
    }, 400);

    return () => clearTimeout(timer);
  }, [teamName, teamSize, selectedTrackId, problemCode, academicTier, members]);

  // Update a single member
  const handleMemberChange = (index, updated) => {
    setMembers(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  // Copy helper
  const copyToClipboard = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedToken(type);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  // Download team confirmation slip as .txt
  const downloadRegistrationSlip = () => {
    if (!successPayload) return;
    const slipText = `======================================================================
VELTRAXX 2.0: OFFICIAL ROUND 1 REGISTRATION SLIP
Department of EE (VLSI Design & Technology)
Sri Shakthi Institute of Engineering and Technology, Coimbatore
======================================================================

TEAM IDENTIFIER: ${successPayload.team_id}
(Keep your Team ID safe. You will need it to upload your 6-slide PPT blueprint
between Dec 02 (00:00 IST) and Dec 03 (23:59 IST) on our submission portal.)

TEAM DETAILS:
- Team Name: ${successPayload.team_name}
- Domain Track: ${currentTrack?.name} (${currentTrack?.code})
- Problem Statement: ${problemCode}
- Academic Category: ${academicTier === 'tier_a' ? 'TIER A (JUNIOR UG DIVISION)' : 'TIER B (SENIOR & RESEARCH DIVISION)'}
- Total Members: ${teamSize}

ROSTER:
${members.map((m, i) => `Member ${i + 1} (${i === 0 ? 'Leader' : 'Member'}):
  Name: ${m.name}
  Email: ${m.email}
  Phone: ${m.phone}
  College: ${m.college_name || m.custom_college_name || 'SIET'}
  Department: ${m.department} (${m.year_of_study})
`).join('\n')}
NEXT STEPS:
1. Download official 6-slide PPT template from https://veltraxx.com
2. Complete your architecture & block diagrams.
3. Submit your completed PPT as a PDF on 02-03 Dec 2026.
4. Shortlisted teams will be called for Round 2 on 15-16 Dec @ SIET.

Support: Dr. P. DhilipKumar (HOD) - +91-9629561731
Student Coordinators: R.A. Darshan (+91-9751340838) / Subiksha L (+91-9344705387)
======================================================================`;

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VELTRAXX_${successPayload.team_id}_Registration_Slip.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};

    if (!teamName || teamName.trim().length < 3) {
      errs.team_name = "Team Name must be at least 3 characters.";
    }

    if (!selectedTrackId) {
      errs.track_id = "Please select a domain track.";
    }

    if (!problemCode) {
      errs.problem_code = "Please select a problem statement code.";
    }

    const emailMap = new Set();
    const phoneMap = new Set();
    const leader = members[0] || {};

    members.slice(0, teamSize).forEach((m, idx) => {
      const prefix = `m${idx}`;
      const isL = idx === 0;
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
        errs[`${prefix}_phone`] = "10-digit WhatsApp phone number is required.";
      } else if (phoneMap.has(phone)) {
        errs[`${prefix}_phone`] = "Duplicate phone number within team.";
      } else {
        phoneMap.add(phone);
      }

      const isWorkingProf = m.level === 'Working professional';
      if (!isWorkingProf) {
        const college = isL || !m.same_college
          ? (m.is_other_college ? m.custom_college_name : m.college_name)
          : (leader.is_other_college ? leader.custom_college_name : leader.college_name);
        if (!college || !college.trim()) {
          errs[`${prefix}_college`] = isL
            ? "College / Institution is required for Team Leader."
            : `College / Institution is required for Member 0${idx + 1}.`;
        }

        const dept = isL || !m.same_academics ? m.department : leader.department;
        if (!dept || !dept.trim()) {
          errs[`${prefix}_department`] = isL
            ? "Department is required for Team Leader."
            : `Department is required for Member 0${idx + 1}.`;
        }

        const deg = isL || !m.same_academics ? m.degree : leader.degree;
        if (!deg || !deg.trim()) {
          errs[`${prefix}_degree`] = isL
            ? "Degree is required for Team Leader."
            : `Degree is required for Member 0${idx + 1}.`;
        }

        const yr = isL || !m.same_academics ? m.year_of_study : leader.year_of_study;
        if (!yr || !yr.trim()) {
          errs[`${prefix}_year`] = isL
            ? "Year of study is required for Team Leader."
            : `Year of study is required for Member 0${idx + 1}.`;
        }
      } else {
        if (!m.organisation || !m.organisation.trim()) {
          errs[`${prefix}_organisation`] = "Company / Organization is required.";
        }
        if (!m.designation || !m.designation.trim()) {
          errs[`${prefix}_designation`] = "Designation / Role is required.";
        }
      }
    });

    if (!consentRound1Terms) {
      errs.consent_terms = "You must confirm the Round 1 submission and shortlisting guidelines.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!validateForm()) {
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setPageState('PROCESSING');

    try {
      const leader = members[0];
      const payload = {
        team_name: teamName.trim(),
        track_id: selectedTrackId,
        problem_code: problemCode,
        academic_tier: academicTier,
        team_size: teamSize,
        members: members.slice(0, teamSize).map((m, idx) => {
          const isL = idx === 0;
          return {
            name: m.name.trim(),
            email: m.email.trim().toLowerCase(),
            phone: m.phone.trim().replace(/[^0-9]/g, ''),
            is_leader: isL,
            role: isL ? 'leader' : `member_${idx + 1}`,
            level: m.level || 'UG',
            degree: isL || !m.same_academics ? (m.degree || '') : (leader.degree || ''),
            department: isL || !m.same_academics ? (m.department || '') : (leader.department || ''),
            year_of_study: isL || !m.same_academics ? (m.year_of_study || '') : (leader.year_of_study || ''),
            college_name: isL || !m.same_college ? (m.college_name || '') : (leader.college_name || ''),
            custom_college_name: isL || !m.same_college ? m.custom_college_name : leader.custom_college_name,
            custom_college_city: isL || !m.same_college ? m.custom_college_city : leader.custom_college_city,
            custom_college_state: isL || !m.same_college ? m.custom_college_state : leader.custom_college_state,
            gender: m.gender || 'Not specified'
          };
        })
      };

      const result = await registerFreeTeam(payload);

      // Clear draft on success
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSuccessPayload(result);
      setPageState('SUCCESS');
    } catch (err) {
      setPageState('ACTIVE');
      setErrors({ form_submit: err.message || "Failed to submit free registration. Please check fields and retry." });
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // =========================================================================
  // STATE C: PROCESSING MODAL
  // =========================================================================
  if (pageState === 'PROCESSING') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#FFE500] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] flex items-center justify-center animate-spin">
            <Zap className="w-8 h-8 text-[#111116]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>REGISTERING TEAM (₹0 FREE ENTRY)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111116] tracking-tight mb-2">
            Generating Team ID
          </h2>
          <p className="font-mono text-xs text-[#111116]/80 leading-relaxed mb-4">
            Creating atomic Team ID in database...
          </p>
          <div className="text-[11px] font-mono font-bold text-[#FF2E93] bg-[#FF2E93]/10 p-2.5 rounded-xl border border-[#FF2E93]/20">
            DO NOT REFRESH OR NAVIGATE AWAY
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE D: SUCCESS CONFIRMATION (PATCH 2 ENHANCED)
  // =========================================================================
  if (pageState === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-6 sm:p-10">
          
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>ROUND 1 REGISTRATION CONFIRMED // 100% FREE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-2">
            Team Registration Successful!
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 leading-relaxed mb-6 font-medium">
            Your team is officially registered for Round 1. Save your Team ID below to submit your 6-slide PPT blueprint.
          </p>

          {/* Tokens Chassis */}
          <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] mb-6 space-y-4 font-mono">
            
            {/* Team ID Token */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111116]/10">
              <div>
                <span className="text-[11px] text-[#111116]/60 uppercase font-black block">YOUR TEAM ID</span>
                <span className="text-xl sm:text-2xl font-black text-[#0055FF]">
                  {successPayload?.team_id || "VTX2-048"}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(successPayload?.team_id || "VTX2-048", 'team_id')}
                className="px-3 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedToken === 'team_id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken === 'team_id' ? "COPIED" : "COPY"}</span>
              </button>
            </div>

            {/* Team Summary */}
            <div className="text-xs text-[#111116]/80 space-y-1">
              <div><strong>Team Name:</strong> {successPayload?.team_name || teamName}</div>
              <div><strong>Track:</strong> {currentTrack?.name} ({problemCode})</div>
              <div><strong>Evaluation Tier:</strong> {academicTier === 'tier_a' ? 'Tier A (Junior UG Division)' : 'Tier B (Senior & Research Division)'}</div>
              <div><strong>Team Size:</strong> {teamSize} Members · <strong>Fee:</strong> ₹0 (Free Entry)</div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={downloadRegistrationSlip}
              className="w-full py-3.5 px-4 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              <FileText className="w-4 h-4" />
              <span>DOWNLOAD TEAM REGISTRATION SLIP (.TXT)</span>
            </button>

            <a
              href={eventConfig.whatsappUrl || "https://chat.whatsapp.com/invite/veltraxx2026"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              <MessageSquare className="w-4 h-4" />
              <span>JOIN OFFICIAL WHATSAPP ANNOUNCEMENTS GROUP</span>
            </a>

            <a
              href="/downloads/VELTRAXX_2.0_Round1_Template.pptx"
              download
              className="w-full py-3.5 px-4 bg-white hover:bg-[#F4F4F6] text-[#111116] font-mono text-xs font-black rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD OFFICIAL 6-SLIDE PPT TEMPLATE (.PPTX)</span>
            </a>

            <a
              href="/downloads/VELTRAXX_2.0_Round1_Reference_Example.pptx"
              download
              className="w-full py-3.5 px-4 bg-white hover:bg-[#FF2E93]/10 text-[#111116] hover:text-[#FF2E93] font-mono text-xs font-black rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#FF2E93] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              <Download className="w-4 h-4 text-[#FF2E93]" />
              <span>DOWNLOAD SAMPLE REFERENCE DECK (.PPTX)</span>
            </a>
          </div>

          {/* Guidance Callout */}
          <div className="p-4 bg-[#00E5FF]/10 rounded-2xl border-2 border-[#00E5FF] mb-6 text-xs text-[#111116]/90 font-medium leading-relaxed">
            <strong>Next Milestone:</strong> The 48-Hour PPT Submission portal unlocks on <strong>02 Dec 2026 (00:00 IST)</strong>. If you ever forget your Team ID, you can use the <em>"Forgot Team ID? Lookup by Email/Phone"</em> tool on the submission portal anytime.
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#111116]/10">
            <Link to="/" className="font-mono text-xs font-bold text-[#111116] hover:underline">
              ← Return to Homepage
            </Link>
            <Link to="/submit-ppt" className="font-mono text-xs font-black text-[#0055FF] hover:underline">
              View PPT Submission Portal →
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE A: ACTIVE REGISTRATION FORM
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic SEO Head Management */}
      <SeoHead route="/register" />

      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-8 hover:text-[#0055FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT OVERVIEW</span>
        </Link>

        {/* Form Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#B6FF00] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#B6FF00] shadow-[2px_2px_0px_0px_#B6FF00]">
            <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
            <span>ROUND 1 // 100% FREE REGISTRATION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#111116] tracking-tight leading-tight">
            Register Your Team for <span className="underline decoration-[#FFE500] decoration-4">Round 1</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-2 font-normal leading-relaxed">
            Form a team of 2 to 4 engineers. Select your domain from 25 problem statements and lock in your registration for ₹0. Submissions open on Dec 2-3.
          </p>
        </div>

        {/* Global Error Summary Banner */}
        {Object.keys(errors).length > 0 && (
          <div 
            ref={errorSummaryRef} 
            tabIndex={-1} 
            role="alert" 
            aria-live="assertive" 
            className="mb-8 p-5 bg-[#FF2E93]/10 border-3 border-[#FF2E93] rounded-2xl shadow-[4px_4px_0px_0px_#FF2E93] focus:outline-none focus:ring-2 focus:ring-[#FF2E93]"
          >
            <div className="flex items-center gap-2 font-mono text-xs font-black text-[#FF2E93] uppercase mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>PLEASE CORRECT THE FOLLOWING ERRORS:</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-[#111116]">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-[#FF2E93] font-black shrink-0 mt-0.5">•</span>
                  <span className="break-words font-bold">{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Multi-Section Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* ===================================================================
              SECTION 01: TEAM IDENTITY, SIZE, TRACK & TIER
             =================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#111116]" />
                <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  SECTION 01 // TEAM SPECIFICATIONS
                </h2>
              </div>
              <span className="bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
                ₹0 FREE ENTRY
              </span>
            </div>

            {/* Team Name */}
            <div>
              <label htmlFor="team-name" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Official Team Name <span className="text-[#FF2E93]">*</span>
              </label>
              <input
                id="team-name"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Silicon Synapse, Neural RTL"
                className={`w-full h-12 bg-white border-2 ${
                  errors.team_name ? 'border-[#FF2E93] bg-[#FF2E93]/5' : 'border-[#111116]'
                } rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              />
              {errors.team_name && (
                <p className="mt-1 font-mono text-xs text-[#FF2E93] font-bold">{errors.team_name}</p>
              )}
            </div>

            {/* Dynamic Team Size Selector */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                Team Size (Number of Members) <span className="text-[#FF2E93]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[2, 3, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleTeamSizeChange(size)}
                    className={`min-h-[52px] py-1.5 px-2 rounded-xl font-mono text-xs font-black border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      teamSize === size
                        ? 'bg-[#FFE500] text-[#111116] border-[#111116] shadow-[3px_3px_0px_0px_#111116]'
                        : 'bg-white text-[#111116] border-[#111116]/20 hover:border-[#111116]'
                    }`}
                  >
                    <span className="whitespace-nowrap">{size} MEMBERS</span>
                    {size === 4 && (
                      <span className="text-[9px] sm:text-[10px] bg-[#111116] text-[#FFE500] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap leading-none">
                        DEFAULT
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#111116]/60 font-mono">
                Dynamically adjusts member cards below. Cross-department teams welcome.
              </p>
            </div>

            {/* Track Selector */}
            <div>
              <label htmlFor="track-select" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Select Domain Track <span className="text-[#FF2E93]">*</span>
              </label>
              <select
                id="track-select"
                value={selectedTrackId}
                onChange={(e) => handleTrackChange(e.target.value)}
                className={`w-full h-12 bg-white border-2 ${
                  errors.track_id ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              >
                <option value="">-- Select Domain Track --</option>
                {eventConfig.tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code}: {t.name}
                  </option>
                ))}
              </select>
              {errors.track_id && (
                <p className="mt-1 font-mono text-xs text-[#FF2E93] font-bold">{errors.track_id}</p>
              )}
            </div>

            {/* Problem Statement Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="problem-code" className="font-mono text-xs font-black uppercase text-[#111116]">
                  Problem Statement Code <span className="text-[#FF2E93]">*</span>
                </label>
                <a
                  href="/downloads/VELTRAXX_2.0_Problem_Statements.pdf"
                  download
                  className="font-mono text-[11px] font-bold text-[#0055FF] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Problem Book (.PDF)</span>
                </a>
              </div>
              <select
                id="problem-code"
                value={problemCode}
                onChange={(e) => setProblemCode(e.target.value)}
                disabled={!selectedTrackId}
                className={`w-full h-12 bg-white border-2 ${
                  errors.problem_code ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500] disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {selectedTrackId ? "-- Select Problem Statement Code --" : "-- Select a Domain Track First --"}
                </option>
                {availableProblems.map((prob) => (
                  <option key={prob.code} value={prob.code}>
                    {prob.code}: {prob.title}
                  </option>
                ))}
              </select>
              {errors.problem_code && (
                <p className="mt-1 font-mono text-xs text-[#FF2E93] font-bold">{errors.problem_code}</p>
              )}
            </div>

          </div>


          {/* ===================================================================
              SECTION 02: DYNAMIC TEAM MEMBER ROSTER
             =================================================================== */}
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-2">
                <span>SECTION 02 // TEAM ROSTER ({teamSize} MEMBERS)</span>
              </div>
              <h2 className="text-2xl font-black text-[#111116] tracking-tight">
                Team Member Details (1 Leader + {teamSize - 1} Members)
              </h2>
              <p className="text-xs sm:text-sm text-[#111116]/70 mt-0.5 font-normal">
                Member 01 is the designated Team Leader and primary contact for shortlisting phone calls and email verification.
              </p>
            </div>

            {/* Live Dynamic Computed Evaluation Tier Badge (R1 Anti-Exploit) */}
            <div className="mb-6 p-4 rounded-2xl border-3 border-[#111116] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#111116]">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#111116] shrink-0 ${
                  academicTier === 'tier_a' ? 'bg-[#00E5FF]' : 'bg-[#FFE500]'
                }`} />
                <div className="font-mono text-xs font-black text-[#111116] flex flex-wrap items-center gap-1.5">
                  <span>Computed Evaluation Tier:</span>
                  <span className={`px-2.5 py-1 rounded-md border-2 border-[#111116] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#111116] ${
                    academicTier === 'tier_a' ? 'bg-[#00E5FF] text-[#111116]' : 'bg-[#FFE500] text-[#111116]'
                  }`}>
                    {academicTier === 'tier_a' ? 'Tier A (Junior UG Division)' : 'Tier B (Senior & Research Division)'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#6B6B78]">
                (Determined by highest member seniority)
              </span>
            </div>

            {/* Render dynamic member cards */}
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
              SECTION 03: 100% FREE ROUND 1 CONFIRMATION BOX (ZERO-FEE BOX)
             =================================================================== */}
          <div className="bg-[#B6FF00]/15 rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#B6FF00] space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B6FF00] border border-[#111116]" />
                <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  SECTION 03 // ZERO-FEE ROUND 1 CONFIRMATION
                </h2>
              </div>
              <span className="bg-[#111116] text-[#B6FF00] font-mono text-xs font-black px-2.5 py-0.5 rounded">
                ₹0 / TEAM
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#111116] tracking-tight mb-2">
                Round 1 Registration is 100% Free
              </h3>
              <p className="text-xs sm:text-sm text-[#111116]/85 leading-relaxed font-medium">
                There is zero registration fee for Round 1 ideation and PPT submission. Every valid team that uploads their 6-slide architecture between Dec 2 (00:00) and Dec 3 (23:59) receives a verified Digital Certificate of Ideation. Shortlisted teams will be invited to the 24-hour offline finale at SIET Coimbatore.
              </p>
            </div>

            {/* Mandatory Consent Checkbox */}
            <div className="p-4 bg-white rounded-2xl border-2 border-[#111116]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentRound1Terms}
                  onChange={(e) => setConsentRound1Terms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-2 border-[#111116] text-[#111116] focus:ring-[#B6FF00] shrink-0"
                />
                <span className="text-xs text-[#111116] leading-relaxed font-bold">
                  We confirm our team will submit our 6-slide PPT on Dec 2-3, 2026 via this portal, and understand that only shortlisted teams will be invited to confirm seats for the Dec 15-16 offline finale at SIET. <span className="text-[#FF2E93]">*</span>
                </span>
              </label>
              {errors.consent_terms && (
                <p className="mt-2 font-mono text-xs text-[#FF2E93] font-black">{errors.consent_terms}</p>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full h-16 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] hover:shadow-[3px_3px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer font-black text-base sm:text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <span>COMPLETE FREE ROUND 1 REGISTRATION (₹0) →</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="text-center font-mono text-[11px] text-[#111116]/60">
              Immediate Team ID issued upon submission · Confirmation email sent to team leader
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
