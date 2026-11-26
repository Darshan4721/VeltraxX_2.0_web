import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { eventConfig } from '../../config/eventConfig';
import { completeUnifiedRegistration, submitRound2Payment, getWindowStatus } from '../../lib/api';
import {
  Clock,
  QrCode,
  Upload,
  AlertTriangle,
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
 * Fixed upper region stays pinned (team name, ₹1,500 total, static QR, live countdown when open)
 * while the lower region smoothly scrolls through compact policies, mandatory consent gating,
 * payment instructions, 12-digit UTR input, expandable screenshot upload with preview, and submit CTA.
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

  const teamSize = eventConfig.registration?.teamSize || 3;
  const feePerMember = reservation?.fee_per_member || teamData?.fee_per_member || eventConfig.registration?.feePerMemberINR || 500;
  const totalAmount = reservation?.total_fee || teamData?.total_fee || teamSize * feePerMember;

  // Static QR display gated solely by organizer payment activation (and isUpiVerified config)
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
  const isPaymentsEnabled = Boolean(
    eventConfig.registration?.isUpiVerified &&
    (windowStatus?.payment_open === true || reservation?.payment_open === true || isMockMode)
  );
  const canSubmitLive = isPaymentsEnabled || isMockMode;
  const payeeName = eventConfig.registration?.payeeName || 'VELTRAXX 2.0';
  const qrImagePath = eventConfig.registration?.paymentQrPath || '/images/payment-qr.png';
  const displayTeamLabel = unifiedDraft?.team_name || teamData?.team_name || 'Your Squad';

  // Reservation countdown runs ONLY while payments are unlocked
  useEffect(() => {
    if (!isPaymentsEnabled) {
      const resetMinutes = windowStatus?.payment_reservation_minutes || eventConfig.registration?.paymentReservationMinutes || 5;
      setTimeLeft({ minutes: resetMinutes, seconds: 0, isExpired: false });
      return undefined;
    }

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
  }, [isPaymentsEnabled, reservation, teamData, windowStatus]);

  const handleScreenshotChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Payment screenshot must be under 2 MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a JPG, PNG, or WebP image.');
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
      setErrorMsg('Live payments are currently locked by the organizing committee.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm the policy acknowledgment before paying and submitting.');
      return;
    }
    if (!isUtrValid) {
      setErrorMsg('Enter the exact 12-digit numeric UPI Transaction Reference (UTR).');
      return;
    }
    if (!hasScreenshot) {
      setIsUploadExpanded(true);
      setErrorMsg('Please upload your payment confirmation screenshot.');
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
      setErrorMsg(err?.message || 'Unable to submit registration right now. Your details are saved - please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={
        isModal
          ? 'flex flex-col max-h-[88vh] sm:max-h-[90vh] bg-white overflow-hidden'
          : 'flex flex-col bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] overflow-hidden'
      }
    >
      {/* ===================================================================
          FIXED UPPER SECTION: TEAM NAME, ₹1,500 TOTAL, STATIC QR & COUNTDOWN
         =================================================================== */}
      <div className="shrink-0 bg-[#111116] text-white border-b-3 border-[#111116] px-4 py-3.5 sm:px-6 sm:py-5">
        {/* Top Row: Team Identity, Prominent Fee, Countdown (only when active), Close */}
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-white/15">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isLegacyRecovery && (
                <span className="bg-[#FFE500] text-[#111116] text-xs font-extrabold px-2 py-0.5 rounded">
                  {teamData.team_id}
                </span>
              )}
              <h2 className="text-sm sm:text-lg font-black text-white truncate">
                {displayTeamLabel}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-white/75 mt-0.5 font-medium">
              3 Members · ₹{feePerMember} each
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#FFE500] text-[#111116] text-xs sm:text-sm font-black tracking-tight">
              ₹{totalAmount.toLocaleString()}
            </span>

            {isPaymentsEnabled ? (
              <div
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 ${
                  timeLeft.isExpired
                    ? 'bg-[#FF2E93] text-white border-white/30'
                    : 'bg-white/10 text-[#FFE500] border-[#FFE500]/40'
                }`}
                title="Seat reservation countdown"
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>
                  {timeLeft.isExpired
                    ? 'Expired'
                    : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
                </span>
              </div>
            ) : (
              <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-white/10 border border-white/20 text-[11px] sm:text-xs font-semibold text-white/80 flex items-center gap-1">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFE500]" />
                <span>Locked</span>
              </div>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Return to form"
                aria-label="Close payment popup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fixed Static QR Display (White padded card) */}
        <div className="pt-3.5 flex flex-row items-center gap-3.5 sm:gap-5">
          {isPaymentsEnabled ? (
            <>
              <div className="w-28 h-28 sm:w-40 sm:h-40 bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-[#FFE500] shadow-[3px_3px_0px_0px_#FFE500] sm:shadow-[4px_4px_0px_0px_#FFE500] shrink-0 flex items-center justify-center">
                <img
                  src={qrImagePath}
                  alt="VELTRAXX 2.0 Official UPI Payment QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0 text-left space-y-1 sm:space-y-1.5">
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#B6FF00] uppercase tracking-wide bg-white/10 px-2 py-0.5 rounded-lg">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>Official Event QR</span>
                </div>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Pay ₹{totalAmount.toLocaleString()} Total
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-snug">
                  Payee: <strong className="text-white">{payeeName}</strong>
                </p>
                <p className="text-[11px] sm:text-xs text-white/70 leading-snug">
                  Accept policies below, scan QR with any UPI app, then upload UTR &amp; screenshot.
                </p>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/15 rounded-2xl p-4">
              <div className="w-24 h-24 bg-white/10 border-2 border-dashed border-[#FFE500] rounded-2xl shrink-0 flex flex-col items-center justify-center text-center p-2">
                <QrCode className="w-8 h-8 text-[#FFE500] mb-1" />
                <span className="text-[10px] font-bold text-[#FFE500] leading-tight">
                  QR Locked
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFE500]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Payments Not Activated Yet</span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Live fee collection is currently paused by the organizing committee. Your team details are safely saved locally while checkout is locked.
                </p>
                <p className="text-xs font-semibold text-[#00E5FF]">
                  Team Fee: ₹{totalAmount.toLocaleString()} (₹{feePerMember} × {teamSize} Members)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          SCROLLABLE LOWER SECTION: COMPACT POLICIES, CONSENT, INSTRUCTIONS,
          UTR INPUT, EXPANDABLE SCREENSHOT UPLOAD & PREVIEW, SUBMIT BUTTON
         =================================================================== */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-5 sm:p-6 space-y-5 bg-white">
        {isPaymentsEnabled && timeLeft.isExpired && (
          <div className="p-3.5 rounded-xl bg-[#FFE500]/20 border-2 border-[#111116] flex items-start gap-2.5 text-xs sm:text-sm text-[#111116]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF2E93]" />
            <div>
              <strong>Reservation Window Elapsed:</strong> If you have already paid ₹1,500, still submit your UTR &amp; screenshot below so your payment evidence is logged, or contact{' '}
              <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>.
            </div>
          </div>
        )}

        {/* Compact Policy Summary */}
        <div className="bg-[#FAF8F5] rounded-2xl border-2 border-[#111116] p-4 sm:p-5 space-y-2.5">
          <h3 className="text-xs font-black uppercase tracking-wide text-[#111116]">
            Key Terms &amp; Policies
          </h3>
          <ul className="text-xs sm:text-sm text-[#111116]/85 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Strictly 3 Members, No Substitutions:</strong> Team member changes after registration are not permitted.
            </li>
            <li>
              <strong>Non-Refundable Fee:</strong> The ₹1,500 team fee is non-refundable for voluntary withdrawal or non-attendance.
            </li>
            <li>
              <strong>Verification &amp; Eligibility:</strong> All members must bring valid college ID cards. Seats confirm after bank verification via{' '}
              <span className="font-semibold">{eventConfig.contacts?.confirmationSenderEmail}</span>.
            </li>
          </ul>
        </div>

        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          {/* Mandatory Consent Checkbox BEFORE enabling payment instructions & proof inputs */}
          <div className={`p-4 rounded-2xl border-2 border-[#111116] transition-colors ${consentAccepted ? 'bg-[#B6FF00]/20' : 'bg-[#FFE500]/20'}`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="checkout-consent-terms"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-2 border-[#111116] text-[#111116] focus:ring-[#FFE500] shrink-0"
              />
              <span className="text-xs sm:text-sm text-[#111116] leading-relaxed font-semibold">
                I accept the no-substitution rule, non-refundable fee policy, event eligibility rules, and{' '}
                <Link to="/privacy-policy" target="_blank" className="text-[#0055FF] underline font-bold">
                  Privacy Policy
                </Link>
                , and confirm our 3-member team is final. <span className="text-[#FF2E93]">*</span>
              </span>
            </label>
          </div>

          {/* Payment Instructions & Proof Submission (enabled cleanly once consent is checked) */}
          <div
            className={`space-y-4 rounded-2xl border-2 border-[#111116]/15 p-4 sm:p-5 transition-opacity ${
              consentAccepted ? 'bg-white opacity-100' : 'bg-[#F8F8FA] opacity-65'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wide text-[#111116]">
                  Payment Instructions
                </h3>
                {!consentAccepted && (
                  <span className="text-[11px] font-bold text-[#FF2E93]">
                    Check consent above first
                  </span>
                )}
              </div>
              <ol className="text-xs sm:text-sm text-[#111116]/85 space-y-1 list-decimal pl-4 leading-relaxed">
                <li>Scan the static QR pinned above and pay exactly <strong>₹1,500</strong>.</li>
                <li>Enter the <strong>12-digit numeric UTR</strong> from your payment receipt below.</li>
                <li>Attach your payment screenshot and click <strong>Complete Registration</strong>.</li>
              </ol>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#FF2E93]/10 border-2 border-[#FF2E93] flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#111116]"
              >
                <AlertTriangle className="w-4 h-4 text-[#FF2E93] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 12-Digit Transaction Reference (UTR) */}
            <div>
              <label htmlFor="checkout-utr" className="block text-xs sm:text-sm font-bold text-[#111116] mb-1.5">
                UPI Transaction Reference (12-Digit UTR) <span className="text-[#FF2E93]">*</span>
              </label>
              <input
                id="checkout-utr"
                type="text"
                inputMode="numeric"
                disabled={!consentAccepted}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="e.g. 983271829102"
                maxLength={12}
                className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold tracking-wider text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-[#111116]/65">
                <span>12 numeric digits from your UPI transaction receipt.</span>
                <span className={isUtrValid ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {cleanUtr.length}/12 digits
                </span>
              </div>
            </div>

            {/* Expandable Payment Screenshot Upload Section + Preview */}
            <div className="border-2 border-[#111116] rounded-2xl overflow-hidden bg-[#FBFBFB]">
              <button
                type="button"
                onClick={() => setIsUploadExpanded((v) => !v)}
                aria-expanded={isUploadExpanded}
                className="w-full px-4 py-3 bg-[#F4F4F6] hover:bg-[#ECECF0] flex items-center justify-between text-xs sm:text-sm font-bold text-[#111116] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0055FF]" />
                  <span>
                    Payment Screenshot {hasScreenshot ? '(Attached ✓)' : '(Required *)'}
                  </span>
                </span>
                {isUploadExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isUploadExpanded && (
                <div className="p-4 space-y-3 border-t border-[#111116]/15">
                  {!screenshotPreview ? (
                    <label
                      className={`border-2 border-dashed border-[#111116] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white transition-colors text-center ${
                        consentAccepted ? 'hover:bg-[#FAF8F5] cursor-pointer' : 'cursor-not-allowed opacity-70'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-[#111116] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-[#111116]">
                        Upload Screenshot (JPG, PNG, or WebP under 2 MB)
                      </span>
                      <input
                        id="checkout-screenshot-input"
                        type="file"
                        disabled={!consentAccepted}
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
                          <div className="text-xs sm:text-sm font-bold text-[#111116] truncate">
                            {screenshotFile?.name || 'payment-screenshot.png'}
                          </div>
                          <div className="text-xs text-emerald-700 font-semibold">
                            Preview ready for submission
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="text-xs font-bold text-[#0055FF] hover:underline cursor-pointer">
                          Replace
                          <input
                            type="file"
                            disabled={!consentAccepted}
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
                          className="text-xs font-bold text-[#FF2E93] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormCompleteReady}
            className={`w-full h-14 font-black text-sm sm:text-base rounded-2xl border-3 border-[#111116] flex items-center justify-center gap-2 transition-all ${
              !isFormCompleteReady
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#111116] cursor-pointer'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'Submitting Registration...'
                : !canSubmitLive
                  ? 'Complete Registration (Payments Locked)'
                  : 'Complete Registration'}
            </span>
          </button>

          {!isFormCompleteReady && !isSubmitting && canSubmitLive && (
            <p className="text-center text-xs text-[#111116]/65">
              Accept terms, enter your 12-digit UTR, and attach your payment screenshot to complete registration.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
