import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { eventConfig } from '../config/eventConfig';
import { reserveCheckoutSlot, getWindowStatus, computeAcademicTier } from '../lib/api';
import { resolveDepartmentDraftCompatibility } from '../data/academics';
import MemberCard from '../components/register/MemberCard';
import PaymentCheckoutPanel, { PENDING_PAYMENT_STORAGE_KEY } from '../components/register/PaymentCheckoutPanel';
import {
  Users,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Download,
  CreditCard,
  Clock
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'veltraxx_reg_free_draft_v3';

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
  custom_degree: '',
  level: 'UG',
  department: '',
  custom_department: '',
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
  const [completedPayload, setCompletedPayload] = useState(null);
  const [errors, setErrors] = useState({});
  const errorSummaryRef = useRef(null);

  const [searchParams] = useSearchParams();
  const paramTrackId = searchParams.get('track');
  const paramProblemCode = searchParams.get('problem');
  const initialTrack = eventConfig.tracks.find(t => t.id === paramTrackId);

  // Step 1 Form State
  const [teamName, setTeamName] = useState('');
  const teamSize = 3; // Strictly fixed at 3 members (1 Leader + 2 Members)
  const [selectedTrackId, setSelectedTrackId] = useState(initialTrack?.id || '');
  const [problemCode, setProblemCode] = useState(paramProblemCode || '');
  const [members, setMembers] = useState([
    { ...INITIAL_MEMBER, is_leader: true, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' },
    { ...INITIAL_MEMBER, is_leader: false, name: '' }
  ]);

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

  const [copiedToken, setCopiedToken] = useState(null);
  const [windowStatus, setWindowStatus] = useState({ registration_open: true, max_teams_cap: 60, payment_reservation_minutes: 5 });

  // Step 2 Payment Popup State & Interrupted Session Restore
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(() => {
    try {
      const saved = sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    getWindowStatus().then(ws => {
      if (ws) setWindowStatus(ws);
    }).catch(() => {});
  }, []);

  const currentTrack = eventConfig.tracks.find(t => t.id === selectedTrackId);
  const availableProblems = currentTrack?.problems || [];

  const handleTrackChange = (newTrackId) => {
    setSelectedTrackId(newTrackId);
    setProblemCode('');
  };

  // Restore temporary form draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.teamName) setTeamName(draft.teamName);
        if (draft.members && Array.isArray(draft.members)) {
          const normalized = draft.members.slice(0, 3);
          while (normalized.length < 3) {
            normalized.push({ ...INITIAL_MEMBER, is_leader: false, name: '' });
          }
          normalized[0].is_leader = true;
          if (normalized[1]) normalized[1].is_leader = false;
          if (normalized[2]) normalized[2].is_leader = false;
          setMembers(normalized);
        }
        if (draft.selectedTrackId) setSelectedTrackId(draft.selectedTrackId);
        if (draft.problemCode) setProblemCode(draft.problemCode);
      }
    } catch (e) {
      console.warn('Could not load draft:', e);
    }
  }, []);

  // Autosave temporary form draft while ACTIVE
  useEffect(() => {
    if (pageState === 'SUCCESS') return;
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
      } catch {}
    }, 400);

    return () => clearTimeout(timer);
  }, [teamName, teamSize, selectedTrackId, problemCode, academicTier, members, pageState]);

  const handleMemberChange = (index, updated) => {
    setMembers(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const copyToClipboard = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedToken(type);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  // Validate all Step 1 fields (Does NOT check payment consent - consent lives inside Step 2 payment popup)
  const validateForm = () => {
    const errs = {};

    if (!teamName || teamName.trim().length < 3) {
      errs.team_name = 'Team Name must be at least 3 characters.';
    }
    if (!selectedTrackId) {
      errs.track_id = 'Please select a domain track.';
    }
    if (!problemCode) {
      errs.problem_code = 'Please select a problem statement code.';
    }

    const emailMap = new Set();
    const phoneMap = new Set();
    const leader = members[0] || {};

    members.slice(0, teamSize).forEach((m, idx) => {
      const prefix = `m${idx}`;
      const isL = idx === 0;
      if (!m.name || m.name.trim().length < 2) {
        errs[`${prefix}_name`] = 'Full name as on college ID is required.';
      }

      const email = (m.email || '').trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errs[`${prefix}_email`] = 'Valid email address is required.';
      } else if (emailMap.has(email)) {
        errs[`${prefix}_email`] = 'Duplicate email address within team.';
      } else {
        emailMap.add(email);
      }

      const phone = (m.phone || '').trim().replace(/[^0-9]/g, '');
      if (!phone || phone.length < 10) {
        errs[`${prefix}_phone`] = '10-digit WhatsApp phone number is required.';
      } else if (phoneMap.has(phone)) {
        errs[`${prefix}_phone`] = 'Duplicate phone number within team.';
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
            ? 'College / Institution is required for Team Leader.'
            : `College / Institution is required for Member 0${idx + 1}.`;
        }

        const degSource = isL || !m.same_academics ? m : leader;
        const deg = degSource.degree;
        if (!deg || !deg.trim()) {
          errs[`${prefix}_degree`] = isL
            ? 'Degree is required for Team Leader.'
            : `Degree is required for Member 0${idx + 1}.`;
        } else if (deg === 'Other' && (!degSource.custom_degree || degSource.custom_degree.trim().length < 2)) {
          errs[`${prefix}_custom_degree`] = isL
            ? 'Please enter the exact degree name for Team Leader.'
            : `Please enter the exact degree name for Member 0${idx + 1}.`;
        }

        const rawDept = degSource.department;
        const compat = resolveDepartmentDraftCompatibility(deg, rawDept);
        const effDept = compat.department || rawDept;
        const effCustomDept = degSource.custom_department || compat.customDepartment;

        if (!effDept || !effDept.trim()) {
          errs[`${prefix}_department`] = isL
            ? 'Department is required for Team Leader.'
            : `Department is required for Member 0${idx + 1}.`;
        } else if (effDept === 'Other' && (!effCustomDept || effCustomDept.trim().length < 2)) {
          errs[`${prefix}_custom_department`] = isL
            ? 'Please enter the exact department name for Team Leader.'
            : `Please enter the exact department name for Member 0${idx + 1}.`;
        }

        const yr = degSource.year_of_study;
        if (!yr || !yr.trim()) {
          errs[`${prefix}_year`] = isL
            ? 'Year of study is required for Team Leader.'
            : `Year of study is required for Member 0${idx + 1}.`;
        }
      } else {
        if (!m.organisation || !m.organisation.trim()) {
          errs[`${prefix}_organisation`] = 'Company / Organization is required.';
        }
        if (!m.designation || !m.designation.trim()) {
          errs[`${prefix}_designation`] = 'Designation / Role is required.';
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildNormalizedDraftPayload = () => {
    const leader = members[0];
    return {
      team_name: teamName.trim(),
      track_id: selectedTrackId,
      problem_code: problemCode,
      academic_tier: academicTier,
      team_size: teamSize,
      members: members.slice(0, teamSize).map((m, idx) => {
        const isL = idx === 0;
        const acadSrc = isL || !m.same_academics ? m : leader;
        const rawDeg = acadSrc.degree || '';
        const finalDegree = rawDeg === 'Other' ? (acadSrc.custom_degree || '').trim() : rawDeg;
        const compat = resolveDepartmentDraftCompatibility(rawDeg, acadSrc.department);
        const selDept = compat.department || acadSrc.department || '';
        const finalDepartment = selDept === 'Other'
          ? (acadSrc.custom_department || compat.customDepartment || '').trim()
          : selDept;

        const collegeName = isL || !m.same_college
          ? (m.is_other_college ? (m.custom_college_name || '').trim() : (m.college_name || ''))
          : (leader.is_other_college ? (leader.custom_college_name || '').trim() : (leader.college_name || ''));

        return {
          name: m.name.trim(),
          full_name: m.name.trim(),
          email: m.email.trim().toLowerCase(),
          phone: m.phone.trim().replace(/[^0-9]/g, ''),
          is_leader: isL,
          role: isL ? 'leader' : `member_${idx + 1}`,
          level: m.level || 'UG',
          degree: finalDegree,
          department: finalDepartment,
          year_of_study: acadSrc.year_of_study || '',
          roll_no: (m.roll_no || '').trim(),
          organisation: (m.organisation || '').trim(),
          designation: (m.designation || '').trim(),
          college_name: collegeName,
          gender: m.gender || 'Not specified'
        };
      })
    };
  };

  // Step 1 Action ("Proceed to Payment"): Checks capacity/duplicates & creates ONLY a temporary internal hold.
  // Does NOT create a completed team record, Team ID, or Sheets sync!
  const handleProceedToPayment = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!validateForm()) {
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setPageState('PROCESSING');

    try {
      const draftPayload = buildNormalizedDraftPayload();
      const idempotencyKey = pendingCheckout?.reservation?.idempotency_key || pendingCheckout?.idempotency_key || `vtx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

      const holdResult = await reserveCheckoutSlot({
        ...draftPayload,
        reservation_token: pendingCheckout?.reservation?.reservation_token || null,
        idempotency_key: idempotencyKey
      });

      const checkoutSession = {
        draft: draftPayload,
        reservation: {
          ...holdResult,
          idempotency_key: idempotencyKey
        }
      };

      try {
        sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(checkoutSession));
      } catch {}

      setPendingCheckout(checkoutSession);
      setPageState('ACTIVE');
      setIsPaymentModalOpen(true);
    } catch (err) {
      setPageState('ACTIVE');
      setErrors({ form_submit: err.message || 'Unable to verify seat availability before payment. Please review and retry.' });
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Step 3 Callback ("Complete Registration" succeeded on backend)
  const handleRegistrationComplete = (finalResult) => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
    } catch {}
    setPendingCheckout(null);
    setIsPaymentModalOpen(false);
    setCompletedPayload(finalResult);
    setPageState('SUCCESS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // STEP 1 PROCESSING OVERLAY (CHECKING CAPACITY & PREPARING PAYMENT)
  // =========================================================================
  if (pageState === 'PROCESSING') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#FFE500] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#B6FF00] flex items-center justify-center animate-spin">
            <Zap className="w-8 h-8 text-[#111116]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>VERIFYING ARENA CAPACITY (MAX 60 TEAMS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111116] tracking-tight mb-2">
            Preparing Payment Checkout
          </h2>
          <p className="font-mono text-xs text-[#111116]/80 leading-relaxed mb-4">
            Checking seat availability &amp; securing temporary 5-minute checkout hold...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 4: SUCCESS SCREEN (SHOWN ONLY AFTER MANDATORY PAYMENT SUBMISSION)
  // =========================================================================
  if (pageState === 'SUCCESS' && completedPayload) {
    const resolvedMembers = completedPayload.members || members;
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-6 sm:p-10">

          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFE500] text-[#111116] border-2 border-[#111116] font-mono text-xs font-black uppercase mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>PAYMENT STATUS: PENDING VERIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-3">
            Registration submitted successfully!
          </h1>

          <p className="text-sm sm:text-base text-[#111116] leading-relaxed mb-6 font-bold bg-[#B6FF00]/20 p-4 rounded-2xl border-2 border-[#111116]">
            Your payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.
          </p>

          {/* Official Team Summary & Verification Status */}
          <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] mb-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111116]/10">
              <div>
                <span className="text-[11px] text-[#111116]/60 uppercase font-black block">OFFICIAL TEAM ID</span>
                <span className="text-xl sm:text-2xl font-black text-[#0055FF]">
                  {completedPayload.team_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(completedPayload.team_id || '', 'team_id')}
                className="px-3 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedToken === 'team_id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken === 'team_id' ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <div className="text-xs text-[#111116]/85 space-y-1.5">
              <div><strong>Team Name:</strong> {completedPayload.team_name || teamName}</div>
              <div><strong>Track &amp; Problem Statement:</strong> {currentTrack?.name || completedPayload.track_id} ({completedPayload.problem_code || problemCode})</div>
              <div><strong>Team Size &amp; Fee Submitted:</strong> 3 Members · ₹1,500 (₹500 × 3)</div>
              <div><strong>Transaction Reference (UTR):</strong> {completedPayload.utr_number || 'Logged'}</div>
              <div>
                <strong>Verification Status:</strong>{' '}
                <span className="inline-block bg-[#FFE500] text-[#111116] px-2 py-0.5 rounded border border-[#111116] font-black">
                  PENDING VERIFICATION
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#111116]/15 space-y-1 text-[11px]">
              <div className="font-black text-[#111116] uppercase">Registered Members (3)</div>
              {resolvedMembers.slice(0, 3).map((m, i) => (
                <div key={i} className="text-[#111116]/80">
                  {i === 0 ? 'Leader' : `Member ${i + 1}`}: <strong>{m.full_name || m.name}</strong> ({m.email})
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <a
              href={eventConfig.registration?.downloads?.rulebookPdf || '/downloads/VELTRAXX_2.0_Rulebook.pdf'}
              download
              className="w-full py-3.5 px-4 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer h-12"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD OFFICIAL RULEBOOK (.PDF)</span>
            </a>
          </div>

          <div className="p-4 bg-[#00E5FF]/10 rounded-2xl border-2 border-[#00E5FF] mb-6 text-xs text-[#111116]/90 font-medium leading-relaxed">
            <strong>Manual Bank Verification Notice:</strong> Your participation is NOT yet confirmed until our organizing committee verifies actual bank credit for UTR <strong>{completedPayload.utr_number}</strong> and sends your official confirmation email from <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>.
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#111116]/10">
            <Link to="/" className="font-mono text-xs font-bold text-[#111116] hover:underline">
              ← Return to Homepage
            </Link>
            <span className="font-mono text-[11px] text-[#111116]/60">
              Helpdesk: {eventConfig.contacts?.confirmationSenderEmail}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 1 FORM + STEP 2 PAYMENT POPUP MODAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      <SeoHead route="/register" />

      {/* Step 2: Sticky-QR Payment Pop-Up Modal */}
      {isPaymentModalOpen && pendingCheckout?.draft && (
        <div
          className="fixed inset-0 z-50 bg-[#111116]/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="VELTRAXX 2.0 Team Fee Payment"
        >
          <div className="max-w-xl w-full rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#FFE500] overflow-hidden bg-white">
            <PaymentCheckoutPanel
              unifiedDraft={pendingCheckout.draft}
              reservation={pendingCheckout.reservation}
              isModal={true}
              onClose={() => setIsPaymentModalOpen(false)}
              onRegistrationComplete={handleRegistrationComplete}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-6 hover:text-[#0055FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT OVERVIEW</span>
        </Link>

        {/* Restore interrupted Step 2 payment popup banner */}
        {pendingCheckout?.draft && !isPaymentModalOpen && (
          <div className="mb-8 p-4 sm:p-5 bg-[#FFE500] border-3 border-[#111116] rounded-2xl shadow-[5px_5px_0px_0px_#111116] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono text-xs font-black uppercase text-[#111116]">
                INCOMPLETE REGISTRATION DRAFT · &ldquo;{pendingCheckout.draft.team_name}&rdquo;
              </div>
              <p className="text-xs font-bold text-[#111116]/80">
                Your registration is not finished yet. Reopen the ₹1,500 payment popup to upload your UTR &amp; screenshot.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2.5 bg-[#111116] text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Reopen Payment Popup →</span>
            </button>
          </div>
        )}

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
            <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
            <span>SINGLE-ROUND 24H ONSITE // CLOSES 12 DEC 2026 (11:59 PM IST)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#111116] tracking-tight leading-tight">
            Register Your Squad for <span className="underline decoration-[#FFE500] decoration-4">VELTRAXX 2.0</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-2 font-normal leading-relaxed">
            Strictly 3 members per team (1 Leader + 2 Members) · ₹500 per member (₹1,500 total) · Maximum 60 teams. Complete team details below, then submit your UPI payment evidence to finalize registration.
          </p>

          {windowStatus && windowStatus.registration_open === false && (
            <div className="mt-6 p-4 bg-[#FF2E93]/10 border-3 border-[#FF2E93] rounded-2xl font-mono text-xs font-bold text-[#111116] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0" />
              <span>Registrations are currently closed or full.</span>
            </div>
          )}
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

        <form onSubmit={handleProceedToPayment} className="space-y-10">
          {/* SECTION 01: TEAM SPECIFICATIONS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#111116]" />
                <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  SECTION 01 // TEAM SPECIFICATIONS
                </h2>
              </div>
              <span className="bg-[#FFE500] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
                ₹1,500 / TEAM
              </span>
            </div>

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

            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                Team Size (Number of Members) <span className="text-[#FF2E93]">*</span>
              </label>
              <div className="w-full min-h-[52px] py-2 px-4 rounded-xl font-mono text-xs font-black border-2 border-[#111116] bg-[#FFE500] text-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#111116]" />
                  <span>STRICTLY 3 MEMBERS (1 LEADER + 2 TEAM MEMBERS)</span>
                </span>
                <span className="text-[10px] bg-[#111116] text-[#FFE500] px-2 py-0.5 rounded font-mono font-bold leading-none">
                  FIXED
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[#111116]/60 font-mono">
                Every team must consist of exactly 1 Team Leader and 2 Team Members. Cross-department teams welcome.
              </p>
            </div>

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
                  {selectedTrackId ? '-- Select Problem Statement Code --' : '-- Select a Domain Track First --'}
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

          {/* SECTION 02: 3 TEAM MEMBERS */}
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-2">
                <span>SECTION 02 // TEAM ROSTER (3 MEMBERS)</span>
              </div>
              <h2 className="text-2xl font-black text-[#111116] tracking-tight">
                Team Member Details (1 Team Leader + 2 Team Members)
              </h2>
              <p className="text-xs sm:text-sm text-[#111116]/70 mt-0.5 font-normal">
                Member 01 is the designated Team Leader and primary recipient for official confirmation emails from vlsireseachlab@siet.ac.in.
              </p>
            </div>

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

          {/* SECTION 03: PROCEED TO MANDATORY PAYMENT STEP */}
          <div className="bg-[#FFE500]/15 rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#FFE500] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFE500] border border-[#111116]" />
                <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  SECTION 03 // FINAL STEP: PAYMENT EVIDENCE
                </h2>
              </div>
              <span className="bg-[#111116] text-[#FFE500] font-mono text-xs font-black px-2.5 py-0.5 rounded">
                ₹500 / MEMBER · ₹1,500 TOTAL
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#111116]/85 leading-relaxed font-medium">
              Your team registration is submitted ONLY after paying <strong>₹1,500 (₹500 × 3 members)</strong> and uploading your 12-digit UTR &amp; screenshot in the payment popup. Your form draft stays safely preserved until payment submission succeeds.
            </p>

            <button
              type="submit"
              className="w-full h-16 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] hover:shadow-[3px_3px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer font-black text-base sm:text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="text-center font-mono text-[11px] text-[#111116]/65">
              Opens sticky UPI QR payment popup · Checks 60-team capacity before payment
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
