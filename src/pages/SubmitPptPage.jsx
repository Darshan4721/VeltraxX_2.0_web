import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { eventConfig } from '../config/eventConfig';
import { lookupTeamForPpt, submitRound1Ppt } from '../lib/api';
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
  ExternalLink,
  Zap
} from 'lucide-react';

export default function SubmitPptPage() {
  // Main form states
  const [teamId, setTeamId] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState(eventConfig.tracks[0]?.id || 'track-1');
  const [problemCode, setProblemCode] = useState(eventConfig.tracks[0]?.problems[0]?.code || 'VTX-T1-01');
  const [teamName, setTeamName] = useState('');
  
  // File states
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // "Forgot Team ID" Modal states
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const currentTrack = eventConfig.tracks.find(t => t.id === selectedTrackId) || eventConfig.tracks[0];
  const availableProblems = currentTrack?.problems || [];

  const handleTrackChange = (newTrackId) => {
    setSelectedTrackId(newTrackId);
    const newTrack = eventConfig.tracks.find(t => t.id === newTrackId);
    if (newTrack && newTrack.problems?.length > 0) {
      setProblemCode(newTrack.problems[0].code);
    }
  };

  // Handle PDF File Selection & In-Browser Parsing
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
      setErrorMessage(err.message || "Failed to process PDF blueprint.");
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Handle Team ID Lookup by Email or Phone
  const handleLookupSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) {
      setLookupError("Please enter your registered Leader Email or 10-digit Phone.");
      return;
    }

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const team = await lookupTeamForPpt(query);
      if (team) {
        setLookupResult(team);
      } else {
        setLookupError("No team found for this email or phone. Check your details or register first.");
      }
    } catch (err) {
      setLookupError(err.message || "Lookup failed. Please check your network and try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Apply Looked-up Team
  const handleApplyLookedUpTeam = (team) => {
    setTeamId(team.team_id);
    if (team.team_name) setTeamName(team.team_name);
    if (team.track_id) setSelectedTrackId(team.track_id);
    if (team.problem_code) setProblemCode(team.problem_code);
    setShowLookupModal(false);
    setLookupResult(null);
    setLookupQuery('');
  };

  // Form Submission
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage('');

    const cleanTeamId = teamId.trim().toUpperCase();
    if (!cleanTeamId) {
      setErrorMessage("Please enter your registered Team ID (e.g. VTX2-048).");
      return;
    }

    if (!pdfFile || !pdfMeta) {
      setErrorMessage("Please select and upload your 6-slide presentation PDF.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Optional dispatch to Google Apps Script Webhook if configured
      let drivePreviewUrl = "";
      const webhookUrl = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL || import.meta.env?.VITE_GOOGLE_SCRIPT_URL)) || 'https://script.google.com/macros/s/AKfycbyYwNOj29rOCetf8DZhSFzLZQW1RBFq2HRrXmWM9joOuTn8Ant3nSVasbjwv5QjcQQFQw/exec';

      if (webhookUrl) {
        try {
          const webhookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              team_id: cleanTeamId,
              track_id: selectedTrackId,
              problem_code: problemCode,
              team_name: teamName || cleanTeamId,
              file_name: pdfFile.name,
              file_base64: pdfMeta.rawBase64,
              extracted_text: pdfMeta.extractedText
            })
          });
          if (webhookRes.ok) {
            const webhookData = await webhookRes.json();
            if (webhookData?.preview_url) {
              drivePreviewUrl = webhookData.preview_url;
            }
          }
        } catch (webhookErr) {
          console.warn("Google Apps Script webhook dispatch failed, continuing to Supabase RPC:", webhookErr);
        }
      }

      // Default preview URL fallback (Drive embed or local data view)
      if (!drivePreviewUrl) {
        drivePreviewUrl = `https://drive.google.com/file/d/placeholder_${cleanTeamId}/preview`;
      }

      // 2. Commit to Supabase Database via submitRound1Ppt RPC
      const result = await submitRound1Ppt({
        team_id: cleanTeamId,
        ppt_pdf_drive_url: drivePreviewUrl,
        extracted_text: pdfMeta.extractedText
      });

      setSuccessResult({
        ...result,
        team_id: cleanTeamId,
        team_name: teamName || result.team_name,
        fileName: pdfFile.name,
        pageCount: pdfMeta.pageCount,
        previewUrl: drivePreviewUrl
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit pitch blueprint. Please check your Team ID and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // SUCCESS VIEW
  // =========================================================================
  if (successResult) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-6 sm:p-10">
          
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>48H SUBMISSION RECORDED // IN EVALUATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-2">
            Pitch Blueprint Submitted!
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 leading-relaxed mb-6 font-medium">
            Your team's 6-slide presentation has been logged and queued for single-shot jury and AI evaluation.
          </p>

          {/* Submission Details Card */}
          <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] mb-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">TEAM ID</span>
              <span className="font-black text-sm text-[#0055FF] bg-white px-2.5 py-0.5 rounded border border-[#111116]">
                {successResult.team_id}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">FILE ATTACHED</span>
              <span className="font-bold text-[#111116] truncate max-w-[200px]">
                {successResult.fileName}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">SLIDE COUNT</span>
              <span className="font-black text-[#111116] bg-[#B6FF00] px-2 py-0.5 rounded">
                {successResult.pageCount} SLIDES (VALIDATED)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#111116]/60 uppercase font-black">NEXT MILESTONE</span>
              <span className="font-bold text-[#FF2E93]">Jury Review (04-06 Dec)</span>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="p-4 bg-[#FFE500]/20 rounded-2xl border-2 border-[#111116] mb-6 text-xs text-[#111116]/90 font-medium leading-relaxed">
            <strong>What Happens Next?</strong> The evaluation panel evaluates submissions by academic tier. Shortlisted team leaders will receive a direct phone verification call between <strong>05 Dec and 07 Dec</strong>, followed by official Round 2 passcodes to confirm attendance for the Dec 15-16 finale at SIET.
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

  // =========================================================================
  // MAIN SUBMISSION FORM
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic SEO Head Management */}
      <SeoHead route="/submit-ppt" />

      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-8 hover:text-[#0055FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT OVERVIEW</span>
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
            <Clock className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>48-HOUR ROUND 1 PPT BLUEPRINT SUBMISSION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#111116] tracking-tight leading-tight">
            Upload Your <span className="underline decoration-[#00E5FF] decoration-4">Pitch Blueprint</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-2 font-normal leading-relaxed">
            Upload your completed 6-slide presentation as a PDF (max 8 slides, under 3MB). Submissions are processed with in-browser text extraction for evaluation.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-5 bg-[#FF2E93]/10 border-3 border-[#FF2E93] rounded-2xl shadow-[4px_4px_0px_0px_#FF2E93] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
            <div className="font-mono text-xs text-[#111116] font-bold">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Template Quick-Download Banner */}
        <div className="mb-8 p-4 bg-[#FFE500]/15 border-2 border-[#111116] rounded-2xl shadow-[4px_4px_0px_0px_#FFE500] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#111116] shrink-0" />
            <div>
              <h2 className="font-mono text-xs font-black uppercase text-[#111116]">
                Need the Official 6-Slide Templates?
              </h2>
              <div className="text-xs text-[#111116]/80 font-medium">
                Draft in PowerPoint, export as PDF (&lt; 3MB), and upload below.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/downloads/VELTRAXX_2.0_Round1_Template.pptx"
              download
              className="py-1.5 px-3 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-[#111116] rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] font-mono text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Blank Template (.PPTX)</span>
            </a>
            <a
              href="/downloads/VELTRAXX_2.0_Round1_Reference_Example.pptx"
              download
              className="py-1.5 px-3 bg-white hover:bg-[#FF2E93]/10 text-[#111116] hover:text-[#FF2E93] rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#FF2E93] font-mono text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span>Sample Reference (.PPTX)</span>
            </a>
          </div>
        </div>

        {/* Submission Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
            <h2 className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
              BLUEPRINT SPECIFICATION
            </h2>
            <span className="bg-[#00E5FF] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
              WINDOW: 02-03 DEC 2026
            </span>
          </div>

          {/* Team ID Input & Forgot Team ID Helper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="team-id" className="font-mono text-xs font-black uppercase text-[#111116]">
                Registered Team ID <span className="text-[#FF2E93]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowLookupModal(true)}
                className="font-mono text-xs font-bold text-[#0055FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Forgot Team ID? Lookup</span>
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
            <p className="mt-1 font-mono text-[11px] text-[#111116]/60">
              Generated when your team registered. Matches format VTX2-XXX.
            </p>
          </div>

          {/* Track Selection */}
          <div>
            <label htmlFor="track-select" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
              Domain Track <span className="text-[#FF2E93]">*</span>
            </label>
            <select
              id="track-select"
              value={selectedTrackId}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            >
              {eventConfig.tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code}: {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Problem Statement Code */}
          <div>
            <label htmlFor="problem-code" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
              Problem Statement Code <span className="text-[#FF2E93]">*</span>
            </label>
            <select
              id="problem-code"
              value={problemCode}
              onChange={(e) => setProblemCode(e.target.value)}
              className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            >
              {availableProblems.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}: {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Dropzone */}
          <div>
            <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
              Presentation PDF File (Max 8 Slides, &lt; 3MB) <span className="text-[#FF2E93]">*</span>
            </label>

            {!pdfFile ? (
              <label className="border-3 border-dashed border-[#111116] rounded-2xl p-8 flex flex-col items-center justify-center bg-[#FBFBFB] hover:bg-[#F4F4F6] transition-colors cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE500] text-[#111116] flex items-center justify-center border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm text-[#111116] mb-1">
                  Click to select or drag and drop your PPT (PDF format)
                </div>
                <div className="font-mono text-xs text-[#111116]/60 text-center">
                  Maximum 8 slides · File size limit 3.5MB · .pdf files only
                </div>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#B6FF00] text-[#111116] flex items-center justify-center font-black border-2 border-[#111116] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#111116] truncate max-w-[240px] sm:max-w-md">
                      {pdfFile.name}
                    </div>
                    <div className="font-mono text-xs text-[#111116]/70 flex items-center gap-2 mt-0.5">
                      <span>{pdfMeta?.fileSizeKB} KB</span>
                      <span>•</span>
                      <span className="font-bold text-[#0055FF]">
                        {pdfMeta?.pageCount} Slides Detected
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPdfFile(null);
                    setPdfMeta(null);
                  }}
                  className="p-2 text-[#111116] hover:bg-black/10 rounded-lg cursor-pointer"
                  title="Remove File"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {isParsingPdf && (
              <p className="mt-2 font-mono text-xs text-[#0055FF] animate-pulse">
                Parsing PDF slides and validating page count in browser...
              </p>
            )}
          </div>

          {/* Submission Button */}
          <div className="pt-4 border-t-2 border-[#111116]/10">
            <button
              type="submit"
              disabled={isSubmitting || isParsingPdf}
              className="w-full h-16 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] hover:shadow-[3px_3px_0px_0px_#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer font-black text-base sm:text-lg rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <span>SUBMITTING BLUEPRINT...</span>
              ) : (
                <>
                  <span>SUBMIT ROUND 1 BLUEPRINT (48H SPRINT) →</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* =====================================================================
          LOOKUP TEAM ID MODAL (PATCH 2)
         ===================================================================== */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-[#111116]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] max-w-md w-full relative">
            
            <button
              onClick={() => {
                setShowLookupModal(false);
                setLookupResult(null);
                setLookupError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-lg hover:bg-black/5 text-[#111116] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[#0055FF]" />
              <h3 className="font-mono text-xs font-black uppercase text-[#111116]">
                TEAM ID DIRECT LOOKUP
              </h3>
            </div>

            <h4 className="text-xl font-black text-[#111116] mb-2">
              Forgot Your Team ID?
            </h4>

            <p className="text-xs text-[#111116]/80 mb-5 leading-relaxed font-normal">
              Enter your Team Leader's registered Email or 10-digit WhatsApp Phone number to retrieve your credentials.
            </p>

            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Leader Email or 10-digit Phone"
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />

              {lookupError && (
                <p className="font-mono text-xs text-[#FF2E93] font-bold">
                  {lookupError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLookingUp}
                className="w-full h-12 bg-[#111116] text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] hover:bg-black/90 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLookingUp ? "SEARCHING TEAMS..." : "LOOKUP TEAM ID →"}
              </button>
            </form>

            {/* Lookup Result Box */}
            {lookupResult && (
              <div className="mt-5 p-4 bg-[#B6FF00]/15 rounded-2xl border-2 border-[#B6FF00] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#111116]">MATCH FOUND</span>
                  <span className="text-[10px] bg-[#111116] text-[#B6FF00] px-2 py-0.5 rounded font-black">
                    VERIFIED
                  </span>
                </div>
                <div>
                  <div className="text-[#111116]/60">TEAM ID:</div>
                  <div className="text-lg font-black text-[#0055FF]">{lookupResult.team_id}</div>
                </div>
                <div>
                  <div className="text-[#111116]/60">TEAM NAME:</div>
                  <div className="font-bold text-[#111116]">{lookupResult.team_name}</div>
                </div>
                <div>
                  <div className="text-[#111116]/60">TRACK & CODE:</div>
                  <div className="font-bold text-[#111116]">{lookupResult.problem_code}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyLookedUpTeam(lookupResult)}
                  className="w-full py-2.5 bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] font-black rounded-xl border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] cursor-pointer mt-2"
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

