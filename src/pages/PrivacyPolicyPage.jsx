import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, HardDrive, Lock, Clock, Mail, ArrowLeft } from 'lucide-react';
import SeoHead from '../components/common/SeoHead';
import Footer from '../components/Footer';

const POLICY_SECTIONS = [
  {
    id: 'collection',
    icon: Database,
    accent: '#FFE500',
    title: '1. Information We Collect',
    items: [
      {
        label: 'Team & Participant Registration Data',
        text: 'When a 3-member squad registers on VELTRAXX 2.0, we collect the team name, chosen competition track and problem statement code, academic tier, member full names, email addresses, 10-digit WhatsApp/phone numbers, college or organization names, degrees, departments, and years of study or professional designations.'
      },
      {
        label: 'Round 1 Blueprint & Presentation Uploads',
        text: 'During Round 1 submission, we collect the uploaded pitch deck file, file metadata (filename, byte size, slide/page count, and cryptographic SHA-256 / MD5 checksums), extracted presentation text used for judging indexing, and system-generated identifiers (Team ID, hashed Team Passcode, and Submission Receipt ID).'
      },
      {
        label: 'Round 2 Seat & Payment Confirmation (Shortlisted Finalists Only)',
        text: 'If a team advances to the 24-hour offline finale at SIET Coimbatore, we collect the 12-digit UPI UTR transaction reference number and uploaded payment confirmation screenshot solely to verify finalist arena eligibility.'
      },
      {
        label: 'Operational Security & Telemetry Metadata',
        text: 'Serverless API routes process transient request metadata (such as rate-limiting IP buckets and timestamped audit logs) to protect against automated abuse. The public website also uses Vercel Analytics and Vercel Speed Insights for aggregated, non-personalized performance telemetry.'
      }
    ]
  },
  {
    id: 'usage-oauth',
    icon: HardDrive,
    accent: '#0055FF',
    lightText: true,
    title: '2. Purpose of Processing & Google API Limited Use Disclosure',
    items: [
      {
        label: 'Event Operations & Evaluation',
        text: 'Participant data is used strictly to administer VELTRAXX 2.0 registrations, issue and verify Team IDs and private passcodes, send transactional registration, passcode-recovery, and shortlist notifications, organize Round 1 blueprints by official problem code for faculty/industry judging, and generate participation or winner certificates.'
      },
      {
        label: 'Google OAuth & Drive Storage Scope (Organizer-Side Only)',
        text: 'Participants do not log in with Google OAuth on this portal. Organizer Google OAuth credentials (Drive and Apps Script scopes) are used exclusively by the VELTRAXX 2.0 backend and organizer Google Apps Script webhook to save submitted pitch PDFs, archive superseded submission versions, synchronize the organizer operational registration sheet, and store Round 2 payment receipts inside private organizer-controlled Google Drive folders.'
      },
      {
        label: 'Google API Services User Data Policy Compliance',
        text: 'VELTRAXX 2.0 use of information accessed through Google Workspace / Drive APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Google Drive data and participant files are never sold, rented, used for advertising or profiling, or transferred to unrelated third parties.'
      }
    ]
  },
  {
    id: 'storage',
    icon: ShieldCheck,
    accent: '#B6FF00',
    title: '3. Storage Architecture & Infrastructure Providers',
    items: [
      {
        label: 'Supabase (PostgreSQL Database & Authentication)',
        text: 'Structured registration records, team passcodes (stored as salted cryptographic hashes), submission version histories, synchronization queue states, and coordinator audit logs are stored in Supabase PostgreSQL protected by Row-Level Security (RLS) policies and strict allowlisted coordinator access.'
      },
      {
        label: 'Google Drive & Google Workspace (Sheets / Apps Script)',
        text: 'Confirmed Round 1 pitch decks and archived prior versions are stored in private organizer Google Drive folders organized by problem statement code. Round 2 payment confirmation screenshots are isolated inside a separate private Finance Drive folder so financial verification images remain segregated from Round 1 judging materials.'
      },
      {
        label: 'Vercel (Hosting & Serverless Functions)',
        text: 'The web interface and serverless API routes are hosted on Vercel with HTTPS transport encryption, strict security headers (CSP, X-Frame-Options, nosniff), and environment-isolated secret management.'
      }
    ]
  },
  {
    id: 'privacy-controls',
    icon: Lock,
    accent: '#FF2E93',
    lightText: true,
    title: '4. Participant Privacy, Access Restrictions & Sharing',
    items: [
      {
        label: 'No Public Participant Directory',
        text: 'Participant phone numbers, email addresses, pitch decks, and payment receipts are never displayed publicly on the website. Public endpoints return only aggregate track/capacity counters and event window schedules.'
      },
      {
        label: 'Privacy-Preserving Credential Recovery',
        text: 'Team ID recovery requires matching both a registered email address and 10-digit phone number and returns only the Team ID and submission status without exposing other members contact information. Passcode rotation delivers a fresh passcode strictly to the registered Team Leader email address.'
      },
      {
        label: 'Authorized Institutional Access Only',
        text: 'Admin and submission inspection portals require verified coordinator authentication matched against the SIET VELTRAXX 2.0 allowlist. Uploaded files are restricted to SIET Department of EE (VLSI Design & Technology) faculty conveners, authorized student coordinators, and designated Round 1 / Round 2 judges.'
      }
    ]
  },
  {
    id: 'retention',
    icon: Clock,
    accent: '#FFE500',
    title: '5. Data Retention, Correction & Deletion Rights',
    items: [
      {
        label: 'Retention Period',
        text: 'Registration records, submitted pitch decks, and Round 2 payment verification records are retained through the completion of the VELTRAXX 2.0 24-hour finale (15-16 December 2026) and the post-event institutional certification, prize disbursement, and academic reporting period at SIET Coimbatore.'
      },
      {
        label: 'Deletion & Withdrawal Requests',
        text: 'Team leaders or participants may request access, factual correction, or permanent deletion of their squad registration record and uploaded Google Drive blueprint prior to evaluation or following completion of the event by emailing the organizers below from their registered email address.'
      }
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 flex flex-col w-full overflow-x-hidden bg-[#FAF8F5] text-[#111116]">
      <SeoHead route="/privacy-policy" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-10">
        {/* Top Back Navigation */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider px-4 py-2 bg-white border-2 border-[#111116] rounded-xl shadow-[3px_3px_0px_#111116] hover:bg-[#FFE500] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to VELTRAXX 2.0 Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="bg-white border-3 border-[#111116] rounded-3xl p-7 sm:p-10 shadow-[6px_6px_0px_#111116] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE500] border-2 border-[#111116] rounded-lg font-mono text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Data Protection & OAuth Compliance Policy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111116] leading-tight">
            VELTRAXX 2.0 Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#111116]/80 font-medium leading-relaxed max-w-3xl">
            This Privacy Policy explains how Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore - Department of Electrical and Electronics Engineering (VLSI Design & Technology) collects, processes, stores, and safeguards participant and submission data for the VELTRAXX 2.0 National-Level 24-Hour VLSI & Hardware Hackathon.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 font-mono text-xs font-bold text-[#111116]/80">
            <span className="px-3 py-1.5 bg-[#FAF8F5] border-2 border-[#111116]/30 rounded-lg">
              Effective Date: 25 November 2026
            </span>
            <span className="px-3 py-1.5 bg-[#FAF8F5] border-2 border-[#111116]/30 rounded-lg">
              Portal: https://veltrax-x-2-0-web.vercel.app
            </span>
          </div>
        </header>

        {/* Policy Sections */}
        <div className="space-y-8">
          {POLICY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="bg-white border-3 border-[#111116] rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#111116] space-y-5"
              >
                <div className="flex items-center gap-3.5 pb-4 border-b-2 border-[#111116]/10">
                  <div
                    className={`w-10 h-10 rounded-xl border-2 border-[#111116] flex items-center justify-center shrink-0 ${
                      section.lightText ? 'text-white' : 'text-[#111116]'
                    }`}
                    style={{ backgroundColor: section.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#111116]">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="bg-[#FAF8F5] border-2 border-[#111116]/15 rounded-2xl p-4 sm:p-5">
                      <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wide text-[#0055FF] mb-1.5">
                        {item.label}
                      </h3>
                      <p className="text-sm sm:text-[15px] text-[#111116]/85 font-medium leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact & Institutional Governance Box */}
        <section
          id="contact"
          className="bg-[#111116] text-white border-3 border-[#111116] rounded-3xl p-7 sm:p-9 shadow-[6px_6px_0px_#FFE500] space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE500] text-[#111116] border-2 border-white flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              6. Privacy Inquiries & Data Removal Contact
            </h2>
          </div>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed">
            For any questions regarding this Privacy Policy, Google Drive file custody, or requests to update or permanently remove your team data, contact the VELTRAXX 2.0 Organizing Committee:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs sm:text-sm">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-1">
              <div className="text-[#FFE500] font-black uppercase">Faculty Convener & Head of Department</div>
              <div className="font-bold text-white">Dr. P. Dhilipkumar</div>
              <div className="text-white/80">Email: dhilipkumarece@siet.ac.in</div>
              <div className="text-white/80">Phone: +91 96295 61731</div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 space-y-1">
              <div className="text-[#00E5FF] font-black uppercase">Student Lead Coordinator</div>
              <div className="font-bold text-white">R.A. Darshan</div>
              <div className="text-white/80">Email: darshanra24vl@srishakthi.ac.in</div>
              <div className="text-white/80">Phone: +91 97513 40838</div>
            </div>
          </div>

          <div className="pt-2 font-mono text-xs text-white/70 border-t border-white/15">
            Department of Electrical and Electronics Engineering (VLSI Design & Technology), Sri Shakthi Institute of Engineering and Technology, L&T Bypass Road, Chinniyampalayam Post, Coimbatore, Tamil Nadu 641062, India.
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
