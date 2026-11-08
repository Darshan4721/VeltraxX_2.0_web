import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../config/eventConfig';
import { verifyRound2Gatekeeper, submitRound2Payment, getLiveEventState } from '../lib/api';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  Upload, 
  Clock, 
  ShieldCheck, 
  Building,
  Coffee,
  Flame,
  FileCheck
} from 'lucide-react';

export default function Round2ConfirmPage() {
  // Step 1: Gatekeeper auth
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Step 2: Verified team details
  const [verifiedTeam, setVerifiedTeam] = useState(null); // { team_id, team_name, team_size, is_shortlisted, round2_fee_per_member, total_fee, shortlisted_at, payment_deadline, is_paid_verified, is_expired }

  // Step 3: Payment proof fields
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Live Countdown Timer State for 36-Hour Payment Deadline
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    diff: 0,
    isExpired: false
  });

  // Calculate live countdown against payment_deadline
  useEffect(() => {
    if (!verifiedTeam) return;

    if (verifiedTeam.is_expired) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, diff: 0, isExpired: true });
      return;
    }

    const targetDeadline = verifiedTeam.payment_deadline 
      ? new Date(verifiedTeam.payment_deadline).getTime()
      : (verifiedTeam.shortlisted_at ? new Date(verifiedTeam.shortlisted_at).getTime() + 36 * 3600 * 1000 : Date.now() + 36 * 3600 * 1000);

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetDeadline - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, diff: 0, isExpired: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, diff, isExpired: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [verifiedTeam]);

  // Authenticate Gatekeeper
  const handleVerifyGatekeeper = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setAuthError('');

    const cleanTeamId = teamId.trim().toUpperCase();
    const cleanPasscode = passcode.trim().toUpperCase();

    if (!cleanTeamId) {
      setAuthError("Please enter your Team ID (e.g. VTX2-001).");
      return;
    }
    if (!cleanPasscode) {
      setAuthError("Please enter your 6-character secret passcode.");
      return;
    }

    setIsVerifying(true);

    try {
      const data = await verifyRound2Gatekeeper(cleanTeamId, cleanPasscode);
      if (!data.valid && !data.is_expired) {
        setAuthError(data.error || "Invalid Team ID or Secret Passcode. Only shortlisted teams can access Round 2 confirmation.");
        return;
      }

      if (data.is_expired) {
        setVerifiedTeam({
          team_id: cleanTeamId,
          team_name: data.team_name || `Team ${cleanTeamId}`,
          team_size: data.team_size || 4,
          round2_fee_per_member: data.fee_per_member || 500,
          total_fee: data.total_fee || 2000,
          is_paid_verified: false,
          submitted_utr: null,
          shortlisted_at: data.shortlisted_at || null,
          payment_deadline: data.payment_deadline || null,
          is_expired: true,
          error: data.error
        });
        return;
      }

      setVerifiedTeam(data);
    } catch (err) {
      setAuthError(err.message || "Invalid Team ID or Secret Passcode. Only shortlisted teams can access Round 2 confirmation.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Screenshot Upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPaymentError("Screenshot image must be under 5MB.");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Payment Proof
  const handleSubmitPayment = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setPaymentError('');

    const cleanUtr = utrNumber.trim();
    if (!/^[0-9]{12}$/.test(cleanUtr)) {
      setPaymentError("Please enter an exact 12-digit numeric UPI transaction reference (UTR).");
      return;
    }

    if (!screenshotPreview) {
      setPaymentError("Please attach your UPI transaction screenshot.");
      return;
    }

    if (!consentTerms) {
      setPaymentError("Please confirm your offline attendance agreement.");
      return;
    }

    setIsSubmittingPayment(true);

    try {
      await submitRound2Payment({
        team_id: verifiedTeam.team_id,
        secret_passcode: passcode.trim().toUpperCase(),
        utr_number: cleanUtr,
        payment_screenshot_url: screenshotPreview
      });

      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err.message || "Payment submission failed. Please verify your details.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Dynamic UPI URL
  const totalAmount = verifiedTeam?.total_fee || (verifiedTeam?.team_size || 4) * 500;
  const upiId = eventConfig.registration?.upiId || "sieteevlsi@okaxis";
  const upiUrl = `upi://pay?pa=${upiId}&pn=VELTRAXX_HACKATHON&am=${totalAmount}&cu=INR&tn=${verifiedTeam?.team_id || 'ROUND2_SEAT'}`;

  // =========================================================================
  // SUCCESS VIEW: SEAT CONFIRMED
  // =========================================================================
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#B6FF00] p-6 sm:p-10">
          
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF00] text-[#111116] border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#B6FF00] font-mono text-xs font-black uppercase mb-3">
            <span>ROUND 2 PHYSICAL SEAT LOCKED // 15-16 DEC 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight mb-2">
            Arena Desk Confirmed!
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 leading-relaxed mb-6 font-medium">
            Your payment proof for Team <strong>{verifiedTeam.team_id}</strong> has been logged. Your physical arena workstation is locked.
          </p>

          {/* Arena Pass Summary */}
          <div className="bg-[#FBFBFB] p-5 rounded-2xl border-3 border-[#111116] mb-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">TEAM ID</span>
              <span className="font-black text-sm text-[#0055FF] bg-white px-2 py-0.5 rounded border border-[#111116]">
                {verifiedTeam.team_id}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">TEAM NAME</span>
              <span className="font-bold text-[#111116]">{verifiedTeam.team_name}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">CONFIRMED SEATS</span>
              <span className="font-bold text-[#111116]">{verifiedTeam.team_size} Members</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#111116]/10">
              <span className="text-[#111116]/60 uppercase font-black">UTR NUMBER</span>
              <span className="font-bold text-[#111116]">{utrNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#111116]/60 uppercase font-black">REPORTING TIME</span>
              <span className="font-bold text-[#FF2E93]">15 Dec 2026 · 08:30 AM IST</span>
            </div>
          </div>

          <div className="p-4 bg-[#FFE500]/20 rounded-2xl border-2 border-[#111116] mb-6 text-xs text-[#111116]/90 font-medium leading-relaxed">
            <strong>Check-in Checklist:</strong> Bring your configured laptops, dev boards, college ID cards, and government photo IDs. Breakfast, lunch, dinner, midnight refreshments, and sleeping zones are arranged on-campus at SIET Coimbatore.
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#111116]/10">
            <Link to="/" className="font-mono text-xs font-bold text-[#111116] hover:underline">
              ← Return to Homepage
            </Link>
            <Link to="/tracker" className="font-mono text-xs font-black text-[#0055FF] hover:underline">
              View Coordinator Tracker →
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN GATEKEEPER VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FF2E93] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FF2E93]/40 shadow-[2px_2px_0px_0px_#FF2E93]">
            <Lock className="w-3.5 h-3.5 text-[#FF2E93]" />
            <span>ROUND 2 OFFLINE ARENA GATEKEEPER // RESTRICTED ACCESS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#111116] tracking-tight leading-tight">
            Round 2 <span className="underline decoration-[#FF2E93] decoration-4">Seat Confirmation</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#111116]/80 mt-2 font-normal leading-relaxed">
            Reserved exclusively for shortlisted teams invited to the 24-hour offline finale at SIET Coimbatore (15-16 Dec 2026). Authenticate with your Team ID and Secret Passcode.
          </p>
        </div>

        {/* STEP 01: GATEKEEPER AUTHENTICATION LOCK */}
        {!verifiedTeam ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#111116]" />
                <span className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                  STEP 01 // GATEKEEPER AUTHENTICATION
                </span>
              </div>
              <span className="bg-[#FFE500] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
                30 TEAMS LIMIT
              </span>
            </div>

            {authError && (
              <div className="p-4 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
                <div className="font-mono text-xs text-[#111116] font-bold">
                  {authError}
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyGatekeeper} className="space-y-5">
              <div>
                <label htmlFor="team-id" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                  Registered Team ID <span className="text-[#FF2E93]">*</span>
                </label>
                <input
                  id="team-id"
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value.toUpperCase())}
                  placeholder="e.g. VTX2-001"
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                />
              </div>

              <div>
                <label htmlFor="passcode" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                  6-Character Secret Passcode <span className="text-[#FF2E93]">*</span>
                </label>
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  placeholder="e.g. SILK94"
                  maxLength={10}
                  className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold tracking-widest text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                />
                <p className="mt-1 font-mono text-[11px] text-[#111116]/60">
                  Issued upon free Round 1 registration and verified in your shortlist notification email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-14 bg-[#111116] hover:bg-black/90 text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? "AUTHENTICATING GATEKEEPER..." : "UNLOCK ROUND 2 SEAT CONFIRMATION →"}
              </button>
            </form>

            <div className="p-4 bg-[#FBFBFB] rounded-xl border border-[#111116]/10 text-xs text-[#111116]/70 font-mono">
              <strong>Need Help?</strong> If your team was shortlisted but you misplaced your secret passcode, contact faculty convenor Dr. P. DhilipKumar at <strong>+91-9629561731</strong>.
            </div>

          </div>
        ) : (
          /* STEP 02 & STEP 03: VERIFIED TEAM DYNAMIC PAYMENT & UTR SUBMISSION */
          <div className="space-y-8">
            
            {/* Verified Team Info Banner */}
            <div className="bg-[#B6FF00]/15 rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#B6FF00]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#111116]/10 mb-4">
                <span className="font-mono text-xs font-black uppercase text-[#111116] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B6FF00]" />
                  <span>SHORTLIST VERIFIED // ACCESS UNLOCKED</span>
                </span>
                <span className="font-mono text-xs font-black bg-[#111116] text-[#B6FF00] px-2.5 py-0.5 rounded">
                  {verifiedTeam.team_id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <span className="text-[#111116]/60 block font-bold">TEAM NAME</span>
                  <span className="text-base font-black text-[#111116]">{verifiedTeam.team_name}</span>
                </div>
                <div>
                  <span className="text-[#111116]/60 block font-bold">REGISTERED MEMBERS</span>
                  <span className="text-base font-black text-[#111116]">{verifiedTeam.team_size} Members</span>
                </div>
              </div>
            </div>

            {/* Confirmed State: Electric Lime Banner */}
            {verifiedTeam.is_paid_verified && (
              <div className="p-4.5 rounded-2xl bg-[#B6FF00] border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm font-black text-[#111116] uppercase">
                  <CheckCircle2 className="w-5 h-5 text-[#111116]" />
                  <span>SEAT CONFIRMED & PAID · DEADLINE MET</span>
                </div>
                <span className="font-mono text-[11px] font-black bg-[#111116] text-[#B6FF00] px-2.5 py-0.5 rounded">
                  OFFLINE DESK LOCKED
                </span>
              </div>
            )}

            {/* Expired State: Urgent Hot Magenta Alert Banner */}
            {(timeLeft.isExpired || verifiedTeam.is_expired) && (
              <div className="p-5 rounded-2xl bg-[#FF2E93] text-white border-3 border-[#111116] shadow-[5px_5px_0px_0px_#111116] flex items-start gap-3.5">
                <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs sm:text-sm font-black uppercase tracking-wide leading-snug">
                    SEAT RESERVATION EXPIRED: The 36-hour payment window has elapsed. This seat has been flagged for revocation and waitlist promotion.
                  </div>
                  <p className="font-mono text-[11px] text-white/90 mt-1 font-medium">
                    Payment submissions are disabled. The seat allocation window has expired and this slot has been marked for reallocation.
                  </p>
                </div>
              </div>
            )}

            {/* Live Dynamic Countdown Timer Tracking payment_deadline */}
            <div className="p-5 rounded-2xl bg-[#111116] border-3 border-[#111116] shadow-[5px_5px_0px_0px_#FFE500] text-center text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 font-mono text-xs font-black text-[#FFE500] uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#FFE500]" />
                  <span>36-HOUR SEAT RESERVATION WINDOW</span>
                </div>
                <span className={`font-mono text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                  timeLeft.isExpired || verifiedTeam.is_expired
                    ? 'bg-[#FF2E93] text-white'
                    : verifiedTeam.is_paid_verified
                      ? 'bg-[#B6FF00] text-[#111116]'
                      : 'bg-[#FFE500] text-[#111116]'
                }`}>
                  {timeLeft.isExpired || verifiedTeam.is_expired ? 'WINDOW EXPIRED' : verifiedTeam.is_paid_verified ? 'SEAT SECURED' : 'LIVE COUNTDOWN'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono font-black text-3xl sm:text-4xl">
                <div className="bg-white/10 px-3.5 sm:px-5 py-2.5 rounded-xl border border-white/20 min-w-[76px]">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-[#6B6B78] uppercase mt-1 font-bold">HOURS</span>
                </div>
                <span className="text-[#FFE500]">:</span>
                <div className="bg-white/10 px-3.5 sm:px-5 py-2.5 rounded-xl border border-white/20 min-w-[76px]">
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-[#6B6B78] uppercase mt-1 font-bold">MINS</span>
                </div>
                <span className="text-[#FFE500]">:</span>
                <div className={`bg-white/10 px-3.5 sm:px-5 py-2.5 rounded-xl border border-white/20 min-w-[76px] ${
                  !(timeLeft.isExpired || verifiedTeam.is_expired) ? 'text-[#FFE500]' : 'text-white'
                }`}>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[10px] text-[#6B6B78] uppercase mt-1 font-bold">SECS</span>
                </div>
              </div>

              {verifiedTeam.payment_deadline && (
                <div className="mt-3.5 text-[11px] font-mono text-white/70">
                  Payment Deadline: <span className="font-bold text-white">{new Date(verifiedTeam.payment_deadline).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Dynamic Fee Math & QR Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#111116]" />
                  <span className="font-mono text-xs font-black uppercase text-[#111116] tracking-wider">
                    STEP 02 // DYNAMIC OFFLINE HOSPITALITY FEE
                  </span>
                </div>
                <span className="bg-[#FFE500] text-[#111116] font-mono text-xs font-black px-2.5 py-0.5 rounded border border-[#111116]">
                  ₹{verifiedTeam.round2_fee_per_member || 500} / MEMBER
                </span>
              </div>

              <div className="bg-[#FBFBFB] p-5 rounded-2xl border-2 border-[#111116] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="font-mono text-xs font-bold text-[#111116]/60 uppercase mb-1">
                    FEE CALCULATION ({verifiedTeam.team_size} MEMBERS × ₹{verifiedTeam.round2_fee_per_member || 500})
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#111116]">
                    ₹{totalAmount.toLocaleString()} <span className="text-sm font-normal text-[#111116]/70">total</span>
                  </div>
                  <p className="text-xs text-[#111116]/80 mt-1 font-medium">
                    Covers full 24H catering (lunch, dinner, midnight refreshments, breakfast), rest zones, and workstation utilities.
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-40 h-40 bg-white p-2.5 rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`}
                      alt="Dynamic UPI QR Code"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#111116]/60 mt-1.5 font-bold">
                    SCAN VIA GPAY / PHONEPE / PAYTM
                  </span>
                </div>
              </div>

              {/* Step 3 Form: UTR & Screenshot */}
              <form onSubmit={handleSubmitPayment} className="space-y-5 pt-4 border-t-2 border-[#111116]/10">
                
                {paymentError && (
                  <div className="p-4 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
                    <div className="font-mono text-xs text-[#111116] font-bold">
                      {paymentError}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="utr" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    12-Digit UPI Transaction Reference (UTR) <span className="text-[#FF2E93]">*</span>
                  </label>
                  <input
                    id="utr"
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    placeholder="e.g. 983271829102"
                    maxLength={12}
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                  <p className="mt-1 font-mono text-[11px] text-[#111116]/60">
                    Exact 12 digits found on your payment receipt.
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Upload Payment Screenshot <span className="text-[#FF2E93]">*</span>
                  </label>

                  {!screenshotPreview ? (
                    <label className="border-2 border-dashed border-[#111116] rounded-xl p-5 flex items-center justify-center gap-3 bg-[#FBFBFB] hover:bg-[#F4F4F6] transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-[#111116]" />
                      <span className="font-mono text-xs font-bold text-[#111116]">
                        Attach Screenshot (JPG/PNG under 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-[#FBFBFB] rounded-xl border-2 border-[#111116]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={screenshotPreview} 
                          alt="Payment Receipt" 
                          className="w-12 h-12 object-cover rounded-lg border border-[#111116]"
                        />
                        <span className="font-mono text-xs font-bold text-[#111116] truncate max-w-[200px]">
                          {screenshotFile?.name || "receipt.jpg"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotFile(null);
                          setScreenshotPreview('');
                        }}
                        className="text-xs font-mono font-bold text-[#FF2E93] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#FBFBFB] rounded-xl border border-[#111116]/10">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#111116] text-[#111116] focus:ring-[#FFE500]"
                    />
                    <span className="text-xs text-[#111116] font-bold">
                      Our team confirms physical attendance for the 24-hour sprint at SIET Coimbatore on Dec 15-16, 2026.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPayment || timeLeft.isExpired || verifiedTeam.is_expired || verifiedTeam.is_paid_verified}
                  className={`w-full h-16 font-black text-base sm:text-lg rounded-2xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] flex items-center justify-center gap-3 transition-all ${
                    timeLeft.isExpired || verifiedTeam.is_expired
                      ? 'bg-[#FF2E93]/20 text-[#FF2E93] border-[#FF2E93] cursor-not-allowed shadow-none'
                      : verifiedTeam.is_paid_verified
                        ? 'bg-[#B6FF00] text-[#111116] cursor-not-allowed'
                        : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] cursor-pointer'
                  }`}
                >
                  {isSubmittingPayment ? (
                    <span>CONFIRMING ARENA DESK...</span>
                  ) : (timeLeft.isExpired || verifiedTeam.is_expired) ? (
                    <span>SEAT RESERVATION EXPIRED · SUBMISSIONS LOCKED</span>
                  ) : verifiedTeam.is_paid_verified ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>SEAT CONFIRMED & PAID · DEADLINE MET</span>
                    </span>
                  ) : (
                    <>
                      <span>LOCK ARENA SEATS (₹{totalAmount.toLocaleString()}) →</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

