# VELTRAXX 2.0 - Emergency Recovery & Operational Runbook

## 1. Purpose
This runbook defines exact organizer procedures if Vercel, Supabase, Google Drive OAuth, or Google Apps Script experiences downtime or quota limits during registration (`Nov - Dec 7`) or PPT submission (through `Dec 8, 23:59:59 IST`).

---

## 2. Scenario Playbook

### Scenario A: Website / Vercel Deployment Failure or Broken Release
1. **Immediate Rollback (Under 60 seconds):**
   - Open Vercel Dashboard (`veltrax-x-2-0-web`) -> **Deployments**.
   - Locate the last known healthy deployment (`dpl_...`), click **...** -> **Promote to Production**.
2. **Database Migration Rollback (if SQL 010 caused incompatibility):**
   - Execute `backend_sql/010_rollback.sql` in Supabase SQL Editor. (Does NOT drop `teams`, `members`, or `ppt_submissions` data.)

### Scenario B: Google Drive OAuth Token Expiry / Storage Upload Error (`502` / `503`)
1. Check Vercel Runtime Logs for `OAUTH_REFRESH_FAILED` or `403/429`.
2. Verify Google Cloud Console -> **OAuth consent screen** status is **"In Production"** (never "Testing", which expires refresh tokens after 7 days).
3. If token was revoked: generate a fresh refresh token via OAuth Playground / local setup script for the organizer's 5 TB Google Account, update `GOOGLE_REFRESH_TOKEN` in Vercel Environment Variables, and redeploy.
4. If the outage happens near the Dec 8 deadline:
   - Open `/admin` -> **Submissions & Window Ops**.
   - Set **PPT Submission Window Override** to `FORCE_OPEN` temporarily while recovering, then revert to `AUTO` or `FORCE_CLOSED` once restored.

### Scenario C: Google Apps Script / Email Quota Exhaustion (`MailApp` Limit Reached)
- **Important:** Primary registration (`teams` + `members`) and PPT submissions (`ppt_submissions` + Drive PDFs) **continue working normally** even when Google Apps Script fails or hits daily email limits!
- Participants still receive their **Team ID + Team Passcode** directly on `/register` and **Receipt ID** directly on `/submit-ppt`.
- After the quota resets (24h window):
  1. Open `/admin` -> **Submissions & Window Ops** -> **Google Sheet & Email Sync Reconciliation Queue**.
  2. Click **Retry Sync** on any `FAILED` or `PENDING` rows to sync missing Google Sheet entries without recreating duplicate Drive folders or duplicate rows.

### Scenario D: Prolonged Platform Outage -> Organizer-Approved Emergency Fallback Submission Procedure
If the website or Google Drive API is completely unavailable during the final hours before `08 Dec 2026, 23:59:59 IST`:

1. **Activate Emergency Intake Window:**
   - Organizers switch `/admin` -> PPT Override to `FORCE_CLOSED` (if partial outage) and publish an official notice on the registered WhatsApp group directing teams to a **Google Form backed by the organizer's 5 TB Google Drive** ("Require SIET/External Email? No -> Collect Team ID, Team Leader Email, PDF upload capped at 10 MB / max 8 slides").
   - *Why Google Form instead of raw email inbox?* Google Forms automatically stamps exact server submission time (`Timestamp`), stores uploaded PDFs directly in a single dedicated Drive folder (`Emergency_Fallback_PDFs`) prefixed with respondent details, and exports cleanly to a structured Google Sheet.
2. **Mandatory Form Fields (Preserves Identity & Reconciliation):**
   - `Team ID` (e.g. `VTX2-048`)
   - `Team Leader Registered Email`
   - `Team Leader Phone (10 digits)`
   - `PDF File Upload` (`.pdf`, max 3 MB / max 8 slides)
3. **Post-Outage Reconciliation (Automated Verification):**
   - Cross-check each Form row's `(Team ID, Leader Email, Leader Phone)` against Supabase `teams` & `members`.
   - Confirm Form timestamp `<= 08 Dec 2026 23:59:59 IST` (plus any organizer-announced extension).
   - Move verified PDFs into each team's canonical Drive folder and insert confirmed rows via `initiate_ppt_submission` + `finalize_ppt_submission_v2` (or admin script) so every emergency team receives an official `ppt_receipt_id` and appears inside `/admin` alongside normal submissions.

---

## 3. Supabase Free-Tier Inactivity Protection
- Supabase Free Tier pauses projects after **7 consecutive days of zero traffic**.
- Verify `/tracker` or homepage hits `getLiveEventState` / `get_public_capacity` at least once every few days during event lead-up. Monitor DB size (`< 500 MB`) and monthly egress (`< 5 GB`) in Supabase -> **Project Settings -> Usage**.
