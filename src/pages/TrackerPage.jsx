import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  getTrackerRoster, 
  getLiveEventState, 
  adminUpdateTeamStatus,
  adminLogin,
  exportRegistrationsToXLSX,
  adminDeleteTeam,
  getAdminOverview,
  adminUpdateEventState,
  adminVerifyRound2Payment,
  adminGrantPaymentAccess,
  adminRetrySyncJob,
  fetchProtectedDriveFileBlobUrl,
  getFreshCoordinatorToken
} from '../lib/api';
import { eventConfig } from '../config/eventConfig';
import { supabase, isPreviewWriteBlocked } from '../lib/supabaseClient';
import { 
  ShieldLock, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail, 
  ExternalLink, 
  X, 
  CheckCircle, 
  Clock, 
  Building, 
  FileText, 
  KeyRound, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  Square, 
  Radio, 
  Eye, 
  Sliders, 
  DollarSign,
  UserCheck,
  AlertOctagon,
  Lock,
  ArrowLeft,
  FolderOpen,
  Trophy,
  Minimize2,
  Maximize2,
  Layers,
  Columns,
  Sparkles,
  Copy,
  Check,
  Send,
  MailCheck,
  Trash2
} from 'lucide-react';

const AUTH_STORAGE_KEY = 'veltraxx_admin_auth_v2';
const EVENT_STATE_STORAGE_KEY = 'veltraxx_event_state';

export default function TrackerPage() {
  const [authData, setAuthData] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Chrome-Style Tab State: 'ROUND1' | 'ROUND2' | 'ATTENDANCE' | 'CLOCK'
  const [activeTab, setActiveTab] = useState('ROUND1');

  // Teams Roster
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [round1Filter, setRound1Filter] = useState('ALL'); // ALL, PENDING, VERIFIED, REJECTED
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [inspectModalTeam, setInspectModalTeam] = useState(null);
  const [receiptPreviewTeam, setReceiptPreviewTeam] = useState(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState('');
  const [receiptLoadError, setReceiptLoadError] = useState('');
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

  // Manual Refresh & Feedback State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState('');
  const loadRequestIdRef = useRef(0);
  const refreshToastTimeoutRef = useRef(null);

  // 1-Click Copy Passcode Feedback State
  const [copiedPasscodeTeamId, setCopiedPasscodeTeamId] = useState(null);

  // Permanent Delete Confirmation State
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Server-backed Admin Overview & Single-Round Cap/Window State
  const [adminOverview, setAdminOverview] = useState({ sync_jobs: [], recent_attempts: [], audit_logs: [], window_status: null, event_state: null });
  const [round1OpenToggle, setRound1OpenToggle] = useState(true);
  const [paymentOpenToggle, setPaymentOpenToggle] = useState(false);
  const [maxTeamsCapInput, setMaxTeamsCapInput] = useState(60);
  const [reservationMinsInput, setReservationMinsInput] = useState(5);
  const [regOverride, setRegOverride] = useState('AUTO');
  const [retryingSyncId, setRetryingSyncId] = useState(null);
  const [opsToast, setOpsToast] = useState('');

  const derivePaymentStatus = (team) => {
    if ((team?.round1_status || '').toLowerCase() === 'rejected') return 'REJECTED';
    if (team?.is_paid_verified) return 'VERIFIED';
    return 'PENDING';
  };

  const buildGmailComposeUrl = (team) => {
    const membersList = Array.isArray(team?.members) ? team.members : [];
    const leaderEmail = membersList[0]?.email || '';
    const ccEmails = membersList
      .slice(1)
      .map((m) => (m.email || '').trim())
      .filter(Boolean)
      .join(',');
    const trackObj = eventConfig.tracks?.find((t) => t.id === team?.track_id);
    const problemObj = trackObj?.problems?.find((p) => p.code === team?.problem_code);
    const problemLabel = problemObj
      ? `${problemObj.code}: ${problemObj.title}`
      : `${team?.problem_code || 'N/A'}${trackObj ? ` (${trackObj.code})` : ''}`;
    const memberNamesBlock = membersList
      .slice(0, 3)
      .map((m, idx) => `  ${idx + 1}. ${m.full_name || m.name || 'Participant'} (${idx === 0 ? 'Team Leader' : `Member ${idx + 1}`})`)
      .join('\n');

    const pStatus = derivePaymentStatus(team);
    const isVerified = pStatus === 'VERIFIED';
    const subject = isVerified
      ? `VELTRAXX 2.0 (${team?.team_id || ''}) - Participation Confirmed | Dec 15-16 @ SIET Coimbatore`
      : `VELTRAXX 2.0 (${team?.team_id || ''}) - Registration & Payment Status Update`;

    const body = [
      `Dear Team ${team?.team_name || ''} (${team?.team_id || ''}),`,
      '',
      isVerified
        ? `Congratulations! Your team's ₹1,500 registration payment has been verified against institutional bank credit, and your participation in VELTRAXX 2.0 is OFFICIALLY CONFIRMED.`
        : `Thank you for submitting your registration and payment evidence for VELTRAXX 2.0. Here is your current registration summary:`,
      '',
      `--- TEAM & REGISTRATION SUMMARY ---`,
      `Team ID: ${team?.team_id || ''}`,
      `Team Name: ${team?.team_name || ''}`,
      `Registered Members (Strictly 3 - No Substitutions):`,
      memberNamesBlock,
      `Selected Problem Statement: ${problemLabel}`,
      `Verified Payment Amount: ₹1,500 (₹500 × 3 Members)${team?.utr_number ? ` | UTR: ${team.utr_number}` : ''}`,
      `Payment Status: ${isVerified ? 'VERIFIED / PAID (PARTICIPATION CONFIRMED)' : pStatus === 'REJECTED' ? 'REJECTED' : 'PENDING BANK CREDIT VERIFICATION'}`,
      '',
      `--- EVENT SCHEDULE & VENUE ---`,
      `Event Dates: December 15-16, 2026 (24-Hour Continuous Onsite Hackathon)`,
      `Venue: ${eventConfig.event?.institution?.name}, ${eventConfig.event?.institution?.campus}`,
      `Host Department: ${eventConfig.event?.institution?.department}`,
      '',
      `--- APPLICABLE EVENT INSTRUCTIONS ---`,
      `1. All three registered team members must carry valid original institutional Photo ID cards for onsite check-in.`,
      `2. Strict No-Substitution Policy: Member replacements or substitutions are not allowed.`,
      `3. Bring your own laptops, chargers, extension cords, and required microcontrollers/FPGAs/hardware kits.`,
      `4. Hospitality: Food (3 meals) and 2 refreshments are provided during the 24-hour event.`,
      `5. Final reporting desk details will be shared prior to December 15, 2026.`,
      '',
      `Regards,`,
      `VELTRAXX 2.0 Organizing Committee`,
      `Department of Electronics Engineering (VLSI Design and Technology)`,
      `SIET Coimbatore (${eventConfig.contacts?.confirmationSenderEmail || 'vlsireseachlab@siet.ac.in'})`
    ].join('\n');

    return `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(eventConfig.contacts?.confirmationSenderEmail || 'vlsireseachlab@siet.ac.in')}&to=${encodeURIComponent(leaderEmail)}&cc=${encodeURIComponent(ccEmails)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openInspectRegistration = async (team) => {
    setInspectModalTeam(team);
    await openReceiptPreview(team);
  };

  const closeInspectRegistration = () => {
    setInspectModalTeam(null);
    closeReceiptPreview();
  };

  const openReceiptPreview = async (team) => {
    setReceiptPreviewTeam(team);
    setReceiptLoadError('');
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl('');
    }
    const rawUrl = team?.payment_screenshot_url || '';
    if (!rawUrl) {
      setReceiptLoadError('No payment screenshot has been uploaded for this team yet.');
      return;
    }
    if (rawUrl.startsWith('/api/admin/action') && authData?.token) {
      setIsReceiptLoading(true);
      try {
        const parsed = new URL(rawUrl, window.location.origin);
        const fileId = parsed.searchParams.get('fileId') || parsed.searchParams.get('file_id');
        if (fileId) {
          const blob = await fetchProtectedDriveFileBlobUrl(authData.token, team.team_id, fileId);
          setReceiptBlobUrl(blob);
          return;
        }
      } catch (err) {
        setReceiptLoadError(err?.message || 'Unable to load private Drive receipt image.');
      } finally {
        setIsReceiptLoading(false);
      }
    }
    setReceiptBlobUrl(rawUrl);
  };

  const closeReceiptPreview = () => {
    setReceiptPreviewTeam(null);
    if (receiptBlobUrl && receiptBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(receiptBlobUrl);
    }
    setReceiptBlobUrl('');
    setReceiptLoadError('');
  };

  // Tab 2: Dynamic Fee State & Seat Revocation / Waitlist State
  const [round2FeePerMember, setRound2FeePerMember] = useState(500);
  const [feeSaveMessage, setFeeSaveMessage] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeNotification, setRevokeNotification] = useState(null);

  // Live timer tick for real-time payment deadlines in Tab 2
  const [nowTime, setNowTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cooldown timer for security exponential backoff
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Tab 3: Attendance Matrix { [team_id]: { checkin: bool, audit1: bool, audit2: bool, members: { [memberIndex]: bool } } }
  const [attendanceData, setAttendanceData] = useState({});

  // Tab 4: 24H Live Clock State
  const [isClockPublic, setIsClockPublic] = useState(false);
  const [clockState, setClockState] = useState('STOPPED'); // 'STOPPED', 'RUNNING', 'PAUSED'
  const [announcementText, setAnnouncementText] = useState('Welcome to VELTRAXX 2.0. The 24-Hour Offline Arena is initializing.');
  const [clockBroadcastMsg, setClockBroadcastMsg] = useState('');

  // Load stored Auth & data
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex,nofollow';

    if (authData?.token) {
      loadRoster(authData.token);
    }

    const authSub = supabase?.auth?.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setAuthData(prev => {
          const next = { email: session.user?.email || prev?.email || '', token: session.access_token };
          try { sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      }
    });

    // Load initial event state
    getLiveEventState().then(state => {
      if (state) {
        setIsClockPublic(Boolean(state.is_clock_public));
        setClockState(state.clock_state || 'STOPPED');
        if (state.live_announcement_text) setAnnouncementText(state.live_announcement_text);
        if (state.round2_fee_per_member) setRound2FeePerMember(state.round2_fee_per_member);
      }
    }).catch(() => {});

    return () => {
      authSub?.data?.subscription?.unsubscribe?.();
      if (refreshToastTimeoutRef.current) clearTimeout(refreshToastTimeoutRef.current);
    };
  }, []);

  const showRefreshToast = (msg, durationMs = 3500) => {
    if (refreshToastTimeoutRef.current) clearTimeout(refreshToastTimeoutRef.current);
    setRefreshToast(msg);
    if (msg) {
      refreshToastTimeoutRef.current = setTimeout(() => setRefreshToast(''), durationMs);
    }
  };

  const loadRoster = async (token, { throwOnError = false } = {}) => {
    const reqId = ++loadRequestIdRef.current;
    setIsLoading(true);
    setAuthError('');
    try {
      const activeToken = await getFreshCoordinatorToken(token);
      if (reqId !== loadRequestIdRef.current) return null;

      setAuthData(prev => {
        if (prev?.token === activeToken) return prev;
        const next = { email: prev?.email || authData?.email || '', token: activeToken };
        try { sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });

      const [data, ov] = await Promise.all([
        getTrackerRoster(activeToken),
        getAdminOverview(activeToken).catch(() => null)
      ]);
      if (reqId !== loadRequestIdRef.current) return null;

      const list = Array.isArray(data) ? data : [];
      setTeams(list);
      setSelectedTeam(prevSel => {
        if (list.length === 0) return null;
        if (prevSel?.team_id) {
          return list.find(t => t.team_id === prevSel.team_id) || list[0];
        }
        return list[0];
      });
      setIsUnlocked(true);

      if (ov && ov.success) {
        setAdminOverview(ov);
        if (ov.event_state) {
          setRound2FeePerMember(ov.event_state.round2_fee_per_member ?? 500);
          setIsClockPublic(Boolean(ov.event_state.is_clock_public));
          setClockState(ov.event_state.clock_state || 'STOPPED');
          if (ov.event_state.live_announcement_text) setAnnouncementText(ov.event_state.live_announcement_text);
          setRound1OpenToggle(ov.event_state.round1_open !== false);
          setPaymentOpenToggle(Boolean(ov.event_state.round2_payment_open));
          setMaxTeamsCapInput(ov.event_state.max_teams_cap ?? 60);
          setReservationMinsInput(ov.event_state.payment_reservation_minutes ?? 5);
          setRegOverride(ov.event_state.registration_override || 'AUTO');
        }
      }
      return list;
    } catch (err) {
      if (reqId !== loadRequestIdRef.current) return null;
      const msg = String(err?.message || 'Invalid Coordinator Session.');
      const isAuthFailure = msg.toUpperCase().includes('UNAUTHORIZED') || msg.includes('Access denied') || !isUnlocked;
      if (isAuthFailure) {
        setIsUnlocked(false);
        setAuthError(msg);
        try { sessionStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
        setAuthData(null);
      }
      if (throwOnError) {
        throw err;
      }
      return null;
    } finally {
      if (reqId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToast('');
    try {
      const fresh = await loadRoster(authData?.token || '', { throwOnError: true });
      if (Array.isArray(fresh)) {
        showRefreshToast(`✓ Live Roster synced (${fresh.length} team${fresh.length === 1 ? '' : 's'})!`, 3500);
      }
    } catch (err) {
      showRefreshToast(`Refresh failed: ${err.message || 'Unable to reach database'}`, 4500);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    if (!authData?.token) {
      showRefreshToast('Failed to delete team: Coordinator authorization required.', 4500);
      return;
    }
    setIsDeleting(true);
    try {
      const deletedTarget = teamToDelete;
      await adminDeleteTeam(authData.token, deletedTarget.team_id, { confirmed: true });
      setTeams(prev => prev.filter(t => t.team_id !== deletedTarget.team_id));
      if (selectedTeam?.team_id === deletedTarget.team_id) {
        setSelectedTeam(null);
      }
      if (inspectModalTeam?.team_id === deletedTarget.team_id || receiptPreviewTeam?.team_id === deletedTarget.team_id) {
        closeInspectRegistration();
      }
      setTeamToDelete(null);
      await loadRoster(authData.token, { throwOnError: false });
      showRefreshToast(`✓ Team ${deletedTarget.team_id} (${deletedTarget.team_name}) permanently deleted!`, 4000);
    } catch (err) {
      showRefreshToast(`Failed to delete team: ${err.message}`, 4500);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    const email = emailInput.trim();
    const password = passwordInput;
    if (!email || !password) {
      setAuthError("Please enter both coordinator email and password.");
      return;
    }

    setIsLoading(true);
    setAuthError('');
    try {
      const authResult = await adminLogin({ email, password });
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResult));
      setAuthData(authResult);
      setFailedAttempts(0);
      await loadRoster(authResult.token);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        const cooldown = Math.min(60, Math.pow(2, newAttempts - 4));
        setCooldownRemaining(cooldown);
        setAuthError(`Security alert: Too many failed login attempts. Cooldown active for ${cooldown}s.`);
      } else {
        setAuthError(err.message || "Invalid coordinator credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    supabase?.auth?.signOut?.().catch(() => {});
    try { sessionStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
    setAuthData(null);
    setIsUnlocked(false);
    setTeams([]);
  };

    // 1-Click Status Toggles in Tab 1 (Normalizes status & rolls back on DB failure)
    const updateTeamStatus = async (teamIdToUpdate, newStatus, isShortlistedVal) => {
      const normalizedStatus = newStatus === 'waitlist' ? 'waitlisted' : newStatus;
      const prevSnapshot = teams.find(t => t.team_id === teamIdToUpdate) || null;
      const shortlistedAt = isShortlistedVal ? new Date().toISOString() : null;
      const paymentDeadline = null;

      setTeams(prev => prev.map(t => {
        if (t.team_id === teamIdToUpdate) {
          const updated = {
            ...t,
            round1_status: normalizedStatus,
            is_shortlisted: isShortlistedVal,
            is_paid_verified: normalizedStatus === 'rejected' ? false : t.is_paid_verified,
            shortlisted_at: isShortlistedVal ? (t.shortlisted_at || shortlistedAt) : null,
            payment_deadline: paymentDeadline
          };
          if (selectedTeam?.team_id === teamIdToUpdate) setSelectedTeam(updated);
          if (inspectModalTeam?.team_id === teamIdToUpdate) setInspectModalTeam(updated);
          if (receiptPreviewTeam?.team_id === teamIdToUpdate) setReceiptPreviewTeam(updated);
          return updated;
        }
        return t;
      }));

      try {
        const res = await adminUpdateTeamStatus(authData?.token || '', teamIdToUpdate, normalizedStatus, isShortlistedVal);
        if (res?.team_id) {
          setTeams(prev => prev.map(t => {
            if (t.team_id === teamIdToUpdate) {
              const confirmed = {
                ...t,
                round1_status: res.round1_status ?? normalizedStatus,
                is_shortlisted: res.is_shortlisted ?? isShortlistedVal,
                is_paid_verified: (res.round1_status ?? normalizedStatus) === 'rejected' ? false : t.is_paid_verified,
                shortlisted_at: res.shortlisted_at ?? t.shortlisted_at
              };
              if (inspectModalTeam?.team_id === teamIdToUpdate) setInspectModalTeam(confirmed);
              if (receiptPreviewTeam?.team_id === teamIdToUpdate) setReceiptPreviewTeam(confirmed);
              return confirmed;
            }
            return t;
          }));
        }
      } catch (err) {
        if (prevSnapshot) {
          setTeams(prev => prev.map(t => t.team_id === teamIdToUpdate ? prevSnapshot : t));
          if (selectedTeam?.team_id === teamIdToUpdate) setSelectedTeam(prevSnapshot);
          if (inspectModalTeam?.team_id === teamIdToUpdate) setInspectModalTeam(prevSnapshot);
          if (receiptPreviewTeam?.team_id === teamIdToUpdate) setReceiptPreviewTeam(prevSnapshot);
        }
        showRefreshToast(`Failed updating ${teamIdToUpdate}: ${err.message}`, 4500);
      }
    };

  // Grant manual payment access (e.g. VTX2-034..036)
  const handleGrantPaymentAccess = async (teamIdToGrant, hours = 24) => {
    if (!authData?.token) return;
    try {
      const res = await adminGrantPaymentAccess(authData.token, teamIdToGrant, hours);
      setTeams(prev => prev.map(t => t.team_id === teamIdToGrant ? {
        ...t,
        is_shortlisted: true,
        payment_deadline: res.payment_deadline || new Date(Date.now() + hours * 3600 * 1000).toISOString(),
        round1_status: t.round1_status === 'rejected' ? 'pending' : t.round1_status
      } : t));
      showRefreshToast(`✓ Granted ${hours}h checkout access to ${teamIdToGrant}`, 3500);
    } catch (err) {
      showRefreshToast(`Failed granting access to ${teamIdToGrant}: ${err.message}`, 4500);
    }
  };

  // 1-Click Paid & Verified Toggle (Persisted in Supabase)
  const togglePaidVerified = async (teamIdToToggle) => {
    const target = teams.find(t => t.team_id === teamIdToToggle);
    if (!target) return;
    const prevTarget = { ...target };
    const nextVal = !target.is_paid_verified;
      setTeams(prev => prev.map(t => t.team_id === teamIdToToggle ? {
        ...t,
        is_paid_verified: nextVal,
        is_shortlisted: true,
        round1_status: nextVal ? 'shortlisted' : 'pending'
      } : t));
      if (inspectModalTeam?.team_id === teamIdToToggle) {
        setInspectModalTeam(prev => prev ? {
          ...prev,
          is_paid_verified: nextVal,
          is_shortlisted: true,
          round1_status: nextVal ? 'shortlisted' : 'pending'
        } : prev);
      }
      if (receiptPreviewTeam?.team_id === teamIdToToggle) {
        setReceiptPreviewTeam(prev => prev ? {
          ...prev,
          is_paid_verified: nextVal,
          is_shortlisted: true,
          round1_status: nextVal ? 'shortlisted' : 'pending'
        } : prev);
      }
    if (authData?.token) {
      try {
        await adminVerifyRound2Payment(authData.token, teamIdToToggle, nextVal);
        showRefreshToast(`✓ ${teamIdToToggle} marked ${nextVal ? 'VERIFIED / PAID' : 'PENDING VERIFICATION'}!`, 3000);
      } catch (err) {
        setTeams(prev => prev.map(t => t.team_id === teamIdToToggle ? prevTarget : t));
        if (inspectModalTeam?.team_id === teamIdToToggle) setInspectModalTeam(prevTarget);
        if (receiptPreviewTeam?.team_id === teamIdToToggle) setReceiptPreviewTeam(prevTarget);
        showRefreshToast(`Payment verification update failed: ${err.message}`, 4500);
      }
    }
  };

  // Tab 3 Attendance Toggles
  const toggleAttendanceCheck = (teamId, checkKey, memberIdx = null) => {
    setAttendanceData(prev => {
      const current = prev[teamId] || { checkin: false, audit1: false, audit2: false, members: {} };
      if (memberIdx !== null) {
        return {
          ...prev,
          [teamId]: {
            ...current,
            members: {
              ...current.members,
              [memberIdx]: !current.members[memberIdx]
            }
          }
        };
      }
      return {
        ...prev,
        [teamId]: {
          ...current,
          [checkKey]: !current[checkKey]
        }
      };
    });
  };

  // Save Dynamic Fee to Supabase event_state
  const handleSaveDynamicFee = async () => {
    const fee = parseInt(round2FeePerMember, 10) || 500;
    try {
      if (authData?.token) {
        await adminUpdateEventState(authData.token, { round2_fee_per_member: fee });
      }
      setFeeSaveMessage("Team fee saved to Supabase!");
      setTimeout(() => setFeeSaveMessage(''), 3000);
    } catch (err) {
      setFeeSaveMessage(`Error: ${err.message}`);
    }
  };

  // Save Window & Cap Controls to Supabase event_state
  const handleSaveWindowOverrides = async (overrides = {}) => {
    if (!authData?.token) return;
    try {
      const payload = {
        round1_open: overrides.round1_open ?? round1OpenToggle,
        round2_payment_open: overrides.round2_payment_open ?? paymentOpenToggle,
        registration_override: overrides.registration_override ?? regOverride,
        max_teams_cap: parseInt(overrides.max_teams_cap ?? maxTeamsCapInput, 10) || 60,
        payment_reservation_minutes: parseInt(overrides.payment_reservation_minutes ?? reservationMinsInput, 10) || 5
      };
      const res = await adminUpdateEventState(authData.token, payload);
      setAdminOverview(prev => ({
        ...prev,
        event_state: res.event_state || prev.event_state,
        window_status: res.window_status || prev.window_status
      }));
      setOpsToast('✓ Cap, checkout window & overrides persisted to Supabase!');
      setTimeout(() => setOpsToast(''), 4000);
    } catch (err) {
      setOpsToast(`Error saving settings: ${err.message}`);
    }
  };

  const handleRetrySync = async (job) => {
    if (!authData?.token) return;
    setRetryingSyncId(job.id);
    try {
      await adminRetrySyncJob(authData.token, {
        sync_job_id: job.id,
        team_id: job.team_id,
        job_type: job.job_type
      });
      const ov = await getAdminOverview(authData.token);
      if (ov?.success) setAdminOverview(ov);
      setOpsToast(`✓ Sync job for ${job.team_id} re-processed!`);
      setTimeout(() => setOpsToast(''), 4000);
    } catch (err) {
      setOpsToast(`Sync retry failed: ${err.message}`);
    } finally {
      setRetryingSyncId(null);
    }
  };

  // Broadcast Live Clock State to Supabase event_state
  const handleBroadcastClock = async (newClockState) => {
    setClockState(newClockState);
    try {
      const patch = {
        is_clock_public: isClockPublic,
        clock_state: newClockState,
        live_announcement_text: announcementText
      };
      if (newClockState === 'RUNNING') {
        patch.clock_start_timestamp = adminOverview?.event_state?.clock_start_timestamp || new Date().toISOString();
        patch.clock_end_timestamp = adminOverview?.event_state?.clock_end_timestamp || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      }
      if (authData?.token) {
        await adminUpdateEventState(authData.token, patch);
      }
      setClockBroadcastMsg(`Clock status: ${newClockState} saved live to database!`);
      setTimeout(() => setClockBroadcastMsg(''), 3000);
    } catch (err) {
      setClockBroadcastMsg(`Failed saving clock state: ${err.message}`);
    }
  };

  // Download Filterable CSV (13 Synchronized Columns)
  const downloadMasterCsv = () => {
    const headers = [
      "S.No",
      "Team ID",
      "Team Name",
      "Problem Statement",
      "Role",
      "Student Name",
      "Phone Number",
      "Email ID",
      "College",
      "Dept",
      "Year",
      "Payment Status",
      "Participation Status"
    ];

    const cleanPhone = (raw) => {
      if (!raw) return '';
      const digits = String(raw).replace(/[^0-9]/g, '');
      return digits.length >= 10 ? digits.slice(-10) : digits;
    };

    const formatYear = (rawYear) => {
      if (!rawYear) return '1st Year';
      const y = String(rawYear).trim();
      if (y.toLowerCase().includes('1')) return '1st Year';
      if (y.toLowerCase().includes('2')) return '2nd Year';
      if (y.toLowerCase().includes('3')) return '3rd Year';
      if (y.toLowerCase().includes('4')) return '4th Year';
      return y;
    };

    // Sort teams in chronological ascending order (1st registered team = S.No 1)
    const sortedTeams = [...teams].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) {
        return timeA - timeB;
      }
      return String(a.team_id || '').localeCompare(String(b.team_id || ''), undefined, { numeric: true, sensitivity: 'base' });
    });

    const rows = [];
    sortedTeams.forEach((team, teamIdx) => {
      const sNo = teamIdx + 1;
      const teamMembers = (Array.isArray(team.members) && team.members.length > 0)
        ? team.members
        : [{ full_name: 'Not Provided', email: '', phone: '', college_name: '', department: '', year_of_study: '' }];

      const problemStatement = team.problem_code 
        ? (team.track_id ? `${team.problem_code} (${team.track_id})` : team.problem_code)
        : (team.track_id || 'OPEN');

      const rawStatus = (team.round1_status || '').toLowerCase();
      const pptSubmitted = rawStatus === 'rejected' || rawStatus === 'cancelled'
        ? 'REJECTED'
        : team.is_paid_verified
          ? (team.utr_number ? `VERIFIED / PAID (UTR: ${team.utr_number})` : 'VERIFIED / PAID')
          : team.utr_number
            ? `PENDING VERIFICATION (UTR: ${team.utr_number})`
            : 'PENDING VERIFICATION';
      
      let r1Status = 'PENDING VERIFICATION';
      if (rawStatus === 'rejected' || rawStatus === 'cancelled') {
        r1Status = 'REJECTED';
      } else if (team.is_paid_verified) {
        r1Status = 'CONFIRMED';
      }

      teamMembers.forEach((m, idx) => {
        const isLeader = idx === 0;
        const role = isLeader ? 'Leader' : `M${idx}`;
        const phone = cleanPhone(m.phone);

        rows.push([
          sNo,
          `"${(team.team_id || '').replace(/"/g, '""')}"`,
          `"${(team.team_name || '').replace(/"/g, '""')}"`,
          `"${problemStatement.replace(/"/g, '""')}"`,
          `"${role}"`,
          `"${(m.full_name || m.name || '').replace(/"/g, '""')}"`,
          `"\t${phone}"`, // Tab-prefix in CSV ensures Excel treats phone as pure string
          `"${(m.email || '').replace(/"/g, '""')}"`,
          `"${(m.college_name || m.college || '').replace(/"/g, '""')}"`,
          `"${(m.department || m.dept || '').replace(/"/g, '""')}"`,
          `"${formatYear(m.year_of_study || m.year)}"`,
          `"${pptSubmitted}"`,
          `"${r1Status}"`
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VELTRAXX_2.0_Management_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Teams for Tab 1 - Uniform 3-Status + Multi-Field Search
  const filteredRound1Teams = teams.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (t.team_id && t.team_id.toLowerCase().includes(q)) ||
      (t.team_name && t.team_name.toLowerCase().includes(q)) ||
      (t.problem_code && t.problem_code.toLowerCase().includes(q)) ||
      (t.track_id && t.track_id.toLowerCase().includes(q)) ||
      (t.academic_tier && t.academic_tier.toLowerCase().includes(q)) ||
      (t.round1_status && t.round1_status.toLowerCase().includes(q)) ||
      (t.utr_number && String(t.utr_number).toLowerCase().includes(q)) ||
      (Array.isArray(t.members) && t.members.some(m =>
        (m.full_name || m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        String(m.phone || '').toLowerCase().includes(q) ||
        (m.college_name || m.college || '').toLowerCase().includes(q) ||
        (m.department || '').toLowerCase().includes(q) ||
        (m.year_of_study || '').toLowerCase().includes(q) ||
        String(m.roll_number || m.reg_no || '').toLowerCase().includes(q)
      ))
    );
    if (!matchesSearch) return false;

    const pState = derivePaymentStatus(t);
    if (round1Filter === 'ALL') return true;
    return pState === round1Filter;
  });

  // Confirmed / Active Teams for Attendance & Payment Ledger
  const shortlistedTeams = teams.filter(t => t.round1_status !== 'rejected');
  const waitlistedTeams = [];

  // =========================================================================
  // COORDINATOR AUTHENTICATION SCREEN
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full">
          
          <div className="w-14 h-14 rounded-2xl bg-[#FFE500] text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center mb-6">
            <ShieldLock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-3">
            <span>OPERATIONS COMMAND CENTER</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight mb-2">
            Coordinator Access
          </h1>

          <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-6 font-normal">
            Sign in with your authorized coordinator credentials to manage team registrations, verify ₹1,500 UPI payments, compose confirmation emails, and run the 24H arena clock.
          </p>

          {authError && (
            <div className="mb-4 p-3.5 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-xl font-mono text-xs text-[#FF2E93] font-black">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-black text-[#111116] uppercase mb-1.5">
                Coordinator Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. coordinator@siet.ac.in"
                className="w-full h-11 bg-white border-2 border-[#111116] rounded-xl px-4 text-sm font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-black text-[#111116] uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 bg-white border-2 border-[#111116] rounded-xl px-4 text-sm font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || cooldownRemaining > 0}
              className={`w-full h-12 font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center gap-2 transition-all ${
                cooldownRemaining > 0 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
              }`}
            >
              {cooldownRemaining > 0 
                ? `COOLDOWN ACTIVE (${cooldownRemaining}s) · WAIT TO RETRY`
                : isLoading 
                  ? "AUTHENTICATING..." 
                  : "SIGN IN TO COMMAND CENTER →"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#111116]/10 text-center font-mono text-[11px] text-[#111116]/60">
            Authorized Personnel: Organizing Committee & Faculty Desk
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // UNLOCKED 4-TAB ADMIN COMMAND CENTER
  // =========================================================================
  // Executive KPI Roster Metrics (Single-Round 60-Team Cap)
  const activeTeamsList = teams.filter(t => t.round1_status !== 'rejected');
  const totalTeamsCount = activeTeamsList.length;
  const paidVerifiedCount = activeTeamsList.filter(t => !!t.is_paid_verified).length;
  const submittedProofCount = activeTeamsList.filter(t => !t.is_paid_verified && !!t.utr_number).length;
  const notPaidCount = activeTeamsList.filter(t => !t.is_paid_verified && !t.utr_number).length;
  const rejectedTeamsCount = teams.filter(t => t.round1_status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#F4F4F6] pb-24">
      
      {/* Top Header Bar with Non-Overlapping Right Action Cluster */}
      <header className="bg-[#111116] text-white border-b-3 border-[#111116] px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] border-2 border-white/20 shadow-[2px_2px_0px_#FFE500] flex items-center justify-center font-black shrink-0">
              <ShieldLock className="w-5 h-5 text-[#111116]" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FFE500]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] animate-pulse" />
                <span>VELTRAXX 2.0 OPERATIONS COMMAND CENTER</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white/80">
                Active Session: {authData?.email || 'Authorized Coordinator'} · SIET EE / VLSI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <Link
              to="/"
              className="px-3.5 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
              title="Reload roster from live database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FFE500]' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Real-Time Action Feedback Toasts */}
      {isPreviewWriteBlocked() && (
        <div className="bg-[#FF2E93] text-white font-mono text-xs font-black text-center py-2 px-4 border-b-2 border-[#111116]">
          PREVIEW READ-ONLY LOCK: Production database &amp; Drive mutations are disabled on Preview deployments.
        </div>
      )}
      {refreshToast && (
        <div className="fixed top-18 right-4 sm:right-8 z-50 flex flex-col gap-2.5 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl bg-[#111116] font-mono text-xs font-black border-2 shadow-[4px_4px_0px_#111116] flex items-center gap-2 ${
            refreshToast.startsWith('Failed') || refreshToast.startsWith('Refresh failed') || refreshToast.startsWith('Payment')
              ? 'text-[#FF2E93] border-[#FF2E93]'
              : 'text-[#B6FF00] border-[#B6FF00]'
          }`}>
            <CheckCircle2 className={`w-4 h-4 ${
              refreshToast.startsWith('Failed') || refreshToast.startsWith('Refresh failed') || refreshToast.startsWith('Payment')
                ? 'text-[#FF2E93]'
                : 'text-[#B6FF00]'
            }`} />
            <span>{refreshToast}</span>
          </div>
        </div>
      )}

      {/* Tactile Folder Index Navigation Tabs */}
      <div className="bg-[#1C1C24] border-b-2 border-[#111116] px-4 sm:px-8 pt-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('ROUND1')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ROUND1'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-[#FFE500]" />
            <span>Roster &amp; Payments ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROUND2')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ROUND2'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#B6FF00]" />
            <span>Payment Ledger ({activeTeamsList.length}/60)</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ATTENDANCE'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
            <span>Attendance Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab('CLOCK')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CLOCK'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-[#FF2E93]" />
            <span>24H Arena Clock</span>
          </button>

          <button
            onClick={() => setActiveTab('OPS')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'OPS'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#00E5FF]" />
            <span>Cap &amp; Window Ops</span>
          </button>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* ===================================================================
            TAB 1: SINGLE-ROUND ROSTER & MANUAL PAYMENT VERIFICATION
           =================================================================== */}
        {activeTab === 'ROUND1' && (
          <div>
            
            {/* Executive KPI Stats Overview (3 Primary Payment Statuses + Total Cap) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Active Teams / Cap</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5">{totalTeamsCount} / 60</div>
                <div className="text-[10px] font-mono text-[#0055FF] font-bold mt-1">{totalTeamsCount * 3} / 180 Participants</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#FFE500]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Pending Verification</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5">{submittedProofCount + notPaidCount}</div>
                <div className="text-[10px] font-mono text-[#111116]/70 font-bold mt-1">Verify vs. Bank Statement (7-8 PM)</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#B6FF00]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Verified / Paid</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5 flex items-center gap-1.5">
                  <span>{paidVerifiedCount}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] border border-[#111116] inline-block" />
                </div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">Bank Credit Confirmed</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Rejected</div>
                <div className="text-2xl sm:text-3xl font-black text-[#FF2E93] mt-0.5">{rejectedTeamsCount}</div>
                <div className="text-[10px] font-mono text-[#FF2E93] font-bold mt-1">Released from 60-Team Cap</div>
              </div>
            </div>

            {/* Action Bar: Search, 3-Status Payment Filter Pills & Exports */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#111116]/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, Name, UTR, College, Phone..."
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-xl pl-9 pr-3 text-xs font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                {/* Simplified 3-Status Filter Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-[#111116] overflow-x-auto no-scrollbar">
                  {[
                    { id: 'ALL', label: 'ALL' },
                    { id: 'PENDING', label: 'PENDING VERIFICATION' },
                    { id: 'VERIFIED', label: 'VERIFIED / PAID' },
                    { id: 'REJECTED', label: 'REJECTED' }
                  ].map((f) => {
                    const isSelected = round1Filter === f.id;
                    let activeClass = 'bg-[#111116] text-[#FFE500]';
                    if (f.id === 'PENDING') activeClass = 'bg-[#FFE500] text-[#111116]';
                    if (f.id === 'VERIFIED') activeClass = 'bg-[#B6FF00] text-[#111116]';
                    if (f.id === 'REJECTED') activeClass = 'bg-[#FF2E93] text-white';

                    return (
                      <button
                        key={f.id}
                        onClick={() => setRound1Filter(f.id)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-black cursor-pointer whitespace-nowrap transition-colors ${
                          isSelected ? activeClass : 'text-[#111116]/70 hover:text-[#111116] hover:bg-black/5'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportRegistrationsToXLSX(teams)}
                  className="h-10 px-4 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Export Management Roster (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={downloadMasterCsv}
                  className="h-10 px-3.5 bg-white hover:bg-white/80 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0"
                >
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Bank-Credit Verification Rule & Official Email Notice */}
            <div className="mb-5 p-3.5 bg-white border-2 border-[#111116] rounded-xl font-mono text-xs text-[#111116]/85 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Evening Reconciliation Rule:</strong> Verify each UTR against actual institutional bank credit (not just screenshot) before clicking <strong>Verify Payment</strong> and composing Gmail confirmation from <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>.
              </span>
              <span className="text-[11px] font-black text-[#0055FF]">Expected Fee: ₹1,500 / Team (₹500 × 3)</span>
            </div>

            {/* Clean Roster Stripes */}
            <div className="space-y-4">
              {filteredRound1Teams.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_#111116] font-mono text-xs text-[#111116]/60">
                  No teams found matching current search or payment status filter.
                </div>
              ) : (
                filteredRound1Teams.map((team) => {
                  const pStatus = derivePaymentStatus(team);
                  const isRejected = pStatus === 'REJECTED';
                  const isPaid = pStatus === 'VERIFIED';
                  const regTimestamp = team.created_at
                    ? new Date(team.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Recent';

                  return (
                    <div 
                      key={team.team_id}
                      className="bg-white rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[6px_6px_0px_0px_#111116] transition-all p-5 sm:p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b-2 border-[#111116]/10 mb-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0055FF]/10 text-[#0055FF] border border-[#0055FF]/30">
                            {team.team_id}
                          </span>
                          <h3 className="font-black text-lg text-[#111116]">
                            {team.team_name}
                          </h3>

                          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#111116] text-[#FFE500]">
                            {team.problem_code || 'VTX-T1-01'}
                          </span>
                          <span className="font-mono text-[11px] font-black px-2.5 py-0.5 rounded bg-[#F4F4F6] text-[#111116] border border-[#111116]/25">
                            Expected: ₹1,500
                          </span>
                          <span className={`font-mono text-[11px] font-black px-2.5 py-0.5 rounded border ${
                            team.utr_number
                              ? 'bg-[#00E5FF]/20 text-[#111116] border-[#111116]/30'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            UTR: {team.utr_number || 'Legacy / Missing'}
                          </span>
                          {team.payment_screenshot_url && (
                            <button
                              type="button"
                              onClick={() => openInspectRegistration(team)}
                              className="font-mono text-[11px] font-black text-[#0055FF] underline cursor-pointer"
                            >
                              View Screenshot
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] text-[#6B6B78]" title="Registration Timestamp">
                            {regTimestamp}
                          </span>
                          <span className={`font-mono text-xs font-black px-3 py-1 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] ${
                            isRejected
                              ? 'bg-[#FF2E93] text-white'
                              : isPaid
                                ? 'bg-[#B6FF00] text-[#111116]'
                                : 'bg-[#FFE500] text-[#111116]'
                          }`}>
                            {isRejected ? 'REJECTED' : isPaid ? 'VERIFIED / PAID' : 'PENDING VERIFICATION'}
                          </span>
                        </div>
                      </div>

                      {/* Three Registered Members Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                        {team.members?.map((m, mIdx) => (
                          <div key={mIdx} className="p-2.5 bg-[#FBFBFB] rounded-xl border border-[#111116]/15 text-xs font-mono">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-[#111116] truncate">{m.full_name || m.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                mIdx === 0 ? 'bg-[#FFE500] text-[#111116] font-black' : 'bg-black/5 text-[#6B6B78]'
                              }`}>
                                {mIdx === 0 ? 'LEADER' : `M${mIdx + 1}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#111116]/80 truncate">{m.department || 'EE - VDT'} · {m.college_name || 'SIET'}</div>
                            <div className="text-[10px] text-[#6B6B78] truncate mt-0.5">{m.email} · {m.phone}</div>
                          </div>
                        ))}
                      </div>

                      {/* Required Admin Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#111116]/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => togglePaidVerified(team.team_id)}
                            className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer ${
                              isPaid ? 'bg-[#B6FF00] text-[#111116]' : 'bg-[#B6FF00]/80 hover:bg-[#B6FF00] text-[#111116]'
                            }`}
                            title="Confirm bank credit verified before marking Paid"
                          >
                            {isPaid ? '✓ Verified / Paid (Mark Pending)' : 'Verify Payment'}
                          </button>

                          <button
                            type="button"
                            onClick={() => updateTeamStatus(team.team_id, isRejected ? 'pending' : 'rejected', !isRejected)}
                            className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer ${
                              isRejected ? 'bg-[#111116] text-white' : 'bg-white hover:bg-[#FF2E93] hover:text-white text-[#111116]'
                            }`}
                          >
                            {isRejected ? 'Restore Pending' : 'Reject Payment'}
                          </button>

                          {!team.utr_number && !isPaid && !isRejected && (
                            <button
                              type="button"
                              onClick={() => handleGrantPaymentAccess(team.team_id, 24)}
                              className="px-2.5 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-[11px] font-black rounded-lg border-2 border-[#111116] cursor-pointer"
                              title="Authorize legacy team payment recovery access"
                            >
                              Legacy Payment Access
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setTeamToDelete(team)}
                            className="px-2.5 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openInspectRegistration(team)}
                            className="px-3.5 py-1.5 bg-white hover:bg-[#F4F4F6] text-[#111116] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0055FF]" />
                            <span>Inspect Registration</span>
                          </button>

                          <a
                            href={buildGmailComposeUrl(team)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-[#111116] hover:bg-black text-[#FFE500] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#FFE500] flex items-center gap-1.5"
                            title="Open customized Gmail draft from vlsireseachlab@siet.ac.in (To: Leader, CC: 2 Members)"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Compose Confirmation Email</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Unified Inspect Registration & Receipt Modal */}
            {(inspectModalTeam || receiptPreviewTeam) && (() => {
              const targetTeam = inspectModalTeam || receiptPreviewTeam;
              const targetStatus = derivePaymentStatus(targetTeam);
              return (
                <div
                  className="fixed inset-0 z-50 bg-[#111116]/85 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={closeInspectRegistration}
                >
                  <div
                    className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_#FFE500] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 bg-[#111116] text-white flex items-center justify-between shrink-0">
                      <div className="font-mono text-xs font-black">
                        INSPECT REGISTRATION · {targetTeam.team_id} ({targetTeam.team_name})
                      </div>
                      <button
                        type="button"
                        onClick={closeInspectRegistration}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        aria-label="Close Inspect Registration Modal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 overflow-y-auto space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs bg-[#F4F4F6] p-4 rounded-2xl border-2 border-[#111116]/15">
                        <div><strong>Team ID:</strong> {targetTeam.team_id}</div>
                        <div><strong>Expected Fee:</strong> ₹1,500 (₹500 × 3)</div>
                        <div><strong>Problem Statement:</strong> {targetTeam.problem_code} ({targetTeam.track_id})</div>
                        <div><strong>UTR Reference:</strong> {targetTeam.utr_number || 'Not submitted'}</div>
                        <div><strong>Registered At:</strong> {targetTeam.created_at ? new Date(targetTeam.created_at).toLocaleString('en-IN') : 'Recent'}</div>
                        <div>
                          <strong>Status:</strong>{' '}
                          <span className="font-black">
                            {targetStatus === 'REJECTED' ? 'REJECTED' : targetStatus === 'VERIFIED' ? 'VERIFIED / PAID' : 'PENDING VERIFICATION'}
                          </span>
                        </div>
                      </div>

                      {/* Members Detail Table */}
                      <div className="space-y-2">
                        <div className="font-mono text-xs font-black uppercase text-[#111116]">Three Registered Members</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                          {(targetTeam.members || []).map((m, idx) => (
                            <div key={idx} className="p-3 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]/15 space-y-1">
                              <div className="font-black text-[#111116]">{idx === 0 ? 'LEADER' : `MEMBER ${idx + 1}`}: {m.full_name || m.name}</div>
                              <div className="text-[11px] text-[#111116]/80 break-all">{m.email}</div>
                              <div className="text-[11px] text-[#111116]/80">{m.phone}</div>
                              <div className="text-[11px] text-[#6B6B78]">{m.college_name || 'SIET'} · {m.department} ({m.year_of_study})</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Receipt Image */}
                      <div>
                        <div className="font-mono text-xs font-black uppercase text-[#111116] mb-2">Payment Screenshot Proof</div>
                        {isReceiptLoading ? (
                          <div className="h-52 flex items-center justify-center font-mono text-xs font-bold text-[#0055FF] bg-[#FBFBFB] rounded-2xl border-2 border-[#111116]">
                            Loading private Finance Drive receipt...
                          </div>
                        ) : receiptLoadError ? (
                          <div className="p-5 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-2xl font-mono text-xs font-bold text-[#111116] text-center">
                            {receiptLoadError}
                          </div>
                        ) : (
                          <div className="max-h-[45vh] overflow-auto bg-[#FBFBFB] rounded-2xl border-2 border-[#111116] p-2 flex items-center justify-center">
                            <img
                              src={receiptBlobUrl}
                              alt={`Payment receipt for ${targetTeam.team_id}`}
                              className="max-w-full max-h-[40vh] object-contain rounded-xl"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-[#FFE500]/20 border border-[#111116] rounded-xl font-mono text-[11px] text-[#111116]">
                        <strong>Bank Credit Reminder:</strong> Confirm UTR <strong>{targetTeam.utr_number || 'N/A'}</strong> is credited in the institutional bank account before verifying.
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <a
                          href={buildGmailComposeUrl(targetTeam)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#111116] text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Compose Confirmation Email</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => updateTeamStatus(targetTeam.team_id, targetStatus === 'REJECTED' ? 'pending' : 'rejected', targetStatus === 'REJECTED')}
                          className="px-4 py-2 bg-white hover:bg-[#FF2E93] hover:text-white text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer"
                        >
                          {targetStatus === 'REJECTED' ? 'Restore Pending' : 'Reject Payment'}
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePaidVerified(targetTeam.team_id)}
                          className="px-4 py-2 bg-[#B6FF00] text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer"
                        >
                          {targetStatus === 'VERIFIED' ? 'Mark Pending Verification' : 'Verify Payment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===================================================================
            TAB 2: PAYMENT LEDGER & FEE CONFIGURATION
           =================================================================== */}
        {activeTab === 'ROUND2' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-5 h-5 text-[#111116]" />
                <h3 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  TEAM REGISTRATION FEE CONFIGURATION (₹500 / MEMBER · ₹1,500 / TEAM)
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#111116]">₹ Fee Per Member:</span>
                  <input
                    type="number"
                    value={round2FeePerMember}
                    onChange={(e) => setRound2FeePerMember(e.target.value)}
                    className="w-32 h-10 bg-white border-2 border-[#111116] rounded-xl px-3 font-mono text-sm font-black text-[#111116]"
                    min={0}
                    step={50}
                  />
                </div>
                <button
                  onClick={handleSaveDynamicFee}
                  className="h-10 px-5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer"
                >
                  Save Fee Settings
                </button>
                {feeSaveMessage && <span className="font-mono text-xs font-bold text-emerald-700">{feeSaveMessage}</span>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10 mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-black text-lg text-[#111116]">
                    Active Teams Payment Ledger ({activeTeamsList.length} / 60 Teams)
                  </h3>
                  <p className="font-mono text-xs text-[#111116]/70 mt-0.5">
                    5-minute checkout lock per new registration · Expired unpaid slots do not discard submitted UTR proofs.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FBFBFB] border-b-2 border-[#111116]/10">
                    <tr>
                      <th className="p-3">TEAM ID</th>
                      <th className="p-3">TEAM NAME</th>
                      <th className="p-3">TOKEN</th>
                      <th className="p-3">FEE</th>
                      <th className="p-3">UTR</th>
                      <th className="p-3">RECEIPT</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111116]/10">
                    {activeTeamsList.map((team) => (
                      <tr key={team.team_id} className="hover:bg-black/5">
                        <td className="p-3 font-black text-[#0055FF]">{team.team_id}</td>
                        <td className="p-3 font-bold text-[#111116]">{team.team_name}</td>
                        <td className="p-3 font-bold">{team.secret_passcode || '-'}</td>
                        <td className="p-3">₹{(team.team_size || 3) * (round2FeePerMember || 500)}</td>
                        <td className="p-3 font-bold text-[#0055FF]">{team.utr_number || 'Pending'}</td>
                        <td className="p-3">
                          {team.payment_screenshot_url ? (
                            <button
                              type="button"
                              onClick={() => openInspectRegistration(team)}
                              className="underline font-black text-[#0055FF] cursor-pointer"
                            >
                              View Image
                            </button>
                          ) : (
                            <span className="text-[#111116]/40">None</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-black border border-[#111116] ${
                            team.is_paid_verified ? 'bg-[#B6FF00] text-[#111116]' : 'bg-[#FFE500] text-[#111116]'
                          }`}>
                            {team.is_paid_verified ? 'VERIFIED / PAID' : 'PENDING VERIFICATION'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={buildGmailComposeUrl(team)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white rounded-lg font-bold border border-[#111116]"
                            >
                              Gmail
                            </a>
                            <button
                              type="button"
                              onClick={() => togglePaidVerified(team.team_id)}
                              className="px-3 py-1 bg-[#111116] text-[#FFE500] rounded-lg font-bold cursor-pointer"
                            >
                              {team.is_paid_verified ? 'Mark Pending' : 'Verify Payment'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: EVENT-DAY ATTENDANCE CHECKLIST (15-16 DEC)
           =================================================================== */}
        {activeTab === 'ATTENDANCE' && (
          <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10 mb-6">
              <div>
                <h3 className="font-black text-xl text-[#111116]">
                  Event-Day Attendance Matrix (15-16 Dec 2026)
                </h3>
                <p className="font-mono text-xs text-[#111116]/70 mt-1">
                  Venue: SIET Coimbatore Tech Park. Track check-in, audit milestones, and physical team presence.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="bg-[#B6FF00] text-[#111116] px-2 py-0.5 rounded font-bold">
                  CHECK-IN: 08:30 AM
                </span>
                <span className="bg-[#00E5FF] text-[#111116] px-2 py-0.5 rounded font-bold">
                  AUDIT 1: 04:30 PM
                </span>
                <span className="bg-[#FF2E93] text-white px-2 py-0.5 rounded font-bold">
                  AUDIT 2: 01:00 AM
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {shortlistedTeams.map((team) => {
                const teamAttendance = attendanceData[team.team_id] || {};

                return (
                  <div key={team.team_id} className="p-4 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#111116]/10 gap-3">
                      <div>
                        <span className="font-mono text-xs font-black text-[#0055FF] mr-2">
                          {team.team_id}
                        </span>
                        <strong className="text-sm text-[#111116]">{team.team_name}</strong>
                      </div>

                      {/* Milestone Checkboxes */}
                      <div className="flex items-center gap-4 font-mono text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(teamAttendance.checkin)}
                            onChange={() => toggleAttendanceCheck(team.team_id, 'checkin')}
                            className="w-4 h-4 rounded border-[#111116]"
                          />
                          <span className="font-bold">Desk Check-in</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(teamAttendance.audit1)}
                            onChange={() => toggleAttendanceCheck(team.team_id, 'audit1')}
                            className="w-4 h-4 rounded border-[#111116]"
                          />
                          <span className="font-bold">Jury Audit 01</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(teamAttendance.audit2)}
                            onChange={() => toggleAttendanceCheck(team.team_id, 'audit2')}
                            className="w-4 h-4 rounded border-[#111116]"
                          />
                          <span className="font-bold">Midnight Audit 02</span>
                        </label>
                      </div>
                    </div>

                    {/* Member Attendance */}
                    <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      {team.members?.map((m, mIdx) => (
                        <label key={mIdx} className="flex items-center gap-2 p-2 bg-white rounded border border-[#111116]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(teamAttendance.members?.[mIdx])}
                            onChange={() => toggleAttendanceCheck(team.team_id, null, mIdx)}
                            className="w-3.5 h-3.5 rounded"
                          />
                          <span className="truncate">{m.full_name || m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 4: 24H LIVE ARENA CLOCK & BROADCAST CONTROLLER
           =================================================================== */}
        {activeTab === 'CLOCK' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#111116]" />
                <h3 className="font-mono text-xs font-black uppercase text-[#111116]">
                  24H ARENA CLOCK & BROADCAST CONTROLLER
                </h3>
              </div>
              <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116] ${
                clockState === 'RUNNING' ? 'bg-[#B6FF00] text-[#111116]' : 'bg-[#FFE500] text-[#111116]'
              }`}>
                {clockState}
              </span>
            </div>

            {/* Public Banner Mounting Switch */}
            <div className="p-4 bg-[#FBFBFB] rounded-2xl border-2 border-[#111116] flex items-center justify-between">
              <div>
                <div className="font-black text-sm text-[#111116]">Public Live Arena Banner</div>
                <div className="text-xs text-[#111116]/70 mt-0.5">
                  Mounts the high-contrast live clock and announcement ticker at the top of the homepage (<code>/</code>).
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsClockPublic(!isClockPublic)}
                className={`w-14 h-8 rounded-full border-2 border-[#111116] transition-colors p-1 flex items-center cursor-pointer ${
                  isClockPublic ? 'bg-[#B6FF00] justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white border border-[#111116]" />
              </button>
            </div>

            {/* Clock Controls */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                Arena Countdown Clock Controls
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleBroadcastClock('RUNNING')}
                  className="h-12 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START CLOCK</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBroadcastClock('PAUSED')}
                  className="h-12 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE CLOCK</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBroadcastClock('STOPPED')}
                  className="h-12 bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>RESET CLOCK</span>
                </button>
              </div>
            </div>

            {/* Live Announcement Ticker Broadcast */}
            <div>
              <label htmlFor="ticker-text" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Broadcast Live Announcement Ticker
              </label>
              <textarea
                id="ticker-text"
                rows={3}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Type urgent announcement for participants..."
                className="w-full bg-white border-2 border-[#111116] rounded-xl p-3 text-xs font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
              <button
                type="button"
                onClick={() => handleBroadcastClock(clockState)}
                className="mt-3 w-full h-12 bg-[#111116] text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] hover:bg-black/90 cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-[#B6FF00]" />
                <span>BROADCAST TICKER ANNOUNCEMENT TO HOMEPAGE</span>
              </button>
            </div>

            {clockBroadcastMsg && (
              <div className="p-3 bg-[#B6FF00]/15 border-2 border-[#B6FF00] rounded-xl font-mono text-xs text-[#111116] font-bold text-center">
                {clockBroadcastMsg}
              </div>
            )}

          </div>
        )}

        {/* ===================================================================
            TAB 5: CAPACITY CAP, CHECKOUT & REGISTRATION WINDOW OPS
           =================================================================== */}
        {activeTab === 'OPS' && (
          <div className="space-y-6">
            {opsToast && (
              <div className="p-3.5 bg-[#B6FF00]/20 border-2 border-[#111116] rounded-xl font-mono text-xs font-black text-[#111116]">
                {opsToast}
              </div>
            )}

            {/* Ops KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Active Teams / Cap</div>
                <div className="text-2xl font-black text-[#111116] mt-0.5">{totalTeamsCount} / {maxTeamsCapInput}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#B6FF00]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Paid Verified Teams</div>
                <div className="text-2xl font-black text-[#111116] mt-0.5">{paidVerifiedCount}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#FFE500]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Proofs Awaiting Review</div>
                <div className="text-2xl font-black text-[#111116] mt-0.5">{submittedProofCount}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#FF2E93]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Outstanding Sync Failures</div>
                <div className="text-2xl font-black text-[#FF2E93] mt-0.5">
                  {(adminOverview.sync_jobs || []).filter(j => j.status !== 'SYNCED').length}
                </div>
              </div>
            </div>

            {/* Supabase-Persisted Cap, Checkout & Registration Overrides */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#00E5FF] p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#111116]/10 pb-3 flex-wrap gap-2">
                <h3 className="font-mono text-xs font-black uppercase text-[#111116]">
                  SUPABASE CAPACITY, PAYMENT &amp; WINDOW CONTROLS
                </h3>
                <span className="font-mono text-[11px] font-bold text-[#0055FF]">
                  Checkout Open: {paymentOpenToggle ? 'YES' : 'NO'} · Reg Open: {adminOverview.window_status?.registration_open ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]/20 space-y-2">
                  <div className="font-black text-[#111116]">Registration Window Override</div>
                  <select
                    value={regOverride}
                    onChange={(e) => setRegOverride(e.target.value)}
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 font-bold"
                  >
                    <option value="AUTO">AUTO (Closes Dec 12, 11:59 PM IST)</option>
                    <option value="FORCE_OPEN">FORCE_OPEN (Admin Override)</option>
                    <option value="FORCE_CLOSED">FORCE_CLOSED (Emergency Close)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]/20 space-y-2">
                  <div className="font-black text-[#111116]">Live UPI Payment Switch</div>
                  <select
                    value={paymentOpenToggle ? 'OPEN' : 'LOCKED'}
                    onChange={(e) => setPaymentOpenToggle(e.target.value === 'OPEN')}
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 font-bold"
                  >
                    <option value="LOCKED">LOCKED (Pending Verified QR)</option>
                    <option value="OPEN">OPEN (Live Checkout Active)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]/20 space-y-2">
                  <div className="font-black text-[#111116]">Max Team Capacity</div>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={maxTeamsCapInput}
                    onChange={(e) => setMaxTeamsCapInput(e.target.value)}
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 font-black"
                  />
                </div>

                <div className="p-4 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]/20 space-y-2">
                  <div className="font-black text-[#111116]">Reservation TTL (Minutes)</div>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={reservationMinsInput}
                    onChange={(e) => setReservationMinsInput(e.target.value)}
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 font-black"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveWindowOverrides()}
                className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116] cursor-pointer"
              >
                Save Ops Settings to Supabase Database →
              </button>
            </div>

            {/* Secondary Sync Jobs Reconciliation Table */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6">
              <h3 className="font-mono text-xs font-black uppercase text-[#111116] mb-3">
                GOOGLE SHEET &amp; EMAIL SYNC RECONCILIATION QUEUE
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FBFBFB] border-b-2 border-[#111116]/10">
                    <tr>
                      <th className="p-2.5">TEAM ID</th>
                      <th className="p-2.5">JOB TYPE</th>
                      <th className="p-2.5">STATUS</th>
                      <th className="p-2.5">ERROR / NOTE</th>
                      <th className="p-2.5 text-right">RECONCILE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111116]/10">
                    {(adminOverview.sync_jobs || []).slice(0, 25).map((job) => (
                      <tr key={job.id}>
                        <td className="p-2.5 font-black text-[#0055FF]">{job.team_id || '-'}</td>
                        <td className="p-2.5">{job.job_type}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-black border border-[#111116] ${
                            job.status === 'SYNCED' ? 'bg-[#B6FF00]' : job.status === 'FAILED' ? 'bg-[#FF2E93] text-white' : 'bg-[#FFE500]'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-[#111116]/70 max-w-xs truncate">{job.last_error || '-'}</td>
                        <td className="p-2.5 text-right">
                          {job.status !== 'SYNCED' && job.team_id && (
                            <button
                              type="button"
                              disabled={retryingSyncId === job.id}
                              onClick={() => handleRetrySync(job)}
                              className="px-3 py-1 bg-[#111116] text-[#FFE500] rounded-lg font-bold cursor-pointer"
                            >
                              {retryingSyncId === job.id ? 'Retrying...' : 'Retry Sync'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!adminOverview.sync_jobs || adminOverview.sync_jobs.length === 0) && (
                      <tr><td colSpan={5} className="p-4 text-center text-[#111116]/50">No sync jobs logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legacy Upload & Receipt Audit History */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6">
              <h3 className="font-mono text-xs font-black uppercase text-[#111116] mb-3">
                LEGACY PRE-CONVERSION UPLOAD LOGS &amp; RECEIPT VERSIONS
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FBFBFB] border-b-2 border-[#111116]/10">
                    <tr>
                      <th className="p-2.5">TEAM ID</th>
                      <th className="p-2.5">ATTEMPT</th>
                      <th className="p-2.5">STATUS</th>
                      <th className="p-2.5">FILE / RECEIPT</th>
                      <th className="p-2.5">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111116]/10">
                    {(adminOverview.recent_attempts || []).slice(0, 25).map((att) => (
                      <tr key={att.id}>
                        <td className="p-2.5 font-black text-[#0055FF]">{att.team_id}</td>
                        <td className="p-2.5">#{att.attempt_number}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-black border border-[#111116] ${
                            att.status === 'CONFIRMED' ? 'bg-[#B6FF00]' : att.status === 'FAILED' || att.status === 'INTERRUPTED' ? 'bg-[#FF2E93] text-white' : 'bg-[#FFE500]'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="p-2.5 truncate max-w-xs">
                          {att.receipt_id ? `${att.receipt_id} (${att.file_name})` : (att.error_message || att.file_name)}
                        </td>
                        <td className="p-2.5">{new Date(att.started_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!adminOverview.recent_attempts || adminOverview.recent_attempts.length === 0) && (
                      <tr><td colSpan={5} className="p-4 text-center text-[#111116]/50">No PPT upload attempts recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* High-Impact Delete Confirmation Modal */}
      {teamToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-[#111116]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isDeleting && setTeamToDelete(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl border-3 border-[#111116] shadow-[10px_10px_0px_0px_#111116] p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF2E93]/15 text-[#FF2E93] border-2 border-[#111116] shadow-[3px_3px_0px_#111116] flex items-center justify-center mb-5">
              <Trash2 className="w-7 h-7 text-[#FF2E93]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-100 text-red-700 font-mono text-[10px] font-black uppercase mb-2">
              <span>TEST ENTRY REMOVAL</span>
            </div>

            <h3 className="text-xl font-black text-[#111116] tracking-tight mb-2">
              Permanently Delete Team?
            </h3>

            <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete team <strong className="text-[#0055FF]">{teamToDelete.team_id}</strong> (<em>{teamToDelete.team_name}</em>) and its <strong>{teamToDelete.members?.length || teamToDelete.team_size || 3} squad members</strong>?
            </p>

            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 font-mono text-xs mb-6">
              ⚠️ This will delete the team registration, member records, database submissions, and associated Google Drive artifacts immediately.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTeamToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-black/5 text-[#111116] font-mono text-xs font-bold rounded-xl border-2 border-[#111116] cursor-pointer active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
