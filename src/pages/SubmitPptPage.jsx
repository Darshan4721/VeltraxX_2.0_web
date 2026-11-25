import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { eventConfig } from '../config/eventConfig';
import {
  getWindowStatus,
  recoverTeamIdentity,
  recoverTeamPasscode,
  submitRound1PptWithRetries,
  verifyTeamSubmissionStatus
} from '../lib/api';
import { parsePdfBlueprint } from '../lib/pdfExtractor';
import {
  UploadCloud,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowLeft,
  ArrowRight,
  X,
  Download,
  Clock,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const LAST_RECEIPT_KEY = 'veltraxx_last_ppt_receipt_v2';

export default function SubmitPptPage() {
  // Credentials & Track Metadata
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState(eventConfig.tracks[0]?.id || 'track_01');
  const [problemCode, setProblemCode] = useState(eventConfig.tracks[0]?.problems[0]?.code || 'VTX-T1-01');
  const [teamName, setTeamName] = useState('');

  // Window Status
  const [windowStatus, setWindowStatus] = useState({ ppt_open: true, ppt_window_end: '2026-12-08T23:59:59+05:30' });

  // Existing Confirmed Receipt & Verification
  const [verifiedReceipt, setVerifiedReceipt] = useState(() => {
    try {
      const saved = localStorage.getItem(LAST_RECEIPT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // File & Upload State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Recovery Modal State ('id' | 'passcode')
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState('id');
  const [recTeamId, setRecTeamId] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    getWindowStatus().then((ws) => {
      if (ws) setWindowStatus(ws);
    }).catch(() => {});
  }, []);

  const currentTrack = eventConfig.tracks.find((t) => t.id === selectedTrackId) || eventConfig.tracks[0];
  const availableProblems = currentTrack?.problems || [];

  const handleTrackChange = (newTrackId) => {
    setSelectedTrackId(newTrackId);
    const newTrack = eventConfig.tracks.find((t) => t.id === newTrackId);
    if (newTrack && newTrack.problems?.length > 0) {
      setProblemCode(newTrack.problems[0].code);
    }
  };

  // PDF Selection & Client Validation
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsParsingPdf(true);
    try {
      const parsed = await parsePdfBlueprint(file);
      setPdfFile(file);
      setPdfMeta(parsed);
    } catch (err) {
      setPdfFile(null);
      setPdfMeta(null);
      setErrorMessage(err.message || 'Invalid PDF file. Please select a PDF under 3 MB and max 8 slides.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Verify Existing Credentials & Fetch Latest Official Receipt
  const handleCheckStatus = async () => {
    setErrorMessage('');
    const cleanId = teamId.trim().toUpperCase();
    const cleanPass = passcode.trim().toUpperCase();
    if (!cleanId || !cleanPass) {
      setErrorMessage('Enter both your Team ID and Team Passcode to check submission status.');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const res = await verifyTeamSubmissionStatus({ team_id: cleanId, passcode: cleanPass });
      if (res.team_name) setTeamName(res.team_name);
      if (res.track_id) setSelectedTrackId(res.track_id);
      if (res.problem_code) setProblemCode(res.problem_code);
      if (res.window) setWindowStatus(res.window);

      if (res.has_confirmed_submission && res.receipt) {
        setVerifiedReceipt(res.receipt);
        try { localStorage.setItem(LAST_RECEIPT_KEY, JSON.stringify(res.receipt)); } catch {}
      } else {
        setVerifiedReceipt(null);
        setErrorMessage(`Team ${cleanId} credentials verified! No PPT blueprint has been uploaded yet.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect Team ID or team passcode.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Recovery Submit
  const handleRecoverySubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    setRecoverySuccessMsg('');
    setIsRecovering(true);

    try {
      if (recoveryTab === 'id') {
        const res = await recoverTeamIdentity({ email: recEmail, phone: recPhone });
        if (res?.success && res?.team_id) {
          setLookupResult(res);
        } else {
          setLookupError('No active team found matching both that email and phone number.');
        }
      } else {
        const res = await recoverTeamPasscode({ team_id: recTeamId, email: recEmail, phone: recPhone });
        setRecoverySuccessMsg(res.message || 'A new passcode has been sent to your Team Leader\'s email.');
      }
    } catch (err) {
      setLookupError(err.message || 'Verification failed. Please verify your details and retry.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleApplyLookedUpTeam = (team) => {
    setTeamId(team.team_id);
    if (team.team_name) setTeamName(team.team_name);
    if (team.track_id) setSelectedTrackId(team.track_id);
    if (team.problem_code) setProblemCode(team.problem_code);
    setShowLookupModal(false);
    setLookupResult(null);
    setRecEmail('');
    setRecPhone('');
  };

  // Secure Idempotent Upload
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const cleanTeamId = teamId.trim().toUpperCase();
    const cleanPasscode = passcode.trim().toUpperCase();
    if (!cleanTeamId || !cleanPasscode) {
      setErrorMessage('Please enter both your Team ID (e.g. VTX2-048) and your Team Passcode.');
      return;
    }
    if (!pdfFile || !pdfMeta) {
      setErrorMessage('Please select a valid PDF presentation (max 8 slides, under 3 MB).');
      return;
    }

    // Reuse idempotency key per (team + file checksum) so interrupted retries don't double-upload
    const storageKey = `vtx2_idem_${cleanTeamId}_${pdfMeta.sha256}`;
    let idempotencyKey = '';
    try {
      idempotencyKey = sessionStorage.getItem(storageKey) || '';
      if (!idempotencyKey) {
        idempotencyKey = `${cleanTeamId}_${pdfMeta.sha256.slice(0, 16)}_${Date.now()}`;
        sessionStorage.setItem(storageKey, idempotencyKey);
      }
    } catch {
      idempotencyKey = `${cleanTeamId}_${Date.now()}`;
    }

    setIsSubmitting(true);
    setUploadProgressText('Starting secure verification...');

    try {
      const result = await submitRound1PptWithRetries({
        team_id: cleanTeamId,
        passcode: cleanPasscode,
        file: pdfFile,
        pdfMeta,
        idempotencyKey,
        onProgress: (msg) => setUploadProgressText(msg)
      });

      if (!result?.success || !result?.receipt) {
        throw new Error('Submission could not be verified. Your previous submission remains safe.');
      }

      try {
        sessionStorage.removeItem(storageKey);
        localStorage.setItem(LAST_RECEIPT_KEY, JSON.stringify(result.receipt));
      } catch {}

      setVerifiedReceipt(result.receipt);
      setSuccessReceipt(result.receipt);
      setPdfFile(null);
      setPdfMeta(null);
    } catch (err) {
      setErrorMessage(err.message || 'Upload interrupted. Your previous submission remains safe.');
    } finally {
      setIsSubmitting(false);
      setUploadProgressText('');
    }
  };

  const downloadReceiptSlip = (receipt) => {
    if (!receipt) return;
    const text = `======================================================================
VELTRAXX 2.0 - OFFICIAL ROUND 1 SUBMISSION RECEIPT
======================================================================
STATUS:          ${receipt.status || 'CONFIRMED'}
RECEIPT ID:      ${receipt.receipt_id}
TEAM ID:         ${receipt.team_id}
TEAM NAME:       ${receipt.team_name || '-'}
VERSION:         v${receipt.version || 1}
FILENAME:        ${receipt.file_name}
SLIDE COUNT:     ${receipt.page_count} Slides
SUBMITTED AT:    ${new Date(receipt.submitted_at).toLocaleString()}
======================================================================
Keep this receipt for verification. You can replace your PDF anytime
before 08 Dec 2026, 11:59:59 PM IST using your Team ID & Passcode.
======================================================================`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VELTRAXX_${receipt.team_id}_Receipt_v${receipt.version || 1}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // SUCCESS CONFIRMATION VIEW (ONLY AFTER STORAGE + DB CONFIRMATION)
  // =========================================================================
  if (successReceipt) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-6 sm:p-10">
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>DRIVE STORED & DATABASE CONFIRMED // v{successReceipt.version || 1}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-2">
            Submission Confirmed!
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 leading-relaxed mb-6 font-medium">
            Your PDF blueprint is securely stored in Google Drive and verified in our database. Keep your Receipt ID below.
          </p>

          <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] mb-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">RECEIPT IDENTIFIER</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#0055FF] bg-white px-2.5 py-0.5 rounded border border-[#111116]">
                  {successReceipt.receipt_id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator?.clipboard?.writeText(successReceipt.receipt_id);
                    setCopiedReceipt(true);
                    setTimeout(() => setCopiedReceipt(false), 2000);
                  }}
                  className="p-1.5 bg-[#FFE500] rounded border border-[#111116] cursor-pointer"
                  aria-label="Copy Receipt ID"
                >
                  {copiedReceipt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">TEAM ID</span>
              <span className="font-black text-[#111116]">{successReceipt.team_id}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">SUBMISSION VERSION</span>
              <span className="font-black text-[#111116] bg-[#B6FF00] px-2 py-0.5 rounded">
                Version {successReceipt.version || 1} ({successReceipt.status || 'CONFIRMED'})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">FILENAME</span>
              <span className="font-bold text-[#111116] truncate max-w-[220px]">{successReceipt.file_name}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">SLIDE COUNT</span>
              <span className="font-bold text-[#111116]">{successReceipt.page_count} Slides (Verified)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#111116]/60 uppercase font-black">TIMESTAMP</span>
              <span className="font-bold text-[#111116]">{new Date(successReceipt.submitted_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              type="button"
              onClick={() => downloadReceiptSlip(successReceipt)}
              className="flex-1 py-3 px-4 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Receipt (.TXT)</span>
            </button>

            <button
              type="button"
              onClick={() => setSuccessReceipt(null)}
              className="flex-1 py-3 px-4 bg-white hover:bg-[#F4F4F6] text-[#111116] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Replace / Verify Submission</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#111116]/10">
            <Link to="/" className="font-mono text-xs font-bold text-[#111116] hover:underline">
              ← Return to Homepage
            </Link>
            <Link to="/round2-confirm" className="font-mono text-xs font-black text-[#0055FF] hover:underline">
              Round 2 Seat Gatekeeper →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      <SeoHead route="/submit-ppt" />

      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-8 hover:text-[#0055FF] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT OVERVIEW</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
            <Clock className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>ROUND 1 PPT SUBMISSION // OPEN THROUGH 08 DEC 2026 (11:59 PM IST)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#111116] tracking-tight leading-tight">
            Upload Your <span className="underline decoration-[#00E5FF] decoration-4">Pitch Blueprint</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-2 font-normal leading-relaxed">
            Submit or replace your official presentation PDF (max 8 slides, strictly under 3 MB) anytime before <strong>08 Dec 2026, 11:59 PM IST</strong> using your Team ID and Team Passcode.
          </p>
        </div>

        {/* Submission Window Closed Alert */}
        {windowStatus && windowStatus.ppt_open === false && (
          <div className="mb-8 p-5 bg-[#FF2E93]/15 border-3 border-[#FF2E93] rounded-2xl shadow-[4px_4px_0px_0px_#FF2E93] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
            <div className="font-mono text-xs text-[#111116] font-bold">
              Submission window is closed. You can still enter your Team ID and Passcode below to verify an existing submission receipt.
            </div>
          </div>
        )}

        {/* Active Verified Receipt Banner */}
        {verifiedReceipt && (
          <div className="mb-8 p-5 bg-[#B6FF00]/20 border-3 border-[#111116] rounded-2xl shadow-[4px_4px_0px_0px_#B6FF00] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black text-[#111116] uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                CONFIRMED SUBMISSION RECORDED ({verifiedReceipt.team_id} · v{verifiedReceipt.version || 1})
              </span>
              <span className="font-mono text-xs font-black bg-[#111116] text-[#B6FF00] px-2.5 py-0.5 rounded">
                {verifiedReceipt.receipt_id}
              </span>
            </div>
            <div className="font-mono text-xs text-[#111116]/80">
              File: <strong>{verifiedReceipt.file_name}</strong> · Submitted: {new Date(verifiedReceipt.submitted_at).toLocaleString()}
            </div>
            <p className="text-xs text-[#111116]/75">
              Replacements before Dec 8 11:59 PM IST are completely safe: your v{verifiedReceipt.version || 1} submission stays intact if any replacement fails.
            </p>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div role="alert" className="mb-8 p-5 bg-[#FF2E93]/10 border-3 border-[#FF2E93] rounded-2xl shadow-[4px_4px_0px_0px_#FF2E93] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
            <div className="font-mono text-xs text-[#111116] font-bold">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Official Template Banner */}
        <div className="mb-8 p-4 bg-[#FFE500]/15 border-2 border-[#111116] rounded-2xl shadow-[4px_4px_0px_0px_#FFE500] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#111116] shrink-0" />
            <div>
              <h2 className="font-mono text-xs font-black uppercase text-[#111116]">
                Need the Official PPT Template?
              </h2>
              <div className="text-xs text-[#111116]/80 font-medium">
                Draft in PowerPoint, export as PDF (max 8 slides, strictly under 3 MB), and upload below.
              </div>
            </div>
          </div>
          <a
            href="/downloads/VELTRAXX_2.0_Round1_Template.pptx"
            download
            className="py-1.5 px-3 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#111116] rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] font-mono text-xs font-black flex items-center gap-1.5 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Official Template (.PPTX)</span>
          </a>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
            <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
              TEAM CREDENTIALS & BLUEPRINT
            </h2>
            <span className="bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
              DEADLINE: 08 DEC 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="team-id" className="font-mono text-xs font-black uppercase text-[#111116]">
                  Team ID <span className="text-[#FF2E93]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setRecoveryTab('id'); setShowLookupModal(true); }}
                  className="font-mono text-xs font-bold text-[#0055FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Forgot ID / Passcode?</span>
                </button>
              </div>
              <input
                id="team-id"
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value.toUpperCase())}
                placeholder="e.g. VTX2-048"
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>

            {/* Team Passcode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="team-passcode" className="font-mono text-xs font-black uppercase text-[#111116]">
                  Team Passcode <span className="text-[#FF2E93]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="font-mono text-xs font-bold text-[#0055FF] hover:underline cursor-pointer"
                >
                  {isCheckingStatus ? 'Checking...' : 'Check Existing Receipt'}
                </button>
              </div>
              <input
                id="team-passcode"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                placeholder="8-character Passcode"
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
          </div>

          {/* Track & Problem (Informational) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="track-select" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Domain Track
              </label>
              <select
                id="track-select"
                value={selectedTrackId}
                onChange={(e) => handleTrackChange(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              >
                {eventConfig.tracks.map((t) => (
                  <option key={t.id} value={t.id}>{t.code}: {t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="problem-code" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Problem Statement Code
              </label>
              <select
                id="problem-code"
                value={problemCode}
                onChange={(e) => setProblemCode(e.target.value)}
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              >
                {availableProblems.map((p) => (
                  <option key={p.code} value={p.code}>{p.code}: {p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div>
            <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
              Presentation PDF File (Max 8 Slides, Strict 3 MB Limit) <span className="text-[#FF2E93]">*</span>
            </label>

            {!pdfFile ? (
              <label className="border-3 border-dashed border-[#111116] rounded-2xl p-8 flex flex-col items-center justify-center bg-[#FBFBFB] hover:bg-[#F4F4F6] transition-colors cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm text-[#111116] mb-1 text-center">
                  Click to select your presentation PDF
                </div>
                <div className="font-mono text-xs text-[#111116]/60 text-center">
                  Maximum 8 slides · Strict file size limit 3 MB · .pdf files only
                </div>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#B6FF00] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#111116] truncate">{pdfFile.name}</div>
                    <div className="font-mono text-xs text-[#111116]/70 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{pdfMeta?.fileSizeKB} KB</span>
                      <span>•</span>
                      <span className="font-bold text-[#0055FF]">{pdfMeta?.pageCount} Slides Detected</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { setPdfFile(null); setPdfMeta(null); }}
                  className="p-2 text-[#111116] hover:bg-black/10 rounded-lg cursor-pointer shrink-0"
                  title="Remove File"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {isParsingPdf && (
              <p className="mt-2 font-mono text-xs text-[#0055FF] animate-pulse">
                Validating PDF structure, checksum, and slide count...
              </p>
            )}
          </div>

          {uploadProgressText && (
            <div className="p-3.5 bg-[#00E5FF]/15 border-2 border-[#111116] rounded-xl font-mono text-xs font-bold text-[#111116]">
              {uploadProgressText}
            </div>
          )}

          <div className="pt-4 border-t-2 border-[#111116]/10">
            <button
              type="submit"
              disabled={isSubmitting || isParsingPdf || windowStatus?.ppt_open === false}
              className="w-full h-16 bg-[#FFE500] hover:bg-[#FFE500]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#111116] border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] cursor-pointer font-black text-base sm:text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <span>UPLOADING & VERIFYING...</span>
              ) : (
                <>
                  <span>{verifiedReceipt ? 'UPLOAD REPLACEMENT BLUEPRINT →' : 'SUBMIT ROUND 1 BLUEPRINT →'}</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================================
          PRIVACY-PRESERVING RECOVERY MODAL (TEAM ID + PASSCODE)
         ===================================================================== */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-[#111116]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full relative">
            <button
              onClick={() => {
                setShowLookupModal(false);
                setLookupResult(null);
                setLookupError('');
                setRecoverySuccessMsg('');
              }}
              className="absolute top-5 right-5 p-2 rounded-lg hover:bg-black/5 text-[#111116] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => { setRecoveryTab('id'); setLookupError(''); setLookupResult(null); setRecoverySuccessMsg(''); }}
                className={`flex-1 py-2 font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer ${
                  recoveryTab === 'id' ? 'bg-[#FFE500] text-[#111116]' : 'bg-white text-[#111116]/70'
                }`}
              >
                Recover Team ID
              </button>
              <button
                type="button"
                onClick={() => { setRecoveryTab('passcode'); setLookupError(''); setLookupResult(null); setRecoverySuccessMsg(''); }}
                className={`flex-1 py-2 font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer ${
                  recoveryTab === 'passcode' ? 'bg-[#00E5FF] text-[#111116]' : 'bg-white text-[#111116]/70'
                }`}
              >
                Reset Passcode
              </button>
            </div>

            <h3 className="text-xl font-black text-[#111116] mb-1">
              {recoveryTab === 'id' ? 'Recover Your Team ID' : 'Reset Team Passcode'}
            </h3>
            <p className="text-xs text-[#111116]/75 mb-4 leading-relaxed">
              {recoveryTab === 'id'
                ? 'Enter BOTH your registered email and 10-digit WhatsApp phone number to verify your identity.'
                : 'Enter your Team ID, Team Leader Email, and Leader Phone. A new passcode will be emailed strictly to your Team Leader.'}
            </p>

            <form onSubmit={handleRecoverySubmit} className="space-y-3">
              {recoveryTab === 'passcode' && (
                <input
                  type="text"
                  value={recTeamId}
                  onChange={(e) => setRecTeamId(e.target.value.toUpperCase())}
                  placeholder="Team ID (e.g. VTX2-048)"
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116]"
                />
              )}
              <input
                type="email"
                value={recEmail}
                onChange={(e) => setRecEmail(e.target.value)}
                placeholder={recoveryTab === 'id' ? 'Registered Email Address' : 'Team Leader Email Address'}
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116]"
              />
              <input
                type="tel"
                value={recPhone}
                onChange={(e) => setRecPhone(e.target.value)}
                placeholder="10-digit WhatsApp Phone"
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-semibold text-[#111116]"
              />

              {lookupError && (
                <p className="font-mono text-xs text-[#FF2E93] font-bold">{lookupError}</p>
              )}
              {recoverySuccessMsg && (
                <p className="font-mono text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                  {recoverySuccessMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isRecovering}
                className="w-full h-12 bg-[#111116] text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] cursor-pointer"
              >
                {isRecovering ? 'VERIFYING...' : (recoveryTab === 'id' ? 'RECOVER TEAM ID →' : 'EMAIL NEW PASSCODE →')}
              </button>
            </form>

            {lookupResult && lookupResult.success && (
              <div className="mt-5 p-4 bg-[#B6FF00]/15 rounded-2xl border-2 border-[#B6FF00] space-y-2 font-mono text-xs">
                <div className="font-black text-[#111116]">MATCH VERIFIED</div>
                <div>TEAM ID: <strong className="text-[#0055FF] text-base">{lookupResult.team_id}</strong></div>
                <div>TEAM NAME: <strong>{lookupResult.team_name}</strong></div>
                <div>SUBMISSIONS: <strong>{lookupResult.has_submitted ? `v${lookupResult.current_version} (${lookupResult.receipt_id})` : 'Pending'}</strong></div>
                <button
                  type="button"
                  onClick={() => handleApplyLookedUpTeam(lookupResult)}
                  className="w-full py-2.5 bg-[#B6FF00] text-[#111116] font-black rounded-xl border-2 border-[#111116] cursor-pointer mt-2"
                >
                  USE THIS TEAM ID →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
