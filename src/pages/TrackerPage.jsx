import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  getTrackerRoster, 
  getLiveEventState, 
  revokeExpiredSeatAndPromote, 
  adminUpdateTeamStatus,
  adminLogin,
  exportRegistrationsToXLSX,
  sendShortlistNotificationEmail,
  adminDeleteTeam
} from '../lib/api';
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
  const [round1Filter, setRound1Filter] = useState('ALL'); // ALL, SHORTLISTED, PENDING, WAITLISTED, REJECTED
  const [selectedTeam, setSelectedTeam] = useState(null); // Selected team for split-screen / modal PDF preview
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);

  // Manual Refresh & Feedback State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState('');

  // 1-Click Copy Passcode Feedback State
  const [copiedPasscodeTeamId, setCopiedPasscodeTeamId] = useState(null);

  // Shortlist Email Dispatch State
  const [sendingEmailTeamId, setSendingEmailTeamId] = useState(null);
  const [isSendingAllEmails, setIsSendingAllEmails] = useState(false);
  const [emailToast, setEmailToast] = useState('');
  const [emailSentMap, setEmailSentMap] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('veltraxx_shortlist_emails_sent') : null;
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Permanent Delete Confirmation State (For test entry removal)
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Layout View Mode: 'STRIPES' (default full-width detailed cards) | 'SPLIT' (side-by-side)
  const [layoutMode, setLayoutMode] = useState('STRIPES');

  // Apple-Grade Animated PPT / Google Drive Modal State
  const [previewModalTeam, setPreviewModalTeam] = useState(null);
  const modalRef = useRef(null);
  const modalCardRef = useRef(null);

  const openPptModal = (team) => {
    setPreviewModalTeam(team);
    setSelectedTeam(team);
  };

  const closePptModal = () => {
    if (modalCardRef.current && modalRef.current) {
      gsap.to(modalCardRef.current, {
        scale: 0.94,
        opacity: 0,
        y: 15,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => setPreviewModalTeam(null)
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.18
      });
    } else {
      setPreviewModalTeam(null);
    }
  };

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewModalTeam) {
        closePptModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalTeam]);

  // Animate modal in when opened
  useEffect(() => {
    if (previewModalTeam && modalCardRef.current && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' }
      );
      gsap.fromTo(
        modalCardRef.current,
        { scale: 0.93, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: 'back.out(1.4)' }
      );
    }
  }, [previewModalTeam]);

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

    // Load initial event state
    getLiveEventState().then(state => {
      if (state) {
        setIsClockPublic(Boolean(state.is_clock_public));
        setClockState(state.clock_state || 'STOPPED');
        if (state.live_announcement_text) setAnnouncementText(state.live_announcement_text);
        if (state.round2_fee_per_member) setRound2FeePerMember(state.round2_fee_per_member);
      }
    }).catch(() => {});
  }, []);

  const loadRoster = async (token) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const data = await getTrackerRoster(token);
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
      setIsUnlocked(true);
    } catch (err) {
      setIsUnlocked(false);
      setAuthError(err.message || "Invalid Coordinator Session.");
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToast('');
    try {
      const token = authData?.token || 'session_token';
      await loadRoster(token);
      setRefreshToast('✓ Live Roster synced successfully!');
      setTimeout(() => setRefreshToast(''), 3500);
    } catch (err) {
      setRefreshToast(err.message || 'Failed to refresh roster');
      setTimeout(() => setRefreshToast(''), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendShortlistEmail = async (team) => {
    setSendingEmailTeamId(team.team_id);
    setEmailToast('');
    try {
      const result = await sendShortlistNotificationEmail({ team });
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedMap = {
        ...emailSentMap,
        [team.team_id]: {
          sentAt: nowStr,
          date: new Date().toLocaleDateString(),
          recipients: result.recipients
        }
      };
      setEmailSentMap(updatedMap);
      try {
        localStorage.setItem('veltraxx_shortlist_emails_sent', JSON.stringify(updatedMap));
      } catch {}
      setEmailToast(`✓ Shortlist invitation dispatched to Team ${team.team_id} (${result.recipients.length} members)!`);
      setTimeout(() => setEmailToast(''), 4500);
    } catch (err) {
      setEmailToast(`Failed to send email: ${err.message}`);
      setTimeout(() => setEmailToast(''), 4500);
    } finally {
      setSendingEmailTeamId(null);
    }
  };

  const handleSendAllShortlistEmails = async () => {
    const pendingTeams = shortlistedTeams.filter(t => !emailSentMap[t.team_id]);
    const targetTeams = pendingTeams.length > 0 ? pendingTeams : shortlistedTeams;
    
    if (targetTeams.length === 0) {
      setEmailToast('No shortlisted teams available to email.');
      setTimeout(() => setEmailToast(''), 3000);
      return;
    }

    setIsSendingAllEmails(true);
    setEmailToast(`Dispatching emails to ${targetTeams.length} shortlisted squads...`);

    let sentCount = 0;
    const currentMap = { ...emailSentMap };

    for (const team of targetTeams) {
      try {
        const result = await sendShortlistNotificationEmail({ team });
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentMap[team.team_id] = {
          sentAt: nowStr,
          date: new Date().toLocaleDateString(),
          recipients: result.recipients
        };
        sentCount++;
      } catch (err) {
        console.warn(`Failed to email team ${team.team_id}:`, err);
      }
      await new Promise(r => setTimeout(r, 600));
    }

    setEmailSentMap(currentMap);
    try {
      localStorage.setItem('veltraxx_shortlist_emails_sent', JSON.stringify(currentMap));
    } catch {}
    setIsSendingAllEmails(false);
    setEmailToast(`✓ Successfully sent shortlist invitations to ${sentCount} teams!`);
    setTimeout(() => setEmailToast(''), 5000);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    try {
      const token = authData?.token || 'session_token';
      await adminDeleteTeam(token, teamToDelete.team_id);
      setTeams(prev => prev.filter(t => t.team_id !== teamToDelete.team_id));
      if (selectedTeam?.team_id === teamToDelete.team_id) {
        setSelectedTeam(null);
      }
      if (previewModalTeam?.team_id === teamToDelete.team_id) {
        closePptModal();
      }
      setRefreshToast(`✓ Team ${teamToDelete.team_id} (${teamToDelete.team_name}) permanently deleted!`);
      setTimeout(() => setRefreshToast(''), 4000);
      setTeamToDelete(null);
    } catch (err) {
      setRefreshToast(`Failed to delete team: ${err.message}`);
      setTimeout(() => setRefreshToast(''), 4000);
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
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthData(null);
    setIsUnlocked(false);
    setTeams([]);
  };

  // 1-Click Status Toggles in Tab 1
  const updateTeamStatus = (teamIdToUpdate, newStatus, isShortlistedVal) => {
    const shortlistedAt = isShortlistedVal ? new Date().toISOString() : null;
    const paymentDeadline = isShortlistedVal ? new Date(Date.now() + 36 * 3600 * 1000).toISOString() : null;

    setTeams(prev => prev.map(t => {
      if (t.team_id === teamIdToUpdate) {
        const updated = {
          ...t,
          round1_status: newStatus,
          is_shortlisted: isShortlistedVal,
          shortlisted_at: isShortlistedVal ? (t.shortlisted_at || shortlistedAt) : null,
          payment_deadline: isShortlistedVal ? (t.payment_deadline || paymentDeadline) : null
        };
        if (selectedTeam?.team_id === teamIdToUpdate) {
          setSelectedTeam(updated);
        }
        return updated;
      }
      return t;
    }));

    if (authData?.token) {
      adminUpdateTeamStatus(authData.token, teamIdToUpdate, newStatus, isShortlistedVal).catch(() => {});
    }
  };

  // Tab 2: Action to revoke expired seats & promote earliest waitlist team
  const handleRevokeExpiredAndPromote = async () => {
    if (!authData?.token) return;
    setIsRevoking(true);
    setRevokeNotification(null);
    try {
      const result = await revokeExpiredSeatAndPromote(authData.token);
      const msg = result.message || `Revoked ${result.revoked_count || 0} expired seat(s) and promoted ${result.promoted_count || 0} waitlist team(s).`;
      setRevokeNotification({
        type: 'success',
        message: msg
      });
      // Refresh teams roster
      const freshTeams = await getTrackerRoster(authData.token);
      setTeams(freshTeams);
    } catch (err) {
      setRevokeNotification({
        type: 'error',
        message: err.message || "Failed to execute seat revocation."
      });
    } finally {
      setIsRevoking(false);
    }
  };

  // Tab 2: Manual Waitlist Promotion
  const handlePromoteWaitlistTeam = async (teamId) => {
    if (!authData?.token) return;
    try {
      await adminUpdateTeamStatus(authData.token, teamId, 'shortlisted', true);
      const freshTeams = await getTrackerRoster(authData.token);
      setTeams(freshTeams);
      setRevokeNotification({
        type: 'success',
        message: `Team ${teamId} has been promoted to Round 2 Shortlist with a fresh 36-hour payment deadline.`
      });
    } catch (err) {
      setRevokeNotification({
        type: 'error',
        message: err.message || `Failed to promote team ${teamId}.`
      });
    }
  };

  // 1-Click Paid & Verified Toggle in Tab 2
  const togglePaidVerified = (teamIdToToggle) => {
    setTeams(prev => prev.map(t => {
      if (t.team_id === teamIdToToggle) {
        return { ...t, is_paid_verified: !t.is_paid_verified };
      }
      return t;
    }));
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

  // Save Dynamic Fee to Event State
  const handleSaveDynamicFee = () => {
    const fee = parseInt(round2FeePerMember, 10) || 500;
    try {
      const raw = localStorage.getItem(EVENT_STATE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.round2_fee_per_member = fee;
      localStorage.setItem(EVENT_STATE_STORAGE_KEY, JSON.stringify(parsed));
      setFeeSaveMessage("Round 2 fee updated successfully!");
      setTimeout(() => setFeeSaveMessage(''), 3000);
    } catch {}
  };

  // Broadcast Live Clock State
  const handleBroadcastClock = (newClockState) => {
    setClockState(newClockState);
    try {
      const raw = localStorage.getItem(EVENT_STATE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.is_clock_public = isClockPublic;
      parsed.clock_state = newClockState;
      parsed.live_announcement_text = announcementText;
      if (newClockState === 'RUNNING' && !parsed.clock_start_timestamp) {
        parsed.clock_start_timestamp = new Date().toISOString();
        parsed.clock_end_timestamp = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      }
      localStorage.setItem(EVENT_STATE_STORAGE_KEY, JSON.stringify(parsed));
      setClockBroadcastMsg(`Clock status: ${newClockState} broadcast live!`);
      setTimeout(() => setClockBroadcastMsg(''), 3000);
    } catch {}
  };

  // Download Flat-Row Master CSV (1 row per student, ~1,000 rows)
  const downloadMasterCsv = () => {
    const headers = [
      "Team ID",
      "Team Name",
      "Track ID",
      "Problem Statement",
      "Academic Tier",
      "Member Role",
      "Student Name",
      "Email",
      "Phone",
      "College Name",
      "Department",
      "Year of Study",
      "Round 1 Status",
      "Is Shortlisted",
      "Round 2 Paid"
    ];

    const rows = [];
    teams.forEach(team => {
      const teamMembers = team.members || [];
      teamMembers.forEach((m, idx) => {
        rows.push([
          team.team_id,
          `"${(team.team_name || '').replace(/"/g, '""')}"`,
          team.track_id || '',
          team.problem_code || '',
          team.academic_tier || '',
          idx === 0 ? 'Leader' : `Member ${idx + 1}`,
          `"${(m.full_name || m.name || '').replace(/"/g, '""')}"`,
          m.email || '',
          m.phone || '',
          `"${(m.college_name || '').replace(/"/g, '""')}"`,
          m.department || '',
          m.year_of_study || '',
          team.round1_status || 'pending',
          team.is_shortlisted ? 'YES' : 'NO',
          team.is_paid_verified ? 'PAID' : 'PENDING'
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VELTRAXX_2.0_Master_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Teams for Tab 1 - Comprehensive Multi-Field Search
  const filteredRound1Teams = teams.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (round1Filter === 'ALL') return true;
      if (round1Filter === 'SHORTLISTED') return t.is_shortlisted;
      if (round1Filter === 'PENDING') return t.round1_status === 'pending';
      if (round1Filter === 'WAITLISTED') return t.round1_status === 'waitlist' || t.round1_status === 'waitlisted';
      if (round1Filter === 'REJECTED') return t.round1_status === 'rejected';
      return true;
    }

    // Match team-level fields
    const teamMatches = 
      (t.team_id && t.team_id.toLowerCase().includes(q)) || 
      (t.team_name && t.team_name.toLowerCase().includes(q)) ||
      (t.problem_code && t.problem_code.toLowerCase().includes(q)) ||
      (t.track_id && t.track_id.toLowerCase().includes(q)) ||
      (t.academic_tier && t.academic_tier.toLowerCase().includes(q)) ||
      (t.secret_passcode && t.secret_passcode.toLowerCase().includes(q)) ||
      (t.round1_status && t.round1_status.toLowerCase().includes(q)) ||
      (t.utr_number && String(t.utr_number).toLowerCase().includes(q));

    // Match member-level fields across the entire squad (Name, College, Phone, Email, Dept, Year, Roll No)
    const memberMatches = Array.isArray(t.members) && t.members.some(m => {
      const name = (m.full_name || m.name || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const phone = String(m.phone || '').toLowerCase();
      const college = (m.college_name || m.college || '').toLowerCase();
      const dept = (m.department || '').toLowerCase();
      const year = (m.year_of_study || '').toLowerCase();
      const roll = String(m.roll_number || m.reg_no || '').toLowerCase();

      return name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        college.includes(q) ||
        dept.includes(q) ||
        year.includes(q) ||
        roll.includes(q);
    });

    const matchesSearch = teamMatches || memberMatches;
    if (!matchesSearch) return false;

    if (round1Filter === 'ALL') return true;
    if (round1Filter === 'SHORTLISTED') return t.is_shortlisted;
    if (round1Filter === 'PENDING') return t.round1_status === 'pending';
    if (round1Filter === 'WAITLISTED') return t.round1_status === 'waitlist' || t.round1_status === 'waitlisted';
    if (round1Filter === 'REJECTED') return t.round1_status === 'rejected';
    return true;
  });

  // Shortlisted Teams for Tab 2 & 3
  const shortlistedTeams = teams.filter(t => t.is_shortlisted);

  // Dedicated Waitlisted Teams for Tab 2 Reserves Queue (Ordered FIFO by registration time)
  const waitlistedTeams = teams
    .filter(t => t.round1_status === 'waitlisted' || t.round1_status === 'waitlist')
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

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
            Sign in with your authorized coordinator credentials to access the evaluation roster, pitch deck inspector, and arena clock controller.
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
                placeholder="e.g. darshan@veltraxx.in"
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
            Authorized Personnel: darshan@veltraxx.in · subiksha@veltraxx.in · dhilipkumar@siet.ac.in
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // UNLOCKED 4-TAB ADMIN COMMAND CENTER
  // =========================================================================
  // Executive KPI Roster Metrics
  const totalTeamsCount = teams.length;
  const pendingTeamsCount = teams.filter(t => !t.is_shortlisted && (t.round1_status === 'pending' || !t.round1_status)).length;
  const shortlistedTeamsCount = teams.filter(t => t.is_shortlisted).length;
  const waitlistedTeamsCount = teams.filter(t => t.round1_status === 'waitlist' || t.round1_status === 'waitlisted').length;
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
      {(refreshToast || emailToast) && (
        <div className="fixed top-18 right-4 sm:right-8 z-50 flex flex-col gap-2.5 pointer-events-none">
          {refreshToast && (
            <div className="px-4 py-2.5 rounded-xl bg-[#111116] text-[#B6FF00] font-mono text-xs font-black border-2 border-[#B6FF00] shadow-[4px_4px_0px_#111116] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B6FF00]" />
              <span>{refreshToast}</span>
            </div>
          )}
          {emailToast && (
            <div className="px-4 py-2.5 rounded-xl bg-[#111116] text-[#FFE500] font-mono text-xs font-black border-2 border-[#FFE500] shadow-[4px_4px_0px_#111116] flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-[#FFE500]" />
              <span>{emailToast}</span>
            </div>
          )}
        </div>
      )}

      {/* Tactile Folder Index Navigation Tabs (Zero 'Tab X' Slop) */}
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
            <span>Round 1 Evaluation ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROUND2')}
            className={`px-5 py-3 rounded-t-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ROUND2'
                ? 'bg-[#F4F4F6] text-[#111116] border-t-3 border-x-3 border-[#111116] shadow-sm -mb-[2px] relative z-10'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-t border-x border-white/10'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#B6FF00]" />
            <span>Finalist Cohort ({shortlistedTeams.length})</span>
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

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* ===================================================================
            ROUND 1 EVALUATION ROSTER & PRESENTATION VIEWER
           =================================================================== */}
        {activeTab === 'ROUND1' && (
          <div>
            
            {/* Executive KPI Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Total Registered</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5">{totalTeamsCount}</div>
                <div className="text-[10px] font-mono text-[#0055FF] font-bold mt-1">100% Free Entry Squads</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Pending Evaluation</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5">{pendingTeamsCount}</div>
                <div className="text-[10px] font-mono text-[#6B6B78] font-bold mt-1">Awaiting Review</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Shortlisted Squads</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5 flex items-center gap-1.5">
                  <span>{shortlistedTeamsCount}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF00] border border-[#111116] inline-block" />
                </div>
                <div className="text-[10px] font-mono text-[#111116]/70 font-bold mt-1">Round 2 Candidates</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116]">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Waitlist Reserves</div>
                <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-0.5">{waitlistedTeamsCount}</div>
                <div className="text-[10px] font-mono text-[#111116]/70 font-bold mt-1">FIFO Backup Queue</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116] col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60">Rejected / Closed</div>
                <div className="text-2xl sm:text-3xl font-black text-[#FF2E93] mt-0.5">{rejectedTeamsCount}</div>
                <div className="text-[10px] font-mono text-[#FF2E93] font-bold mt-1">Disqualified</div>
              </div>
            </div>

            {/* Action Bar: Search, Filters, Bulk Email Dispatch, View Mode Toggle & Master XLSX/CSV Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search - Full Spectrum Search (Team ID, Name, College, Phone, Roll No, Dept, Passcode) */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#111116]/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, Name, College, Phone, Roll..."
                    className="w-full h-10 bg-white border-2 border-[#111116] rounded-xl pl-9 pr-3 text-xs font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-[#111116] overflow-x-auto no-scrollbar">
                  {['ALL', 'PENDING', 'SHORTLISTED', 'WAITLISTED', 'REJECTED'].map((filter) => {
                    const isSelected = round1Filter === filter;
                    let activeClass = 'bg-[#111116] text-[#FFE500]';
                    if (filter === 'SHORTLISTED') activeClass = 'bg-[#B6FF00] text-[#111116] shadow-xs';
                    if (filter === 'WAITLISTED') activeClass = 'bg-[#FFE500] text-[#111116] shadow-xs';
                    if (filter === 'PENDING') activeClass = 'bg-[#71717A] text-white shadow-xs';
                    if (filter === 'REJECTED') activeClass = 'bg-[#FF2E93] text-white shadow-xs';

                    return (
                      <button
                        key={filter}
                        onClick={() => setRound1Filter(filter)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-black cursor-pointer whitespace-nowrap transition-colors ${
                          isSelected
                            ? activeClass
                            : 'text-[#111116]/70 hover:text-[#111116] hover:bg-black/5'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                {/* Bulk Shortlist Email Dispatch */}
                {shortlistedTeams.length > 0 && (
                  <button
                    onClick={handleSendAllShortlistEmails}
                    disabled={isSendingAllEmails}
                    className="h-10 px-3.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-60 shrink-0"
                    title="Send official shortlist emails with Team ID and Secret Passcode to all shortlisted squads"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingAllEmails ? 'animate-spin' : ''}`} />
                    <span>
                      {isSendingAllEmails 
                        ? 'Dispatching Emails...' 
                        : `Send Emails to Shortlisted (${shortlistedTeams.filter(t => !emailSentMap[t.team_id]).length} Pending)`}
                    </span>
                  </button>
                )}

                {/* Layout View Mode Toggle */}
                <div className="flex items-center bg-white p-1 rounded-xl border-2 border-[#111116]">
                  <button
                    onClick={() => setLayoutMode('STRIPES')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                      layoutMode === 'STRIPES'
                        ? 'bg-[#FFE500] text-[#111116]'
                        : 'text-[#111116]/60 hover:text-[#111116]'
                    }`}
                    title="Full-width detailed roster cards"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Detailed Stripes</span>
                  </button>
                  <button
                    onClick={() => setLayoutMode('SPLIT')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                      layoutMode === 'SPLIT'
                        ? 'bg-[#FFE500] text-[#111116]'
                        : 'text-[#111116]/60 hover:text-[#111116]'
                    }`}
                    title="Side-by-side roster and PDF pane"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                </div>
              </div>

              {/* Master Merged-Row & Summary Exports */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportRegistrationsToXLSX(teams)}
                  className="h-10 px-4 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
                  title="Export Member-Wise Detailed Roster with merged team cells & college groupings, plus flat summary sheet"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>EXPORT MASTER XLSX</span>
                </button>

                <button
                  type="button"
                  onClick={downloadMasterCsv}
                  className="h-10 px-3.5 bg-white hover:bg-white/80 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0"
                  title="Download lightweight CSV"
                >
                  <span>CSV</span>
                </button>
              </div>

            </div>

            {/* Layout Mode 1: Full-Width Detailed Stripes (Default View - Google Drive is minimizable) */}
            {layoutMode === 'STRIPES' && (
              <div className="space-y-4">
                {filteredRound1Teams.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_#111116] font-mono text-xs text-[#111116]/60">
                    No teams found matching current search or status filter.
                  </div>
                ) : (
                  filteredRound1Teams.map((team) => {
                    const isShortlisted = team.is_shortlisted;
                    const status = team.round1_status || 'pending';

                    return (
                      <div 
                        key={team.team_id}
                        className="bg-white rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[6px_6px_0px_0px_#111116] transition-all p-5 sm:p-6"
                      >
                        {/* Stripe Top: Header Row */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b-2 border-[#111116]/10 mb-4">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#0055FF]/10 text-[#0055FF] border border-[#0055FF]/30">
                              {team.team_id}
                            </span>
                            <h3 className="font-black text-lg text-[#111116]">
                              {team.team_name}
                            </h3>

                            {/* Prominent Secret Passcode with 1-Click Copy */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFE500]/25 border border-[#111116] shadow-[1px_1px_0px_#111116]" title="Coordinator & Team Secret Passcode">
                              <KeyRound className="w-3.5 h-3.5 text-[#111116]" />
                              <span className="font-mono text-xs font-black text-[#111116] tracking-wider select-all">
                                {team.secret_passcode || "VTX-PASS"}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(team.secret_passcode || '');
                                  setCopiedPasscodeTeamId(team.team_id);
                                  setTimeout(() => setCopiedPasscodeTeamId(null), 2000);
                                }}
                                className="p-1 hover:bg-[#FFE500] rounded text-[#111116] transition-colors cursor-pointer"
                                title="Copy Secret Passcode"
                              >
                                {copiedPasscodeTeamId === team.team_id ? (
                                  <span className="text-[10px] font-mono font-bold text-green-700">✓</span>
                                ) : (
                                  <Copy className="w-3 h-3 text-[#111116]" />
                                )}
                              </button>
                            </div>

                            <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#111116] text-[#FFE500]">
                              {team.problem_code || 'VTX-T1-01'}
                            </span>
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-black/5 text-[#111116]">
                              {team.track_id || 'Track 1'}
                            </span>
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFE500]/30 text-[#111116] border border-[#111116]/20">
                              {team.academic_tier === 'tier_a' ? 'Tier A (Junior)' : 'Tier B (Senior)'}
                            </span>
                          </div>

                          {/* Status Badge & Email Indicator */}
                          <div className="flex items-center gap-2.5">
                            {isShortlisted && (
                              emailSentMap[team.team_id] ? (
                                <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#B6FF00]/25 text-[#111116] border border-[#111116]/30 flex items-center gap-1.5" title={`Dispatched at ${emailSentMap[team.team_id].sentAt}`}>
                                  <Check className="w-3.5 h-3.5 text-green-700 stroke-[3]" />
                                  <span>Email Sent ({emailSentMap[team.team_id].sentAt})</span>
                                </span>
                              ) : (
                                <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Email Pending</span>
                                </span>
                              )
                            )}
                            <span className="font-mono text-[10px] text-[#6B6B78]">
                              {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                            <span className={`font-mono text-xs font-black px-3 py-1 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] ${
                              isShortlisted 
                                ? 'bg-[#B6FF00] text-[#111116]' 
                                : status === 'rejected'
                                  ? 'bg-[#FF2E93] text-white'
                                  : status === 'waitlist' || status === 'waitlisted'
                                    ? 'bg-[#FFE500] text-[#111116]'
                                    : 'bg-[#E4E4E7] text-[#111116]/80'
                            }`}>
                              {isShortlisted ? 'SHORTLISTED' : (status === 'waitlist' || status === 'waitlisted' ? 'WAITLISTED' : status.toUpperCase())}
                            </span>
                          </div>
                        </div>

                        {/* Stripe Middle: Team Members Grid */}
                        <div className="mb-4">
                          <div className="text-[10px] font-mono font-black uppercase text-[#111116]/60 mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Registered Squad ({team.members?.length || team.team_size || 4} Members):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {team.members?.map((m, mIdx) => (
                              <div key={mIdx} className="p-2.5 bg-[#FBFBFB] rounded-xl border border-[#111116]/15 text-xs font-mono">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-black text-[#111116] truncate">
                                    {m.full_name || m.name}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    mIdx === 0 ? 'bg-[#FFE500] text-[#111116] font-black' : 'bg-black/5 text-[#6B6B78]'
                                  }`}>
                                    {mIdx === 0 ? 'LEADER' : `M${mIdx + 1}`}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#111116]/80 truncate">{m.department || 'ECE'} · {m.college_name || 'SIET'}</div>
                                <div className="text-[10px] text-[#6B6B78] truncate mt-0.5">{m.phone || m.email}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stripe Bottom: Action Controls, Shortlist Email & Pitch Deck Inspector */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-[#111116]/10">
                          {/* Left: Decision Buttons & Email Dispatch */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-black uppercase text-[#111116]/60 mr-1 hidden sm:inline">Decision:</span>
                            <button
                              onClick={() => updateTeamStatus(team.team_id, 'shortlisted', true)}
                              className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                                isShortlisted ? 'bg-[#B6FF00] text-[#111116] ring-2 ring-[#111116]' : 'bg-white hover:bg-[#B6FF00] text-[#111116]'
                              }`}
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => updateTeamStatus(team.team_id, 'waitlist', false)}
                              className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                                status === 'waitlist' || status === 'waitlisted' ? 'bg-[#FFE500] text-[#111116] ring-2 ring-[#111116]' : 'bg-white hover:bg-[#FFE500] text-[#111116]'
                              }`}
                            >
                              Waitlist
                            </button>
                            <button
                              onClick={() => updateTeamStatus(team.team_id, 'rejected', false)}
                              className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                                status === 'rejected' ? 'bg-[#FF2E93] text-white ring-2 ring-[#111116]' : 'bg-white hover:bg-[#FF2E93] hover:text-white text-[#111116]'
                              }`}
                            >
                              Reject
                            </button>

                            {/* Delete Team (Purge Test Entry) */}
                            <button
                              type="button"
                              onClick={() => setTeamToDelete(team)}
                              className="px-2.5 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                              title="Permanently Delete Team (Purge Test Entry)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>

                            {/* Email Action for Shortlisted Teams */}
                            {isShortlisted && (
                              <button
                                onClick={() => handleSendShortlistEmail(team)}
                                disabled={sendingEmailTeamId === team.team_id}
                                className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                                  emailSentMap[team.team_id]
                                    ? 'bg-[#B6FF00]/40 hover:bg-[#B6FF00] text-[#111116]'
                                    : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116]'
                                }`}
                                title="Send official shortlisted invitation email with Team ID & Passcode to all registered members"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>
                                  {sendingEmailTeamId === team.team_id 
                                    ? 'Sending Email...' 
                                    : emailSentMap[team.team_id] 
                                      ? 'Resend Shortlist Email' 
                                      : 'Send Shortlist Email'}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Right: Pitch Deck Preview Button */}
                          <div>
                            <button
                              onClick={() => openPptModal(team)}
                              className="w-full sm:w-auto px-4 py-2 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_#111116] hover:shadow-[4px_4px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
                            >
                              <FileText className="w-4 h-4 text-[#111116]" />
                              <span>Inspect Pitch Deck (Google Drive)</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#111116]/60" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Layout Mode 2: Split View (Side-by-Side Roster & Embedded PDF) */}
            {layoutMode === 'SPLIT' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (5 Cols): Teams Table */}
                <div className="lg:col-span-5 bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] overflow-hidden">
                  <div className="p-3 bg-[#FBFBFB] border-b-2 border-[#111116]/10 font-mono text-xs font-black flex items-center justify-between">
                    <span>TEAMS LIST ({filteredRound1Teams.length})</span>
                    <span className="text-[#111116]/50">CLICK TEAM TO SELECT</span>
                  </div>

                  <div className="divide-y divide-[#111116]/10 max-h-[650px] overflow-y-auto">
                    {filteredRound1Teams.map((team) => {
                      const isSelected = selectedTeam?.team_id === team.team_id;

                      return (
                        <div
                          key={team.team_id}
                          onClick={() => setSelectedTeam(team)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#FFE500]/20 border-l-4 border-[#111116]' : 'hover:bg-black/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-black text-[#0055FF]">
                              {team.team_id}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFE500]/30 text-[#111116] border border-[#111116]/20">
                                {team.secret_passcode || "KEY"}
                              </span>
                              <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#111116] ${
                                team.is_shortlisted 
                                  ? 'bg-[#B6FF00] text-[#111116]' 
                                  : team.round1_status === 'rejected'
                                    ? 'bg-[#FF2E93] text-white'
                                    : team.round1_status === 'waitlist' || team.round1_status === 'waitlisted'
                                      ? 'bg-[#FFE500] text-[#111116]'
                                      : 'bg-[#E4E4E7] text-[#111116]/80'
                              }`}>
                                {team.is_shortlisted ? 'SHORTLISTED' : (team.round1_status === 'waitlist' || team.round1_status === 'waitlisted' ? 'WAITLISTED' : (team.round1_status || 'PENDING').toUpperCase())}
                              </span>
                            </div>
                          </div>

                          <div className="font-bold text-sm text-[#111116] truncate mb-1">
                            {team.team_name}
                          </div>

                          <div className="font-mono text-[11px] text-[#111116]/70 flex items-center justify-between">
                            <span>{team.problem_code || 'VTX-T1-01'}</span>
                            <span>{team.members?.length || 4} Members</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (7 Cols): Split-Screen In-Browser PDF Preview */}
                <div className="lg:col-span-7 bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6">
                  
                  {selectedTeam ? (
                    <div>
                      {/* Header with 1-Click Status Decisions & Fullscreen Expansion */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[#111116]/10 gap-3 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#0055FF]">
                              {selectedTeam.team_id}
                            </span>
                            <h3 className="text-lg font-black text-[#111116]">
                              {selectedTeam.team_name}
                            </h3>

                            {/* Passcode Chip with 1-Click Copy */}
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFE500]/25 border border-[#111116]">
                              <KeyRound className="w-3 h-3 text-[#111116]" />
                              <span className="font-mono text-[11px] font-black text-[#111116]">
                                {selectedTeam.secret_passcode || 'VTX-KEY'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(selectedTeam.secret_passcode || '');
                                  setCopiedPasscodeTeamId(selectedTeam.team_id);
                                  setTimeout(() => setCopiedPasscodeTeamId(null), 2000);
                                }}
                                className="p-0.5 hover:bg-[#FFE500] rounded text-[#111116] cursor-pointer"
                                title="Copy Passcode"
                              >
                                {copiedPasscodeTeamId === selectedTeam.team_id ? (
                                  <span className="text-[9px] font-bold text-green-700">✓</span>
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="font-mono text-xs text-[#111116]/70 mt-0.5">
                            Problem: {selectedTeam.problem_code} · Tier: {selectedTeam.academic_tier || 'tier_b'}
                          </div>
                        </div>

                        {/* 1-Click Action Buttons, Email Dispatch & Expand */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => updateTeamStatus(selectedTeam.team_id, 'shortlisted', true)}
                            className="px-3 py-1.5 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateTeamStatus(selectedTeam.team_id, 'waitlist', false)}
                            className="px-3 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer"
                          >
                            Waitlist
                          </button>
                          <button
                            onClick={() => updateTeamStatus(selectedTeam.team_id, 'rejected', false)}
                            className="px-3 py-1.5 bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setTeamToDelete(selectedTeam)}
                            className="px-2.5 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white cursor-pointer transition-all flex items-center gap-1"
                            title="Permanently Delete Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                          {selectedTeam.is_shortlisted && (
                            <button
                              onClick={() => handleSendShortlistEmail(selectedTeam)}
                              disabled={sendingEmailTeamId === selectedTeam.team_id}
                              className="px-3 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1 cursor-pointer"
                              title="Send shortlist notification email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>{emailSentMap[selectedTeam.team_id] ? 'Resend' : 'Email'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => openPptModal(selectedTeam)}
                            className="p-1.5 bg-[#111116] text-[#FFE500] rounded-lg border border-[#111116] cursor-pointer"
                            title="Expand to Fullscreen Modal"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* In-Browser PDF Preview */}
                      <div className="w-full aspect-[4/3] bg-[#111116] rounded-xl border-2 border-[#111116] overflow-hidden relative mb-4">
                        <iframe
                          src={selectedTeam.ppt_pdf_drive_url || "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview"}
                          title={`PDF Preview for ${selectedTeam.team_id}`}
                          className="w-full h-full border-0"
                        />
                      </div>

                      {/* Team Members Roster Summary */}
                      <div className="bg-[#FBFBFB] p-4 rounded-xl border border-[#111116]/10">
                        <div className="font-mono text-xs font-black text-[#111116] uppercase mb-2">
                          Registered Team Members:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                          {selectedTeam.members?.map((m, mIdx) => (
                            <div key={mIdx} className="p-2 bg-white rounded-lg border border-[#111116]/10">
                              <div className="font-bold text-[#111116]">{m.full_name || m.name} ({mIdx === 0 ? 'Leader' : 'Member'})</div>
                              <div className="text-[11px] text-[#111116]/60">{m.email} · {m.phone}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="py-20 text-center font-mono text-xs text-[#111116]/50">
                      Select a team from the left table to inspect its presentation PDF.
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Apple-Grade Smooth Animated Pitch Deck Modal Window */}
            {previewModalTeam && (
              <div 
                ref={modalRef}
                className="fixed inset-0 z-50 bg-[#111116]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
                onClick={closePptModal}
              >
                <div 
                  ref={modalCardRef}
                  className="bg-white w-full max-w-5xl rounded-3xl border-3 border-[#111116] shadow-[10px_10px_0px_0px_#111116] overflow-hidden flex flex-col max-h-[92vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 bg-[#FBFBFB] border-b-2 border-[#111116] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFE500] border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center justify-center font-mono font-black text-xs text-[#111116]">
                        PPT
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#0055FF]">
                            {previewModalTeam.team_id}
                          </span>
                          <h3 className="font-black text-base sm:text-lg text-[#111116]">
                            {previewModalTeam.team_name}
                          </h3>

                          {/* Modal Passcode Chip */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFE500]/25 border border-[#111116]">
                            <KeyRound className="w-3 h-3 text-[#111116]" />
                            <span className="font-mono text-[11px] font-black text-[#111116]">
                              {previewModalTeam.secret_passcode || 'VTX-KEY'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(previewModalTeam.secret_passcode || '');
                                setCopiedPasscodeTeamId(previewModalTeam.team_id);
                                setTimeout(() => setCopiedPasscodeTeamId(null), 2000);
                              }}
                              className="p-0.5 hover:bg-[#FFE500] rounded text-[#111116] cursor-pointer"
                              title="Copy Passcode"
                            >
                              {copiedPasscodeTeamId === previewModalTeam.team_id ? (
                                <span className="text-[9px] font-bold text-green-700">✓</span>
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>

                          {/* Modal Live Status Badge */}
                          <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#111116] ${
                            previewModalTeam.is_shortlisted 
                              ? 'bg-[#B6FF00] text-[#111116]' 
                              : previewModalTeam.round1_status === 'rejected'
                                ? 'bg-[#FF2E93] text-white'
                                : previewModalTeam.round1_status === 'waitlist' || previewModalTeam.round1_status === 'waitlisted'
                                  ? 'bg-[#FFE500] text-[#111116]'
                                  : 'bg-[#E4E4E7] text-[#111116]/80'
                          }`}>
                            {previewModalTeam.is_shortlisted ? 'SHORTLISTED' : (previewModalTeam.round1_status === 'waitlist' || previewModalTeam.round1_status === 'waitlisted' ? 'WAITLISTED' : (previewModalTeam.round1_status || 'PENDING').toUpperCase())}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-[#111116]/70">
                          Problem: {previewModalTeam.problem_code} · {previewModalTeam.track_id} · Tier: {previewModalTeam.academic_tier === 'tier_a' ? 'Tier A (Junior)' : 'Tier B (Senior)'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Evaluation Controls & Email Dispatch inside Modal Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          updateTeamStatus(previewModalTeam.team_id, 'shortlisted', true);
                          setPreviewModalTeam(prev => ({ ...prev, is_shortlisted: true, round1_status: 'shortlisted' }));
                        }}
                        className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer transition-all ${
                          previewModalTeam.is_shortlisted ? 'bg-[#B6FF00] text-[#111116] ring-2 ring-[#111116]' : 'bg-white hover:bg-[#B6FF00] text-[#111116]'
                        }`}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          updateTeamStatus(previewModalTeam.team_id, 'waitlist', false);
                          setPreviewModalTeam(prev => ({ ...prev, is_shortlisted: false, round1_status: 'waitlist' }));
                        }}
                        className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer transition-all ${
                          previewModalTeam.round1_status === 'waitlist' || previewModalTeam.round1_status === 'waitlisted' ? 'bg-[#FFE500] text-[#111116] ring-2 ring-[#111116]' : 'bg-white hover:bg-[#FFE500] text-[#111116]'
                        }`}
                      >
                        Waitlist
                      </button>
                      <button
                        onClick={() => {
                          updateTeamStatus(previewModalTeam.team_id, 'rejected', false);
                          setPreviewModalTeam(prev => ({ ...prev, is_shortlisted: false, round1_status: 'rejected' }));
                        }}
                        className={`px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer transition-all ${
                          previewModalTeam.round1_status === 'rejected' ? 'bg-[#FF2E93] text-white ring-2 ring-[#111116]' : 'bg-white hover:bg-[#FF2E93] hover:text-white text-[#111116]'
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeamToDelete(previewModalTeam)}
                        className="px-2.5 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#FF2E93]/40 text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white cursor-pointer transition-all flex items-center gap-1"
                        title="Permanently Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      {previewModalTeam.is_shortlisted && (
                        <button
                          onClick={() => handleSendShortlistEmail(previewModalTeam)}
                          disabled={sendingEmailTeamId === previewModalTeam.team_id}
                          className="px-3 py-1.5 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1 cursor-pointer"
                          title="Send shortlist notification email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{emailSentMap[previewModalTeam.team_id] ? 'Resend Email' : 'Send Email'}</span>
                        </button>
                      )}

                      {previewModalTeam.ppt_pdf_drive_url && (
                        <a
                          href={previewModalTeam.ppt_pdf_drive_url.replace('/preview', '/view')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white border-2 border-[#111116] text-[#111116] hover:bg-black/5"
                          title="Open directly in Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={closePptModal}
                        className="px-3 py-1.5 rounded-lg bg-[#111116] text-white hover:bg-white hover:text-[#111116] font-mono text-xs font-black border-2 border-[#111116] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Minimize (ESC)</span>
                      </button>
                    </div>
                  </div>

                  {/* Modal Iframe Body */}
                  <div className="flex-1 p-4 bg-[#111116] overflow-hidden flex flex-col">
                    <iframe
                      src={previewModalTeam.ppt_pdf_drive_url || "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview"}
                      title={`Presentation Deck for ${previewModalTeam.team_id}`}
                      className="w-full h-[70vh] rounded-xl border-2 border-white/20 bg-black"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ===================================================================
            TAB 2: ROUND 2 FINALISTS & DYNAMIC FEE CONFIG (PATCH 3)
           =================================================================== */}
        {activeTab === 'ROUND2' && (
          <div className="space-y-6">
            
            {/* Dynamic Fee Math Configuration Card */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sliders className="w-5 h-5 text-[#111116]" />
                <h3 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  DYNAMIC ROUND 2 FEE CONFIGURATION
                </h3>
              </div>
              <p className="text-xs text-[#111116]/80 mb-4 font-normal">
                Adjust the per-member nominal hospitality fee. Round 2 confirmation dynamically calculates: <code>team_size × fee_per_member</code>.
              </p>

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

                {feeSaveMessage && (
                  <span className="font-mono text-xs font-bold text-[#B6FF00]">
                    {feeSaveMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Finalists Table */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10 mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-black text-lg text-[#111116]">
                    Shortlisted Finalists ({shortlistedTeams.length} Teams)
                  </h3>
                  <p className="font-mono text-xs text-[#111116]/70 mt-0.5">
                    Allocated seats with 36-hour payment deadlines. Unpaid seats past deadline are subject to waitlist revocation.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold bg-[#B6FF00] text-[#111116] px-2.5 py-0.5 rounded border border-[#111116]">
                  SHORTLISTED SQUADS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#FBFBFB] border-b-2 border-[#111116]/10">
                    <tr>
                      <th className="p-3">TEAM ID</th>
                      <th className="p-3">TEAM NAME</th>
                      <th className="p-3">PASSCODE</th>
                      <th className="p-3">MEMBERS</th>
                      <th className="p-3">PAYMENT DEADLINE</th>
                      <th className="p-3">TIME REMAINING / STATUS</th>
                      <th className="p-3">UTR / RECEIPT</th>
                      <th className="p-3">PAYMENT STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111116]/10">
                    {shortlistedTeams.map((team) => {
                      const targetDeadline = team.payment_deadline 
                        ? new Date(team.payment_deadline).getTime() 
                        : (team.shortlisted_at ? new Date(team.shortlisted_at).getTime() + 36 * 3600 * 1000 : null);
                      const isExpired = !team.is_paid_verified && targetDeadline && (targetDeadline - nowTime <= 0);
                      const diffMs = targetDeadline ? targetDeadline - nowTime : null;
                      const hoursLeft = diffMs && diffMs > 0 ? Math.floor(diffMs / (3600 * 1000)) : 0;
                      const minsLeft = diffMs && diffMs > 0 ? Math.floor((diffMs % (3600 * 1000)) / (60 * 1000)) : 0;

                      return (
                        <tr key={team.team_id} className={`hover:bg-black/5 ${isExpired ? 'bg-[#FF2E93]/5' : ''}`}>
                          <td className="p-3 font-black text-[#0055FF]">{team.team_id}</td>
                          <td className="p-3 font-bold text-[#111116]">{team.team_name}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-white px-2 py-0.5 rounded border border-[#111116] font-bold">
                                {team.secret_passcode || "SILK94"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(team.secret_passcode || '');
                                  setCopiedPasscodeTeamId(team.team_id);
                                  setTimeout(() => setCopiedPasscodeTeamId(null), 2000);
                                }}
                                className="p-0.5 hover:bg-[#FFE500] rounded text-[#111116] cursor-pointer"
                                title="Copy Passcode"
                              >
                                {copiedPasscodeTeamId === team.team_id ? (
                                  <span className="text-[9px] font-bold text-green-700">✓</span>
                                ) : (
                                  <Copy className="w-3 h-3 text-[#111116]" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3">{team.team_size || 4} Members</td>
                          
                          {/* Payment Deadline */}
                          <td className="p-3">
                            {targetDeadline ? (
                              <div className="leading-tight">
                                <span className="font-bold text-[#111116]">
                                  {new Date(targetDeadline).toLocaleDateString()}
                                </span>
                                <span className="block text-[10px] text-[#6B6B78]">
                                  {new Date(targetDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#6B6B78]">No Deadline Set</span>
                            )}
                          </td>

                          {/* Time Remaining / Status */}
                          <td className="p-3">
                            {team.is_paid_verified ? (
                              <span className="px-2 py-0.5 rounded font-black bg-[#B6FF00] text-[#111116] border border-[#111116]">
                                DEADLINE MET
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded font-black bg-[#FF2E93] text-white border border-[#111116] animate-pulse">
                                EXPIRED
                              </span>
                            ) : targetDeadline ? (
                              <span className="px-2 py-0.5 rounded font-black bg-[#FFE500] text-[#111116] border border-[#111116]">
                                {hoursLeft}h {minsLeft}m LEFT
                              </span>
                            ) : (
                              <span className="text-[#6B6B78] font-bold">N/A</span>
                            )}
                          </td>

                          {/* UTR / Receipt */}
                          <td className="p-3">
                            {team.utr_number ? (
                              <span className="text-[#0055FF] font-bold">{team.utr_number}</span>
                            ) : (
                              <span className="text-[#111116]/40">Pending</span>
                            )}
                          </td>

                          {/* Payment Status */}
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-black border border-[#111116] ${
                              team.is_paid_verified ? 'bg-[#B6FF00] text-[#111116]' : isExpired ? 'bg-[#FF2E93] text-white' : 'bg-[#FFE500] text-[#111116]'
                            }`}>
                              {team.is_paid_verified ? 'PAID & SEAT LOCKED' : isExpired ? 'SEAT LAPSED' : 'AWAITING PAYMENT'}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSendShortlistEmail(team)}
                                disabled={sendingEmailTeamId === team.team_id}
                                className={`px-2.5 py-1 rounded-lg font-bold border border-[#111116] flex items-center gap-1 cursor-pointer transition-all ${
                                  emailSentMap[team.team_id] 
                                    ? 'bg-[#B6FF00]/40 text-[#111116]' 
                                    : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116]'
                                }`}
                                title="Send/Resend Shortlist Email"
                              >
                                <Mail className="w-3 h-3" />
                                <span>{emailSentMap[team.team_id] ? 'Sent' : 'Email'}</span>
                              </button>
                              <button
                                onClick={() => togglePaidVerified(team.team_id)}
                                className="px-3 py-1 bg-[#111116] text-[#FFE500] rounded-lg font-bold hover:bg-black cursor-pointer shadow-[2px_2px_0px_0px_#FFE500]"
                              >
                                {team.is_paid_verified ? 'Mark Unpaid' : 'Verify Paid'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dedicated Waitlist Reserves Queue Section */}
            <div className="bg-white rounded-2xl border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500] p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#111116]/10 mb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFE500] border border-[#111116]" />
                    <h3 className="font-black text-lg text-[#111116]">
                      Waitlist Reserves Queue ({waitlistedTeams.length} Teams)
                    </h3>
                  </div>
                  <p className="font-mono text-xs text-[#111116]/70 mt-1">
                    Ranked by submission priority. Top candidate is automatically promoted with a fresh 36-hour payment window when an expired seat is revoked.
                  </p>
                </div>

                {/* Prominent Action Button */}
                <button
                  onClick={handleRevokeExpiredAndPromote}
                  disabled={isRevoking}
                  className="h-11 px-4 bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isRevoking ? 'animate-spin' : ''}`} />
                  <span>{isRevoking ? "PROCESSING REVOCATION..." : "Revoke Expired Seat & Promote Waitlist"}</span>
                </button>
              </div>

              {/* Toast / Notification Banner */}
              {revokeNotification && (
                <div className={`p-4 rounded-xl border-2 mb-4 flex items-center justify-between gap-3 font-mono text-xs font-bold ${
                  revokeNotification.type === 'success' 
                    ? 'bg-[#B6FF00]/20 border-[#111116] text-[#111116]' 
                    : 'bg-[#FF2E93]/20 border-[#FF2E93] text-[#FF2E93]'
                }`}>
                  <div className="flex items-center gap-2">
                    {revokeNotification.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-[#111116]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#FF2E93]" />
                    )}
                    <span>{revokeNotification.message}</span>
                  </div>
                  <button 
                    onClick={() => setRevokeNotification(null)}
                    className="p-1 hover:bg-black/10 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {waitlistedTeams.length === 0 ? (
                <div className="p-8 text-center bg-[#FBFBFB] rounded-xl border-2 border-dashed border-[#111116]/20 font-mono text-xs text-[#111116]/60">
                  No teams currently in waitlist reserves queue.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#FBFBFB] border-b-2 border-[#111116]/10">
                      <tr>
                        <th className="p-3">QUEUE #</th>
                        <th className="p-3">TEAM ID</th>
                        <th className="p-3">TEAM NAME</th>
                        <th className="p-3">TRACK / PROBLEM</th>
                        <th className="p-3">TIER</th>
                        <th className="p-3">MEMBERS</th>
                        <th className="p-3">REGISTERED AT</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111116]/10">
                      {waitlistedTeams.map((team, idx) => (
                        <tr key={team.team_id} className="hover:bg-black/5">
                          <td className="p-3 font-black text-[#111116]">
                            <span className="bg-[#FFE500] px-2 py-0.5 rounded border border-[#111116]">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="p-3 font-black text-[#0055FF]">{team.team_id}</td>
                          <td className="p-3 font-bold text-[#111116]">{team.team_name}</td>
                          <td className="p-3">{team.problem_code || team.track_id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold border border-[#111116] ${
                              team.academic_tier === 'tier_a' ? 'bg-[#00E5FF] text-[#111116]' : 'bg-[#FFE500] text-[#111116]'
                            }`}>
                              {team.academic_tier === 'tier_a' ? 'Tier A' : 'Tier B'}
                            </span>
                          </td>
                          <td className="p-3">{team.team_size || 4} Members</td>
                          <td className="p-3 text-[#111116]/70">
                            {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-black bg-[#FFE500] text-[#111116] border border-[#111116]">
                              WAITLISTED
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handlePromoteWaitlistTeam(team.team_id)}
                              className="px-3 py-1 bg-[#111116] hover:bg-black text-[#B6FF00] rounded-lg font-bold cursor-pointer"
                            >
                              Promote to Round 2
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      </main>

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
              Are you sure you want to permanently delete team <strong className="text-[#0055FF]">{teamToDelete.team_id}</strong> (<em>{teamToDelete.team_name}</em>) and its <strong>{teamToDelete.members?.length || teamToDelete.team_size || 4} squad members</strong>?
            </p>

            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 font-mono text-xs mb-6">
              ⚠️ This will delete the team registration, member records, and pitch links from the database immediately.
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
