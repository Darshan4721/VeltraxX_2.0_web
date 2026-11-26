import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { eventConfig } from '../config/eventConfig';
import { verifyRound2Gatekeeper, recoverTeamIdentity } from '../lib/api';
import PaymentCheckoutPanel from '../components/register/PaymentCheckoutPanel';
import {
  Lock,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Search,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

/**
 * Hidden / Noindex Legacy Team Payment & Interrupted Recovery Route.
 * New registrations complete payment directly inside /register in one unified step.
 */
export default function Round2ConfirmPage() {
  const [unlockTab, setUnlockTab] = useState('lookup');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [teamId, setTeamId] = useState('');
  const [passcode, setPasscode] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verifiedTeam, setVerifiedTeam] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(null);

  const handleUnlockByLookup = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setAuthError('');

    const cleanEmail = lookupEmail.trim().toLowerCase();
    const cleanPhone = lookupPhone.trim().replace(/[^0-9]/g, '');
    if (!cleanEmail || cleanPhone.length < 10) {
      setAuthError('Enter both a registered member email address and 10-digit mobile number.');
      return;
    }

    setIsVerifying(true);
    try {
      const data = await recoverTeamIdentity({ email: cleanEmail, phone: cleanPhone });
      if (!data.payment_token) {
        setAuthError('Payment access has not yet been authorized for this legacy team. Contact vlsireseachlab@siet.ac.in.');
        return;
      }
      setVerifiedTeam({
        team_id: data.team_id,
        team_name: data.team_name,
        team_size: data.team_size || 3,
        fee_per_member: data.fee_per_member || 500,
        total_fee: data.total_fee || (data.team_size || 3) * 500,
        payment_token: data.payment_token,
        payment_deadline: data.payment_deadline,
        is_paid_verified: !!data.is_paid_verified,
        submitted_utr: data.utr_number || null
      });
    } catch (err) {
      setAuthError(err?.message || 'No authorized team found matching both that email and phone number.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnlockByToken = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setAuthError('');

    const cleanTeamId = teamId.trim().toUpperCase();
    const cleanPasscode = passcode.trim().toUpperCase();
    if (!cleanTeamId || !cleanPasscode) {
      setAuthError('Enter both your Team ID and organizer-issued recovery token.');
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyRound2Gatekeeper(cleanTeamId, cleanPasscode);
      if (!data?.valid) {
        setAuthError(data?.error || 'Unable to verify legacy recovery credentials.');
        return;
      }
      setVerifiedTeam({
        ...data,
        payment_token: cleanPasscode
      });
    } catch (err) {
      setAuthError(err?.message || 'Verification failed. Check your Team ID and recovery token.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      <SeoHead route="/round2-confirm" />

      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-8 hover:text-[#0055FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT OVERVIEW</span>
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFE500]/40 shadow-[2px_2px_0px_0px_#FFE500]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B6FF00]" />
            <span>LEGACY RECOVERY PORTAL // PRE-CONVERSION TEAMS ONLY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight leading-tight">
            Legacy Team Payment Recovery
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 mt-2 font-normal leading-relaxed">
            New squads must complete registration and payment together at{' '}
            <Link to="/register" className="text-[#0055FF] font-black underline">/register</Link>. Use this recovery page only if you belong to an existing pre-conversion team granted manual payment access.
          </p>
        </div>

        {paymentSubmitted ? (
          <div className="bg-white rounded-3xl p-8 border-3 border-[#111116] shadow-[8px_8px_0px_0px_#B6FF00] space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#B6FF00] border-2 border-[#111116] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#111116]" />
            </div>
            <h2 className="text-2xl font-black text-[#111116]">Registration submitted successfully!</h2>
            <p className="text-sm font-bold text-[#111116] bg-[#B6FF00]/20 p-4 rounded-2xl border-2 border-[#111116]">
              Your payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.
            </p>
            <div className="font-mono text-xs space-y-1 bg-[#FBFBFB] p-4 rounded-xl border-2 border-[#111116]">
              <div><strong>Team ID:</strong> {paymentSubmitted.team_id}</div>
              <div><strong>UTR:</strong> {paymentSubmitted.utr_number}</div>
              <div><strong>Status:</strong> PENDING VERIFICATION</div>
            </div>
          </div>
        ) : !verifiedTeam ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#111116] shadow-[6px_6px_0px_0px_#111116] space-y-6">
            <div className="grid grid-cols-2 gap-2 bg-[#F4F4F6] p-1.5 rounded-2xl border-2 border-[#111116]">
              <button
                type="button"
                onClick={() => { setUnlockTab('lookup'); setAuthError(''); }}
                className={`py-2.5 px-3 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  unlockTab === 'lookup'
                    ? 'bg-[#FFE500] text-[#111116] border-2 border-[#111116]'
                    : 'text-[#111116]/70 hover:text-[#111116]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Email + Phone</span>
              </button>

              <button
                type="button"
                onClick={() => { setUnlockTab('token'); setAuthError(''); }}
                className={`py-2.5 px-3 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  unlockTab === 'token'
                    ? 'bg-[#FFE500] text-[#111116] border-2 border-[#111116]'
                    : 'text-[#111116]/70 hover:text-[#111116]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Team ID + Token</span>
              </button>
            </div>

            {authError && (
              <div className="p-4 bg-[#FF2E93]/10 border-2 border-[#FF2E93] rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF2E93] shrink-0 mt-0.5" />
                <div className="font-mono text-xs text-[#111116] font-bold">{authError}</div>
              </div>
            )}

            {unlockTab === 'lookup' ? (
              <form onSubmit={handleUnlockByLookup} className="space-y-4">
                <div>
                  <label htmlFor="lookup-email" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Registered Member Email <span className="text-[#FF2E93]">*</span>
                  </label>
                  <input
                    id="lookup-email"
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="leader@college.edu"
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-sm font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                <div>
                  <label htmlFor="lookup-phone" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    10-Digit Registered Mobile Number <span className="text-[#FF2E93]">*</span>
                  </label>
                  <input
                    id="lookup-phone"
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="9842154321"
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-sm font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full h-14 bg-[#111116] hover:bg-black text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isVerifying ? 'LOCATING RECORD...' : 'UNLOCK LEGACY PAYMENT →'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleUnlockByToken} className="space-y-4">
                <div>
                  <label htmlFor="team-id" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Team ID <span className="text-[#FF2E93]">*</span>
                  </label>
                  <input
                    id="team-id"
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value.toUpperCase())}
                    placeholder="e.g. VTX2-034"
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                <div>
                  <label htmlFor="passcode" className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Recovery Token <span className="text-[#FF2E93]">*</span>
                  </label>
                  <input
                    id="passcode"
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    placeholder="Enter issued token"
                    maxLength={10}
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-4 text-base font-mono font-bold tracking-widest text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full h-14 bg-[#111116] hover:bg-black text-[#FFE500] font-mono text-xs font-black rounded-xl border-2 border-[#111116] shadow-[4px_4px_0px_0px_#FFE500] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifying ? 'VERIFYING...' : 'OPEN PAYMENT CHECKOUT →'}
                </button>
              </form>
            )}

            <div className="p-4 bg-[#FBFBFB] rounded-xl border border-[#111116]/10 text-xs text-[#111116]/75 font-mono">
              New registration?{' '}
              <Link to="/register" className="font-black text-[#0055FF] underline">
                Register &amp; complete payment here →
              </Link>
              <div className="mt-1.5">
                Organizer Desk: <strong>{eventConfig.contacts?.confirmationSenderEmail}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVerifiedTeam(null)}
                className="font-mono text-xs font-black text-[#111116]/70 hover:text-[#FF2E93] underline cursor-pointer"
              >
                Switch / Look up another team
              </button>
            </div>

            <PaymentCheckoutPanel
              teamData={verifiedTeam}
              isModal={false}
              onPaymentSubmitted={(res) => setPaymentSubmitted(res)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
