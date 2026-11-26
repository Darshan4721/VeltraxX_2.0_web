import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../../config/eventConfig';
import { completeUnifiedRegistration, submitRound2Payment, getWindowStatus } from '../../lib/api';
import {
  Clock,
  QrCode,
  Upload,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  X
} from 'lucide-react';

export const PENDING_PAYMENT_STORAGE_KEY = 'veltraxx_pending_checkout_v2';

function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `vtx-${crypto.randomUUID()}`;
  }
  return `vtx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Shared Unified Payment Pop-Up Panel.
 * Fixed upper region stays pinned (static UPI QR, ₹1,500 / ₹500 breakdown, institutional payee, hold timer)
 * while the lower region smoothly scrolls through payment instructions, mandatory policies, consent,
 * 12-digit UTR input, expandable screenshot upload with preview, and "Complete Registration".
 */
export default function PaymentCheckoutPanel({
  unifiedDraft = null,
  reservation = null,
  teamData = null,
  onClose,
  onRegistrationComplete,
  onPaymentSubmitted,
  isModal = true
}) {
  const isLegacyRecovery = Boolean(teamData?.team_id && !unifiedDraft);

  const [utrNumber, setUtrNumber] = useState(teamData?.submitted_utr || teamData?.utr_number || '');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isUploadExpanded, setIsUploadExpanded] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [windowStatus, setWindowStatus] = useState(null);

  const idempotencyKeyRef = useRef(
    reservation?.idempotency_key || makeIdempotencyKey()
  );

  const [timeLeft, setTimeLeft] = useState({
    minutes: 5,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    getWindowStatus().then((ws) => {
      if (ws) setWindowStatus(ws);
    }).catch(() => {});
  }, []);

  // Countdown for temporary checkout hold (does not delete draft if expired)
  useEffect(() => {
    const deadlineSource = reservation?.expires_at || reservation?.payment_deadline || teamData?.payment_deadline;
    const fallbackMinutes = windowStatus?.payment_reservation_minutes || eventConfig.registration?.paymentReservationMinutes || 5;
    const deadlineMs = deadlineSource
      ? new Date(deadlineSource).getTime()
      : Date.now() + fallbackMinutes * 60 * 1000;

    const tick = () => {
      const diff = deadlineMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
      } else {
        const totalSecs = Math.floor(diff / 1000);
        setTimeLeft({
          minutes: Math.floor(totalSecs / 60),
          seconds: totalSecs % 60,
          isExpired: false
        });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [reservation, teamData, windowStatus]);

  const teamSize = eventConfig.registration?.teamSize || 3;
  const feePerMember = reservation?.fee_per_member || teamData?.fee_per_member || eventConfig.registration?.feePerMemberINR || 500;
  const totalAmount = reservation?.total_fee || teamData?.total_fee || teamSize * feePerMember;

  // UPI configuration strictly gated until organizer uploads verified QR + official payment account
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
  const configuredUpiId = eventConfig.registration?.upiId || '';
  const isQrVerified = Boolean(
    eventConfig.registration?.isUpiVerified &&
    configuredUpiId &&
    (windowStatus?.payment_open === true || reservation?.payment_open === true || isMockMode)
  );
  const canSubmitLive = isQrVerified || isMockMode;
  const payeeName = eventConfig.registration?.payeeName || 'VELTRAXX 2.0 SIET';
  const qrImagePath = eventConfig.registration?.paymentQrPath || '/images/payment-qr.png';
  const displayTeamLabel = unifiedDraft?.team_name || teamData?.team_name || 'Your Squad';
  const upiUrl = isQrVerified
    ? `upi://pay?pa=${encodeURIComponent(configuredUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`VELTRAXX_${teamData?.team_id || displayTeamLabel.slice(0, 12)}`)}`
    : '';

  const copyValue = (val, key) => {
    if (!val || !navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const handleScreenshotChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Payment screenshot must be strictly under 2 MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Accepted image formats: PNG, JPG, JPEG, or WebP.');
      return;
    }

    setScreenshotFile(file);
    setIsUploadExpanded(true);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const cleanUtr = utrNumber.trim();
  const isUtrValid = /^[0-9]{12}$/.test(cleanUtr);
  const hasScreenshot = Boolean(screenshotFile || screenshotPreview);
  const isFormCompleteReady = canSubmitLive && consentAccepted && isUtrValid && hasScreenshot && !isSubmitting;

  const handleCompleteSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMsg('');

    if (!canSubmitLive) {
      setErrorMsg('Live payments are disabled until the organizing committee activates the official UPI QR and payment account.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please check the mandatory consent box confirming the no-substitution, non-refundable fee, and verification policies.');
      return;
    }
    if (!isUtrValid) {
      setErrorMsg('Enter an exact 12-digit numeric UPI Transaction Reference (UTR).');
      return;
    }
    if (!hasScreenshot) {
      setIsUploadExpanded(true);
      setErrorMsg('Please upload your UPI payment confirmation screenshot (JPG/PNG/WebP under 2 MB).');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (isLegacyRecovery) {
        const passcode = teamData?.payment_token || teamData?.team_passcode || teamData?.secret_passcode || '';
        result = await submitRound2Payment({
          team_id: teamData.team_id,
          passcode,
          utr_number: cleanUtr,
          screenshotFile,
          payment_screenshot_url: screenshotPreview
        });
        result = {
          ...result,
          team_id: teamData.team_id,
          team_name: teamData.team_name,
          utr_number: cleanUtr,
          payment_status: 'PENDING_VERIFICATION'
        };
        onPaymentSubmitted?.(result);
      } else {
        result = await completeUnifiedRegistration({
          draft: unifiedDraft,
          utr_number: cleanUtr,
          reservation_token: reservation?.reservation_token || null,
          idempotency_key: idempotencyKeyRef.current,
          consent_accepted: true,
          screenshotFile,
          payment_screenshot_url: screenshotPreview
        });
        onRegistrationComplete?.(result);
      }

      try {
        sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
      } catch {}
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to submit registration right now. Your form draft is safe - please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? 'flex flex-col max-h-[92vh] bg-white overflow-hidden' : 'flex flex-col bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] overflow-hidden'}>
      {/* ===================================================================
          FIXED UPPER SECTION: STATIC QR, ₹1,500 FEE BREAKDOWN & INSTITUTIONAL PAYEE
         =================================================================== */}
      <div className="shrink-0 bg-[#0D0D11] text-white border-b-3 border-[#111116] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FFE500] text-[#111116] font-mono text-[11px] font-black px-2 py-0.5 rounded uppercase">
                {isLegacyRecovery ? teamData.team_id : 'FINAL STEP // PAYMENT'}
              </span>
              <span className="text-xs sm:text-sm font-black truncate">{displayTeamLabel}</span>
            </div>
            <div className="font-mono text-[11px] text-[#00E5FF] font-bold mt-1">
              Total Payment: ₹{totalAmount.toLocaleString()} per team (₹{feePerMember} per participant · {teamSize} Members)
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-black flex items-center gap-1.5 ${
              timeLeft.isExpired
                ? 'bg-[#FF2E93] text-white border-white/30'
                : 'bg-white/10 text-[#FFE500] border-[#FFE500]/40'
            }`} title="Temporary checkout seat hold">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {timeLeft.isExpired
                  ? 'HOLD LAPSED'
                  : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
              </span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Edit Team Details"
                aria-label="Close payment popup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fixed Static QR & Institutional Payment Details */}
        <div className="pt-3.5 flex flex-col sm:flex-row items-center gap-4">
          {isQrVerified ? (
            <>
              <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2 rounded-2xl border-2 border-[#FFE500] shadow-[4px_4px_0px_0px_#FFE500] shrink-0 flex items-center justify-center">
                <img
                  src={qrImagePath}
                  alt="Official VELTRAXX 2.0 SIET UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-black text-[#B6FF00] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OFFICIAL EVENT PAYMENT QR</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  Payee: {payeeName} · SIET Coimbatore
                </div>
                <div className="font-mono text-[11px] text-white/80">
                  Dept of Electronics Eng (VLSI Design &amp; Tech) · Amount: <strong>₹{totalAmount.toLocaleString()}</strong>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyValue(configuredUpiId, 'upi')}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#111116] font-mono text-[11px] font-black flex items-center gap-1.5 cursor-pointer hover:bg-[#FFE500] transition-colors"
                  >
                    {copiedKey === 'upi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'upi' ? 'COPIED UPI' : `UPI: ${configuredUpiId}`}</span>
                  </button>

                  {upiUrl && (
                    <a
                      href={upiUrl}
                      className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-[#111116] font-mono text-[11px] font-black inline-flex items-center gap-1.5 hover:brightness-105"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN UPI APP</span>
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-[#FFE500]/40 rounded-2xl p-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 border-2 border-dashed border-[#FFE500] rounded-2xl shrink-0 flex flex-col items-center justify-center text-center p-2">
                <QrCode className="w-8 h-8 text-[#FFE500] mb-1" />
                <span className="font-mono text-[9px] font-black text-[#FFE500] uppercase leading-tight">
                  QR Pending Verification
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1 font-mono text-[10px] font-black text-[#FFE500] uppercase">
                  <Lock className="w-3 h-3" />
                  <span>OFFICIAL QR &amp; PAYMENT ACCOUNT PENDING VERIFICATION</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Live fee collection is locked until the organizing committee activates the verified SIET institutional UPI QR code. Your team draft remains safely saved locally.
                </p>
                <div className="font-mono text-[11px] text-[#00E5FF] font-bold">
                  Institutional Account: {payeeName} · Fee: ₹{totalAmount.toLocaleString()} (₹{feePerMember} × 3)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          SCROLLABLE LOWER SECTION: INSTRUCTIONS, MATERIAL POLICIES, CONSENT,
          UTR FIELD, EXPANDABLE SCREENSHOT UPLOAD & PREVIEW, COMPLETE REGISTRATION
         =================================================================== */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
        {timeLeft.isExpired && (
          <div className="p-3.5 rounded-xl bg-[#FFE500]/25 border-2 border-[#111116] flex items-start gap-2.5 text-xs text-[#111116]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF2E93]" />
            <div>
              <strong>Temporary Seat Hold Elapsed:</strong> Seats are released back to the pool when a hold lapses. If you already transferred ₹1,500, still complete UTR &amp; screenshot upload below (your evidence is logged even if the 60th seat fills simultaneously) or email{' '}
              <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>.
            </div>
          </div>
        )}

        {/* Payment Instructions & Material Terms (Disclosed BEFORE Transfer) */}
        <div className="bg-[#FAF8F5] rounded-2xl border-2 border-[#111116] p-4 space-y-3">
          <div>
            <div className="font-mono text-xs font-black uppercase text-[#111116] mb-1">
              1. Payment Instructions &amp; Verification Rules
            </div>
            <ol className="text-xs text-[#111116]/85 space-y-1 list-decimal pl-4 font-medium">
              <li>Read all policies below BEFORE transferring money via UPI.</li>
              <li>Scan the fixed QR above (always visible while scrolling) to pay <strong>₹1,500 total</strong> (₹500 per member × 3).</li>
              <li>Copy your <strong>12-digit numeric UTR</strong>, expand &amp; upload your payment confirmation screenshot, accept terms, and click <strong>Complete Registration</strong>.</li>
            </ol>
          </div>

          <div className="border-t border-[#111116]/15 pt-2.5 space-y-1.5 text-[11px] font-mono text-[#111116]/85">
            <div className="font-black uppercase text-[#FF2E93]">2. Mandatory Event &amp; Payment Policies</div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>No Team Member Substitution Policy:</strong> Strictly 3 registered members per team. Post-registration member swaps or substitutions are not permitted.</li>
              <li><strong>Non-Refundable Fee Policy:</strong> Registration fee (₹1,500) is strictly non-refundable for voluntary team cancellation, withdrawal, or non-attendance.</li>
              <li><strong>Rulebook &amp; Eligibility:</strong> All members must carry valid college ID cards and comply with SIET institutional eligibility and minor-safety requirements.</li>
              <li><strong>Bank Credit Verification:</strong> Registration is marked confirmed ONLY after the organizing committee verifies actual bank credit and emails confirmation from <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>. Duplicate or fabricated UTR submissions lead to rejection.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#FF2E93]/10 border-2 border-[#FF2E93] flex items-start gap-2.5 font-mono text-xs font-bold text-[#111116]"
            >
              <AlertTriangle className="w-4 h-4 text-[#FF2E93] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mandatory Consent Checkbox (Inside Payment Popup before finalizing) */}
          <div className="p-3.5 bg-[#FFE500]/15 rounded-xl border-2 border-[#111116]">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="checkout-consent-terms"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-2 border-[#111116] text-[#111116] focus:ring-[#FFE500] shrink-0"
              />
              <span className="text-xs text-[#111116] leading-relaxed font-bold">
                I acknowledge the payment instructions, No Team Member Substitution policy, Non-Refundable Voluntary Cancellation policy, VELTRAXX 2.0 Event Rules, and{' '}
                <Link to="/privacy-policy" target="_blank" className="text-[#0055FF] underline">
                  Privacy Policy
                </Link>
                , and confirm our 3-member roster is final. <span className="text-[#FF2E93]">*</span>
              </span>
            </label>
          </div>

          {/* 12-Digit Transaction Reference (UTR) */}
          <div>
            <label htmlFor="checkout-utr" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
              Payment Transaction Reference (12-Digit UTR) <span className="text-[#FF2E93]">*</span>
            </label>
            <input
              id="checkout-utr"
              type="text"
              inputMode="numeric"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="e.g. 983271829102"
              maxLength={12}
              className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            />
            <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#111116]/65">
              <span>Enter exact 12-digit numeric UTR from your UPI payment receipt.</span>
              <span className={isUtrValid ? 'text-emerald-700 font-black' : ''}>{cleanUtr.length}/12 digits</span>
            </div>
          </div>

          {/* Expandable Payment Screenshot Upload Section + Preview */}
          <div className="border-2 border-[#111116] rounded-2xl overflow-hidden bg-[#FBFBFB]">
            <button
              type="button"
              onClick={() => setIsUploadExpanded((v) => !v)}
              aria-expanded={isUploadExpanded}
              className="w-full px-4 py-3 bg-[#F4F4F6] hover:bg-[#ECECF0] flex items-center justify-between font-mono text-xs font-black uppercase text-[#111116] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0055FF]" />
                <span>
                  Payment Screenshot Upload {hasScreenshot ? '(Image Attached ✓)' : '*'}
                </span>
              </span>
              {isUploadExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isUploadExpanded && (
              <div className="p-4 space-y-3 border-t border-[#111116]/15">
                {!screenshotPreview ? (
                  <label className="border-2 border-dashed border-[#111116] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer text-center">
                    <Upload className="w-5 h-5 text-[#111116] shrink-0" />
                    <span className="font-mono text-xs font-bold text-[#111116]">
                      Choose Payment Screenshot (JPG / PNG / WebP under 2 MB)
                    </span>
                    <input
                      id="checkout-screenshot-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border-2 border-[#111116]">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshotPreview}
                        alt="Uploaded Payment Screenshot Preview"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-[#111116] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-black text-[#111116] truncate">
                          {screenshotFile?.name || 'payment-screenshot.png'}
                        </div>
                        <div className="font-mono text-[10px] text-emerald-700 font-bold">
                          Screenshot preview ready · Stored privately for verification
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="text-xs font-mono font-black text-[#0055FF] hover:underline cursor-pointer">
                        Replace
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotFile(null);
                          setScreenshotPreview('');
                        }}
                        className="text-xs font-mono font-black text-[#FF2E93] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormCompleteReady}
            className={`w-full h-14 font-black text-sm sm:text-base rounded-2xl border-3 border-[#111116] flex items-center justify-center gap-2 transition-all ${
              !isFormCompleteReady
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] shadow-[4px_4px_0px_0px_#111116] cursor-pointer'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'Submitting Registration & Payment Proof...'
                : !canSubmitLive
                  ? 'Complete Registration (Awaiting Official QR)'
                  : 'Complete Registration'}
            </span>
          </button>

          {!isFormCompleteReady && !isSubmitting && canSubmitLive && (
            <p className="text-center font-mono text-[11px] text-[#111116]/65">
              Enable <strong>Complete Registration</strong> by accepting consent, entering the 12-digit UTR, and attaching your payment screenshot.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
