import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/common/SeoHead';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';

export default function SubmitPptPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8">
      <SeoHead route="/submit-ppt" />

      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs font-black text-[#111116] mb-8 hover:text-[#0055FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO VELTRAXX 2.0 OVERVIEW</span>
        </Link>

        <div className="bg-white rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] p-7 sm:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111116] text-[#FFE500] font-mono text-xs font-black uppercase tracking-wider">
            <span>SINGLE-ROUND FORMAT UPDATE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111116] tracking-tight leading-tight">
            Preliminary PPT Submissions Are Discontinued
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 font-medium leading-relaxed">
            VELTRAXX 2.0 has transitioned into a <strong>direct single-round, 24-hour onsite hackathon</strong> at SIET Coimbatore on <strong>December 15-16, 2026</strong>. There is no online preliminary round, PPT deck upload, or online shortlisting.
          </p>

          <div className="bg-[#FAF8F5] border-2 border-[#111116] rounded-2xl p-5 space-y-2.5 font-mono text-xs text-[#111116]">
            <div className="flex items-center gap-2 font-black text-[#0055FF]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Strictly 3 Members per Team (Open to all academic disciplines)</span>
            </div>
            <div className="flex items-center gap-2 font-black">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FF2E93]" />
              <span>Registration Fee: ₹500 per member (₹1,500 total per team)</span>
            </div>
            <div className="flex items-center gap-2 font-black">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>Registrations close December 12, 2026 at 11:59 PM IST (Max 60 Teams)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/register"
              className="flex-1 py-4 px-6 bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] font-black text-sm rounded-2xl border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] flex items-center justify-center gap-2"
            >
              <span>REGISTER &amp; PAY (₹1,500 / TEAM)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/"
              className="py-4 px-6 bg-[#111116] text-white font-black text-sm rounded-2xl border-3 border-[#111116] flex items-center justify-center gap-2"
            >
              <span>RETURN TO OVERVIEW</span>
            </Link>
          </div>

          <div className="pt-2 flex items-center gap-2 font-mono text-xs text-[#111116]/60">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Previously uploaded pre-conversion records remain securely archived per our Privacy Policy.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
