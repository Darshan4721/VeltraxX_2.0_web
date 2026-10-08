import React, { useState, useEffect, useRef } from 'react';
import { getTrackerRoster } from '../lib/api';
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
  RefreshCw
} from 'lucide-react';

const PIN_STORAGE_KEY = 'veltraxx_coordinator_pin_v2';

export default function TrackerPage() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_STORAGE_KEY) || '');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Roster data
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, PENDING, VERIFIED
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState(null);
  const lastActiveTriggerRef = useRef(null);
  const modalCloseButtonRef = useRef(null);

  const openReceiptModal = (url, event) => {
    lastActiveTriggerRef.current = event?.currentTarget || document.activeElement;
    setActiveReceiptUrl(url);
  };

  // Lock body scroll and handle Escape key dismissal for Receipt Modal
  useEffect(() => {
    if (!activeReceiptUrl) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      modalCloseButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveReceiptUrl(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
      if (lastActiveTriggerRef.current) {
        lastActiveTriggerRef.current.focus();
      }
    };
  }, [activeReceiptUrl]);

  // Set noindex meta tag
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex,nofollow';
    return () => {
      if (meta) meta.content = 'index,follow';
    };
  }, []);

  // Check stored PIN on mount
  useEffect(() => {
    if (pin) {
      loadRoster(pin);
    }
  }, []);

  const loadRoster = async (candidatePin) => {
    setIsLoading(true);
    setPinError('');
    try {
      const data = await getTrackerRoster(candidatePin);
      setTeams(data);
      setIsUnlocked(true);
      setPin(candidatePin);
      sessionStorage.setItem(PIN_STORAGE_KEY, candidatePin);
    } catch (err) {
      setIsUnlocked(false);
      setPinError('Invalid coordinator PIN. Access restricted to authorized faculty and coordinators.');
      sessionStorage.removeItem(PIN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim().length < 4) {
      setPinError('Enter the complete 4-digit PIN.');
      return;
    }
    loadRoster(pinInput.trim());
  };

  const handleLockOut = () => {
    sessionStorage.removeItem(PIN_STORAGE_KEY);
    setPin('');
    setPinInput('');
    setIsUnlocked(false);
    setTeams([]);
  };

  // Filtered list
  const filteredTeams = teams.filter((t) => {
    const matchesFilter = 
      filterTab === 'ALL' ? true :
      filterTab === 'PENDING' ? t.status === 'pending' :
      t.status === 'verified';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      t.team_name.toLowerCase().includes(q) ||
      (t.leader_name && t.leader_name.toLowerCase().includes(q)) ||
      (t.leader_phone && t.leader_phone.includes(q)) ||
      (t.utr_number && t.utr_number.includes(q)) ||
      (t.leader_college && t.leader_college.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const verifiedCount = teams.filter(t => t.status === 'verified').length;
  const pendingCount = teams.filter(t => t.status === 'pending').length;

  // ---------------------------------------------------------------------------
  // 1. PIN GATE VIEW (If not unlocked)
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-[85vh] bg-[#FBFBFB] flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 opacity-10 bg-tech-grid pointer-events-none" />

        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] relative z-10">
          
          <div className="w-14 h-14 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center mb-6 border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-[11px] font-black uppercase mb-3">
            <ShieldLock className="w-3.5 h-3.5 text-[#FF2E93]" />
            <span>INTERNAL COORDINATOR GATE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight mb-2">
            Registration Roster
          </h1>

          <p className="text-xs sm:text-sm text-[#111116]/70 leading-relaxed mb-6 font-medium">
            This unlisted view contains confidential team contacts and payment receipts. Enter the coordinator security PIN to access the read-only roster.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="coordinator-pin" className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                4-Digit Security PIN
              </label>
              <input
                id="coordinator-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                placeholder="••••"
                className="w-full h-14 bg-white border-3 border-[#111116] rounded-xl px-4 text-center font-mono text-2xl font-black tracking-widest text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-4 focus:ring-[#FFE500]"
                autoFocus
              />
            </div>

            {pinError && (
              <div className="p-3 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-xl text-xs font-bold text-[#FF2E93] leading-snug">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>VERIFYING PIN...</span>
                </>
              ) : (
                <>
                  <span>UNLOCK ROSTER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center font-mono text-[11px] text-[#6B6B78] pt-2">
              Enter the designated Faculty or Student Coordinator PIN to view live team submissions.
            </div>
          </form>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. UNLOCKED READ-ONLY ROSTER VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#111116] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FFE500] selection:text-[#111116]">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse-live" />
              <span>COORDINATOR LIVE TRACKER // READ-ONLY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight">
              Registered Teams Roster
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B78] font-medium mt-1">
              Real-time payment receipts and participant details for registration desk verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadRoster(pin)}
              className="p-3 bg-white hover:bg-[#F4F4F6] text-[#111116] rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-2 font-mono text-xs font-black cursor-pointer"
              title="Refresh roster data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>

            <button
              onClick={handleLockOut}
              className="px-4 py-3 bg-[#111116] hover:bg-[#25252D] text-white rounded-xl border-2 border-[#111116] font-mono text-xs font-black flex items-center gap-2 cursor-pointer"
            >
              <ShieldLock className="w-4 h-4 text-[#FF2E93]" />
              <span>LOCK DESK</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
          <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]">
            <div className="font-mono text-xs text-[#6B6B78] font-bold">TOTAL REGISTERED</div>
            <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-1">{teams.length}</div>
            <div className="font-mono text-[10px] text-[#6B6B78] mt-0.5">35 Max Official Cap</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#FF2E93]">
            <div className="font-mono text-xs text-[#FF2E93] font-black">NEW / PENDING</div>
            <div className="text-2xl sm:text-3xl font-black text-[#FF2E93] mt-1">{pendingCount}</div>
            <div className="font-mono text-[10px] text-[#6B6B78] mt-0.5">Awaiting Payment Verification</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#B6FF00]">
            <div className="font-mono text-xs text-[#111116] font-black">VERIFIED TEAMS</div>
            <div className="text-2xl sm:text-3xl font-black text-[#111116] mt-1">{verifiedCount}</div>
            <div className="font-mono text-[10px] text-[#6B6B78] mt-0.5">Payment Confirmed</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#0055FF]">
            <div className="font-mono text-xs text-[#0055FF] font-black">TOTAL PARTICIPANTS</div>
            <div className="text-2xl sm:text-3xl font-black text-[#0055FF] mt-1">{teams.length * 4}</div>
            <div className="font-mono text-[10px] text-[#6B6B78] mt-0.5">Strictly 4 / Team</div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#111116] mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 bg-[#F4F4F6] p-1.5 rounded-xl border border-[#111116]/15">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                filterTab === 'ALL' ? 'bg-[#111116] text-white shadow-xs' : 'text-[#111116] hover:bg-white/60'
              }`}
            >
              ALL ({teams.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                filterTab === 'PENDING' ? 'bg-[#FF2E93] text-[#111116] shadow-xs' : 'text-[#111116] hover:bg-white/60'
              }`}
            >
              PENDING ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('VERIFIED')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                filterTab === 'VERIFIED' ? 'bg-[#B6FF00] text-[#111116] shadow-xs' : 'text-[#111116] hover:bg-white/60'
              }`}
            >
              VERIFIED ({verifiedCount})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#111116]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, leader, phone, or 12-digit UTR..."
              className="w-full h-11 bg-white border-2 border-[#111116] rounded-xl pl-10 pr-4 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 focus:outline-none"
            />
          </div>

        </div>

        {/* Team Cards Roster */}
        {filteredTeams.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-[#111116] text-center">
            <Users className="w-10 h-10 text-[#6B6B78] mx-auto mb-3" />
            <h3 className="text-lg font-black text-[#111116]">No matching teams found</h3>
            <p className="text-xs text-[#6B6B78] mt-1">Adjust search parameters or clear filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team, idx) => {
              const isExpanded = expandedTeamId === team.id;
              const isVerified = team.status === 'verified';

              return (
                <div
                  key={team.id || idx}
                  className={`bg-white rounded-2xl border-2 border-[#111116] transition-all overflow-hidden ${
                    isVerified ? 'shadow-[4px_4px_0px_0px_#B6FF00]' : 'shadow-[4px_4px_0px_0px_#FF2E93]'
                  }`}
                >
                  {/* Card Header (Click to expand) */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-controls={`team-roster-${team.id}`}
                    aria-label={`Toggle roster for ${team.team_name}`}
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (e.target !== e.currentTarget && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A')) return;
                        e.preventDefault();
                        setExpandedTeamId(isExpanded ? null : team.id);
                      }
                    }}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#FDFDFD] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#111116] text-[#FFE500] font-mono font-black text-sm flex items-center justify-center shrink-0 border border-[#111116]">
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl font-black text-[#111116] tracking-tight">
                            {team.team_name}
                          </h3>

                          <span className={`font-mono text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                            isVerified 
                              ? 'bg-[#B6FF00] text-[#111116] border-[#111116]' 
                              : 'bg-[#FF2E93] text-[#111116] border-[#111116]'
                          }`}>
                            {isVerified ? 'VERIFIED' : 'NEW / PENDING'}
                          </span>

                          <span className="font-mono text-[11px] text-[#6B6B78] bg-[#F4F4F6] px-2 py-0.5 rounded border border-[#111116]/10">
                            {team.id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-[#111116]/80">
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-[#111116]">Leader:</span> {team.leader_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-[#0055FF]" />
                            <span className="truncate max-w-[220px]">{team.leader_college || 'Host Institution'}</span>
                          </span>
                          <span className="font-mono text-[11px] text-[#6B6B78] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(team.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Call & UTR Preview */}
                    <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#111116]/10" onClick={(e) => e.stopPropagation()}>
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-[10px] text-[#6B6B78] font-bold">UTR REFERENCE</div>
                        <div className="font-mono text-xs font-black text-[#111116]">{team.utr_number}</div>
                      </div>

                      {team.leader_phone && (
                        <a
                          href={`tel:${team.leader_phone.replace(/[^0-9+]/g, '')}`}
                          className="h-10 px-3 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
                          title="Call Team Leader"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}

                      {team.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setActiveReceiptUrl(team.receipt_url)}
                          className="h-10 px-3 bg-white hover:bg-[#F4F4F6] text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center gap-1.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          title="View Payment Receipt"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0055FF]" />
                          <span>Receipt</span>
                        </button>
                      )}

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse roster" : "Expand roster"}
                        onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                        className="h-10 px-2.5 bg-[#F4F4F6] hover:bg-[#EAEAEA] text-[#111116] rounded-xl border border-[#111116]/20 font-mono text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                        title={isExpanded ? "Collapse" : "Expand roster"}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 4-Member Roster Details */}
                  {isExpanded && (
                    <div id={`team-roster-${team.id}`} className="px-5 pb-6 pt-2 bg-[#FAF9F5] border-t-2 border-[#111116]/10">
                      <div className="font-mono text-xs font-black uppercase text-[#111116] mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0055FF]" />
                        <span>VERIFIED 4-MEMBER TEAM ROSTER</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {team.participants && team.participants.map((p, pIdx) => (
                          <div 
                            key={pIdx}
                            className={`p-3.5 rounded-xl border-2 ${
                              p.is_leader 
                                ? 'bg-white border-[#111116] shadow-[3px_3px_0px_0px_#FFE500]' 
                                : 'bg-white/90 border-[#111116]/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-sm text-[#111116]">
                                {p.name}
                              </span>
                              {p.is_leader && (
                                <span className="font-mono text-[10px] font-black bg-[#FFE500] text-[#111116] px-2 py-0.5 rounded border border-[#111116]">
                                  TEAM LEADER
                                </span>
                              )}
                            </div>

                            <div className="font-mono text-xs text-[#111116]/80 flex flex-wrap gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#6B6B78]" />
                                <a href={`mailto:${p.email}`} className="hover:underline">{p.email}</a>
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#6B6B78]" />
                                <a href={`tel:${p.phone}`} className="hover:underline">{p.phone}</a>
                              </span>
                            </div>

                            <div className="font-mono text-[11px] text-[#6B6B78] mt-2 pt-2 border-t border-[#111116]/10 flex items-center justify-between">
                              <span>{p.department || 'ECE'} · {p.degree || 'B.E.'} ({p.year_of_study || '3rd'})</span>
                              <span className="truncate max-w-[150px]">{p.college_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Verification strip in expanded card */}
                      <div className="mt-4 p-3 bg-white rounded-xl border border-[#111116]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[#6B6B78]">UPI Reference: </span>
                          <span className="font-black text-[#111116]">{team.utr_number}</span>
                        </div>
                        <div>
                          <span className="text-[#6B6B78]">Team Fee: </span>
                          <span className="font-black text-[#111116]">₹1,000 (₹250/ea)</span>
                        </div>
                        <button
                          onClick={(e) => openReceiptModal(team.receipt_url, e)}
                          className="text-[#0055FF] font-bold underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Inspect Receipt Photo</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Tap-to-View Receipt Modal */}
      {activeReceiptUrl && (
        <div 
          className="fixed inset-0 z-50 bg-[#111116]/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveReceiptUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Payment receipt preview"
        >
          <div 
            className="bg-white rounded-3xl border-3 border-[#111116] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_#111116] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#111116]/10 mb-4">
              <div className="font-mono text-xs font-black uppercase text-[#111116] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <span>UPI PAYMENT SCREENSHOT PREVIEW</span>
              </div>
              <button 
                ref={modalCloseButtonRef}
                onClick={() => setActiveReceiptUrl(null)}
                aria-label="Close receipt modal"
                className="w-12 h-12 rounded-xl bg-[#F4F4F6] hover:bg-[#EAEAEA] text-[#111116] flex items-center justify-center font-bold cursor-pointer border border-[#111116]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#111116] rounded-2xl overflow-hidden border-2 border-[#111116] flex items-center justify-center p-2">
              <img 
                src={activeReceiptUrl} 
                alt="UPI Payment receipt proof" 
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-mono text-[#6B6B78]">
              <span>Official SIET UPI Transaction Verification</span>
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="h-12 px-5 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
