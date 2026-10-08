import React, { useState, useRef } from 'react';
import { eventConfig } from '../../config/eventConfig';
import { 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

/* =========================================================================
   FACULTY PAYMENT DETAILS CONFIGURATION INSTRUCTIONS:
   When official UPI VPA is provided by the faculty coordinator:
   1. Set eventConfig.registration.upiId = "official_vpa@upi" in src/config/eventConfig.js
   2. Ensure eventConfig.registration.payeeName matches the bank account name
   3. Place the official high-resolution QR image at public/images/upi-qr.png
   ========================================================================= */

export default function PaymentStep({
  utrNumber,
  onUtrChange,
  receiptImage,
  onReceiptChange,
  consentEventTerms,
  onConsentEventTermsChange,
  consentFutureEvents,
  onConsentFutureEventsChange,
  errors = {}
}) {
  const [copied, setCopied] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(receiptImage || null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const hasConfiguredUpi = Boolean(eventConfig.registration?.upiId);
  const upiVpa = eventConfig.registration?.upiId || "";
  const upiPayee = eventConfig.registration?.payeeName || "VELTRAXX 2.0 SIET";
  const registrationFee = eventConfig.registration?.feeINR || 1000;

  // Generate UPI Deep link for mobile users
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(upiPayee)}&am=${registrationFee}&cu=INR&tn=${encodeURIComponent('VELTRAXX 2.0 Team Fee')}`;

  const handleCopyUpi = () => {
    if (!upiVpa) return;
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size exceeds 2MB limit. Please upload an image under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError("Please upload a valid JPG, PNG, or WEBP image.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setReceiptPreview(dataUrl);
      onReceiptChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptPreview(null);
    setUploadError('');
    onReceiptChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] p-6 sm:p-8 space-y-8">
      
      {/* Chapter 03 Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase mb-3">
          <CreditCard className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>CHAPTER 03 // PAYMENT & RECEIPT VERIFICATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#111116] tracking-tight">
          Flat ₹1,000 Team Fee Payment
        </h2>
        <p className="text-sm text-[#111116]/75 mt-1 font-medium">
          Registration fee is ₹1,000 per team (₹250 per member). 
          {hasConfiguredUpi 
            ? " Pay via any UPI application (GPay, PhonePe, Paytm), enter the 12-digit UTR, and upload the confirmation screenshot."
            : " Payment collection details are currently being finalized by the organizing committee."}
        </p>
      </div>

      {!hasConfiguredUpi ? (
        /* If official UPI ID is not in eventConfig yet: Show Payment Details Coming Soon */
        <div className="bg-[#FAF9F5] p-6 sm:p-8 rounded-2xl border-2 border-[#111116] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFE500] text-[#111116] border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] flex items-center justify-center font-mono font-black text-xl">
              ₹
            </div>
            <div>
              <h3 className="text-lg font-black text-[#111116]">Payment details coming soon</h3>
              <p className="text-xs text-[#6B6B78] font-mono font-bold">
                Total Fee: ₹{registrationFee} / Team (4 Members) · Direct UPI Transfer
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#111116]/80 leading-relaxed font-medium">
            The faculty organizing committee is setting up the official event UPI account. Once active, the QR code, VPA ID, and screenshot upload will appear here.
          </p>
          <div className="p-3 bg-white rounded-xl border border-[#111116]/15 font-mono text-xs text-[#6B6B78]">
            Your team roster and college details entered above are saved automatically in your draft.
          </div>
        </div>
      ) : (
        /* If official UPI ID is configured: Render full payment fields */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#FAF9F5] p-5 sm:p-6 rounded-2xl border-2 border-[#111116]">
            
            {/* Left Column (5 Cols): High-Contrast QR Code for Laptop Users */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-4 bg-white rounded-2xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]">
              <div className="w-48 h-48 bg-white border-2 border-[#111116] rounded-xl p-3 flex flex-col items-center justify-center relative mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#111116] fill-current">
                  <path d="M10,10 h30 v30 h-30 z M16,16 v18 h18 v-18 z M22,22 h6 v6 h-6 z" />
                  <path d="M60,10 h30 v30 h-30 z M66,16 v18 h18 v-18 z M72,22 h6 v6 h-6 z" />
                  <path d="M10,60 h30 v30 h-30 z M16,66 v18 h18 v-18 z M22,72 h6 v6 h-6 z" />
                  <rect x="44" y="10" width="8" height="8" />
                  <rect x="44" y="24" width="8" height="14" />
                  <rect x="44" y="44" width="12" height="12" />
                  <rect x="10" y="44" width="14" height="8" />
                  <rect x="28" y="44" width="8" height="8" />
                  <rect x="60" y="44" width="14" height="8" />
                  <rect x="80" y="44" width="10" height="8" />
                  <rect x="60" y="60" width="8" height="14" />
                  <rect x="74" y="60" width="16" height="8" />
                  <rect x="68" y="74" width="12" height="16" />
                  <rect x="44" y="66" width="8" height="24" />
                  <rect x="86" y="80" width="8" height="10" />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-[#FFE500] text-[#111116] font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#111116] shadow-xs">
                    ₹{registrationFee}
                  </span>
                </div>
              </div>

              <div className="font-mono text-xs font-black text-[#111116]">
                SCAN WITH ANY UPI APP
              </div>
              <div className="font-mono text-[11px] text-[#6B6B78] mt-0.5">
                GPay · PhonePe · Paytm · BHIM
              </div>

              <a
                href="/images/wafer-chromatic.jpg"
                download="VELTRAXX_2.0_UPI_QR.jpg"
                className="mt-3 text-xs font-mono font-bold text-[#0055FF] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR image to gallery</span>
              </a>
            </div>

            {/* Right Column (7 Cols): Mobile One-Tap Buttons & UPI Details */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#111116]/10">
                <div>
                  <div className="font-mono text-xs text-[#6B6B78] font-bold">TOTAL REGISTRATION FEE</div>
                  <div className="text-3xl font-black text-[#111116]">₹{registrationFee} <span className="text-xs font-mono font-normal text-[#6B6B78]">/ Team (4 Members)</span></div>
                </div>
                <span className="bg-[#B6FF00] text-[#111116] font-mono text-xs font-black px-3 py-1.5 rounded-xl border border-[#111116]">
                  NO EXTRA TAXES
                </span>
              </div>

              {/* MOBILE PRIMARY: One-Tap "Pay with UPI app" Deep Link Button */}
              <div>
                <a
                  href={upiDeepLink}
                  className="w-full h-13 bg-[#111116] hover:bg-[#25252D] text-[#FFE500] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#FFE500] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2.5"
                >
                  <Smartphone className="w-5 h-5 text-[#FFE500]" />
                  <span>PAY WITH UPI APP (MOBILE DEEP LINK)</span>
                </a>
                <p className="text-[11px] font-mono text-[#6B6B78] mt-1 text-center">
                  Tapping opens GPay, PhonePe, or default UPI client on your device.
                </p>
              </div>

              {/* Copy UPI ID Row */}
              <div className="bg-white p-3.5 rounded-xl border-2 border-[#111116] flex items-center justify-between gap-3">
                <div>
                  <span className="block font-mono text-[10px] font-bold text-[#6B6B78] uppercase">
                    UPI VPA ID
                  </span>
                  <span className="font-mono text-sm font-black text-[#111116]">
                    {upiVpa}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3.5 py-2 bg-[#F4F4F6] hover:bg-[#FFE500] text-[#111116] font-mono text-xs font-bold rounded-lg border border-[#111116] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "COPIED" : "COPY VPA"}</span>
                </button>
              </div>

            </div>

          </div>

          {/* 12-Digit Numeric UTR Reference Input */}
          <div>
            <label htmlFor="utr-input" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
              12-Digit UPI Reference Number (UTR ID from GPay or PhonePe) *
            </label>
            <div className="relative">
              <input
                id="utr-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                value={utrNumber || ''}
                onChange={(e) => {
                  const numOnly = e.target.value.replace(/[^0-9]/g, '');
                  onUtrChange(numOnly);
                }}
                placeholder="e.g. 423987162541 (Exactly 12 digits)"
                className={`w-full h-12 bg-white border-2 ${
                  errors.utr_number ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-4 text-base font-mono font-bold text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-[#6B6B78]">
                {utrNumber?.length || 0}/12
              </div>
            </div>
            {errors.utr_number ? (
              <span className="text-[11px] font-bold text-[#FF2E93] mt-1 block">
                {errors.utr_number}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#6B6B78] mt-1 block">
                Found on your Google Pay / PhonePe transaction confirmation screen.
              </span>
            )}
          </div>

          {/* Payment Screenshot Receipt Upload (Max 2MB) */}
          <div>
            <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5 flex items-center justify-between">
              <span>Upload Payment Screenshot (Receipt Proof) *</span>
              <span className="font-mono text-[11px] text-[#6B6B78]">JPG, PNG, WEBP (Max 2MB)</span>
            </label>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {receiptPreview ? (
              <div className="p-4 bg-[#FAF9F5] border-2 border-[#111116] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="w-16 h-16 object-cover rounded-xl border border-[#111116]"
                  />
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Screenshot Loaded
                    </span>
                    <span className="text-[11px] text-[#6B6B78] font-mono block mt-0.5">
                      Ready for verification audit
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2.5 bg-[#FF2E93]/10 text-[#FF2E93] rounded-xl border border-[#FF2E93]/30 hover:bg-[#FF2E93] hover:text-[#111116] font-bold transition-colors cursor-pointer"
                  title="Remove screenshot"
                  aria-label="Remove screenshot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed ${
                  (uploadError || errors.receipt) ? 'border-[#FF2E93] bg-[#FF2E93]/5' : 'border-[#111116] bg-[#FAF9F5] hover:bg-[#F4F4F6]'
                } rounded-2xl text-center cursor-pointer transition-colors`}
              >
                <Upload className="w-8 h-8 text-[#6B6B78] mx-auto mb-2" />
                <div className="text-sm font-bold text-[#111116]">
                  Click to select payment screenshot
                </div>
                <div className="text-xs text-[#6B6B78] mt-1 font-mono">
                  Supported formats: JPG, PNG, WEBP (Maximum size 2MB)
                </div>
              </div>
            )}

            {(uploadError || errors.receipt) && (
              <span className="text-[11px] font-bold text-[#FF2E93] mt-1.5 block">
                {uploadError || errors.receipt}
              </span>
            )}
          </div>
        </>
      )}

      {/* Double Consent Section */}
      <div className="pt-6 border-t-2 border-[#111116]/10 space-y-4 bg-[#F4F4F6] p-5 rounded-2xl border border-[#111116]/15">
        <div className="font-mono text-xs font-black uppercase text-[#111116] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
          <span>DATA PRIVACY & EVENT PARTICIPATION CONSENT</span>
        </div>

        {/* Mandatory Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentEventTerms}
            onChange={(e) => onConsentEventTermsChange(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-[#111116] cursor-pointer"
          />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-[#111116]">
              I confirm all 4 members agree to share these details for VELTRAXX 2.0 participation and verification. *
            </span>
            <span className="text-[#6B6B78] block mt-0.5">
              Required to register. Data used exclusively for event communications, attendance logs, and participation certificates.
            </span>
          </div>
        </label>
        {errors.consent_terms && (
          <span className="text-[11px] font-bold text-[#FF2E93] block ml-8">
            {errors.consent_terms}
          </span>
        )}

        {/* Optional Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentFutureEvents}
            onChange={(e) => onConsentFutureEventsChange(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-[#111116] cursor-pointer"
          />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-[#111116]">
              (Optional) We agree to be contacted about future semiconductor events, EDA tool workshops, and conferences by SIET ECE / VLSI.
            </span>
            <span className="text-[#6B6B78] block mt-0.5">
              Explicit opt-in. You may opt out anytime.
            </span>
          </div>
        </label>
      </div>

    </div>
  );
}
