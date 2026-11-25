# VELTRAXX 2.0 - Production Integration & Deployment Readiness Report

**Status:** Pre-Cutover Engineering Complete (On Branch `hardening/production-reliability`)  
**Production Deployment:** **AWAITING APPROVAL CHECKPOINT** (Blocked until organizer adds required Vercel server environment variables, reconnects Vercel MCP if automated deployment is desired, and approves phased `010` -> Vercel -> `011` cutover)  
**Working Branch:** `hardening/production-reliability` | **Production Branch (`main`):** `76403c4` (untouched; Privacy Policy live)

---

## 1. Live Infrastructure & Environment Configuration Audit

| Layer | Current Production Reality | Evidence / Root Cause | Status |
| :--- | :--- | :--- | :--- |
| **Frontend -> Supabase Link** | `src/lib/supabaseClient.js` & `src/lib/api.js` hardcode fallback URL `https://krkiwilhwppqauyhwlcw.supabase.co` and publishable key `sb_publishable_mxOTG_ykJt2RHXdJ7HOhZw_9i9s8SFu` | Explains why Vercel `filter_project_envs` returned `envs: []` while `/register` still creates teams in `krkiwilhwppqauyhwlcw` | **EXISTING (Client Hardcoded + `.env.local` git-ignored)** |
| **Vercel Environment (`prj_8CfWuD9e08bcgMpJPvM6HOcTx5k3`)** | Zero server/runtime env vars configured (`envs: []`, `hiddenProductionEnvCount: 0`); Vercel MCP transport token expired (`Unauthorized: rejected by transport`) | Required for serverless `/api/*` routes (`register.js`, `ppt/initiate.js`, `ppt/upload.js`, `round2/upload-receipt.js`, `admin/action.js`) | **MISSING ALL SERVER VARS** |
| **Supabase Project (`Veltraxx_2.0` / `krkiwilhwppqauyhwlcw`)** | `6` active teams (`VTX2-022`..`VTX2-027`), `18` members, `0` reports, `event_state` (`1`), `vtx2_team_seq` `last_value = 27`, single `auth.users` account `admin@veltraxx.com` | Pre-`010` snapshot saved locally to git-ignored `backups/krkiwilhwppqauyhwlcw_pre010_snapshot_2026-11-25.json` (`50,550` B); `VLSI Hackathon` (`incokdlzjmcbvcisgaal`) untouched | **READ-ONLY VERIFIED & SNAPSHOTTED** |
| **Google OAuth / Drive / Apps Script** | Saved locally in git-ignored `.env.staging.local`; live Drive OAuth, PDF upload/download/archive/delete, and GAS webhook auth/Sheets connectivity tests previously passed | Dedicated OAuth app is **In production** (`drive` scope, `radarshan15@gmail.com`); existing judging & finance folder IDs preserved | **EXISTING (Ready to copy to Vercel)** |

---

## 2. Production Vercel Environment Variable Inventory

Configure these in Vercel Project Settings -> Environment Variables (`Production` & `Preview` as appropriate; **do not commit values to Git**):

| Variable | Classification | Status in `.env.staging.local` / Repo | Action Needed on Vercel |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Public URL (`https://krkiwilhwppqauyhwlcw.supabase.co`) | `.env.local` has `VITE_SUPABASE_URL`; `.env.staging.local` has placeholder | Add `SUPABASE_URL` + `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | Public publishable key (`sb_publishable_...`) | `.env.local` has `VITE_SUPABASE_ANON_KEY` | Add both in Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (`service_role` JWT or `sb_secret_...`) | **MISSING EVERYWHERE** | Copy from Supabase Dashboard -> Project Settings -> API Keys |
| `GOOGLE_CLIENT_ID` | Server OAuth client ID | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `GOOGLE_CLIENT_SECRET` | Server OAuth secret | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `GOOGLE_REFRESH_TOKEN` | Server OAuth refresh token | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | `1wMmWqQu4eD949gSpSGy0D1rICalzCS10` | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `GOOGLE_DRIVE_RECEIPTS_FOLDER_ID` | `1kc4FvvvZNwyWYmp2Bfiknob4zAB06lnY` | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `GAS_WEBHOOK_URL` / `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | Apps Script Web App URL (`AKfycbyYwNO...`) | **EXISTING** in `.env.staging.local` / `.env.local` | Add both (`GAS_WEBHOOK_URL` server + `VITE_*` client if used) |
| `GAS_SHARED_SECRET` | Webhook HMAC/token secret | **EXISTING** in `.env.staging.local` | Copy to Vercel Production |
| `CRON_SECRET` | Cron endpoint bearer secret | **EXISTING** in `.env.staging.local` | Copy to Vercel Production (and GitHub Actions secret if `.github/workflows/sync-drain.yml` is enabled) |

---

## 3. Defects Identified & Fixed on `hardening/production-reliability`

1. **Coordinator Auth Lockout Risk (`admin@veltraxx.com`):**
   - **Finding:** Live `auth.users` uses `admin@veltraxx.com`, which was absent from `AUTHORIZED_COORDINATOR_EMAILS` (`src/lib/supabaseClient.js`) and `coordinator_allowlist` (`backend_sql/010_production_hardening_v2.sql`).
   - **Fix:** Added `'admin@veltraxx.com'` to both allowlists.
2. **Admin Refresh Button Not Updating + Silent Auth Errors (`TrackerPage.jsx` & `api.js`):**
   - **Finding:** Supabase logs showed `401` on `/rest/v1/rpc/get_coordinator_roster`; `TrackerPage.jsx` held a static `sessionStorage` token without `onAuthStateChange` renewal, `api.js` omitted `cache: 'no-store'` and failed token refresh before calls, and `loadRoster` swallowed errors so `handleManualRefresh` still displayed `'✓ Live Roster synced'`.
   - **Fix:** Added `getFreshCoordinatorToken()`, `supabase.auth.onAuthStateChange`, `cache: 'no-store'` + `body: '{}'`, `loadRequestIdRef` stale-response guard, `selectedTeam` state sync on refresh, explicit error toasts instead of false success, and `supabase.auth.signOut()` on logout.
3. **Admin Waitlist HTTP 400 Constraint Violation:**
   - **Finding:** Supabase logs captured `400` on `/rest/v1/rpc/admin_update_team_status` (`12:57:43Z`) because `TrackerPage.jsx` sent `'waitlist'`, violating the Postgres `CHECK (round1_status IN ('pending','shortlisted','waitlisted','rejected'))` constraint.
   - **Fix:** Updated all 3 decision buttons in `TrackerPage.jsx` to `'waitlisted'` and normalized `'waitlist'` -> `'waitlisted'` in `adminUpdateTeamStatus` (`src/lib/api.js`).
4. **Zero-Downtime Migration Compatibility (`010` vs `011`):**
   - **Finding:** `010_production_hardening_v2.sql` previously dropped `lookup_*` functions and revoked `register_free_team` / `submit_round1_ppt`, which would break live `main` traffic between DB migration and Vercel deployment.
   - **Fix:** Moved destructive `DROP`/`REVOKE` statements out of `010_production_hardening_v2.sql` into `backend_sql/011_revoke_legacy_rpcs.sql` (Phase B, run strictly **after** Vercel cutover).
5. **Documented Scope Limitation (Unchanged By Design):**
   - Tab 3 Attendance Matrix (`attendanceData` in `src/pages/TrackerPage.jsx` line 239) is session-local React state (`useState({})`) rather than DB-persisted.

---

## 4. Verification Results (Post-Final Code Edit)

- `npm run build` (`vite build && node scripts/prerender.js`): **PASSED** (`4.85s`, `7` static routes + `robots.txt` + `sitemap.xml`).
- `npm run test:seo` (`node scripts/verify-seo.js`): **239 Passed, 0 Failed**.
- `node --test tests/hardening.test.mjs`: **14 Passed, 0 Failed** (covers mocked 50/100/200 bursts, `pdf-lib` `/ObjStm` validation, DB semaphore logic, grace-period anti-abuse, Drive hierarchy/archiving logic, GAS sync drain/rollback, `admin@veltraxx.com` allowlist, phased `010`/`011`/rollback SQL checks, `'waitlist'` -> `'waitlisted'` normalization, `401` roster error surfacing with `no-store` headers, concurrent registrations x10, invalid credentials, `FORCE_CLOSED`/`FORCE_OPEN` deadline overrides, duplicate in-flight upload lock, admin `Delete Permanently` auth/confirmation/Drive cleanup/count update, and Preview read-only write shield).
- **Local Headless Edge Browser UI E2E (mocked `/auth/v1/*`, `/rest/v1/rpc/*`, `/api/*` against built `dist/`):** Verified `/privacy-policy`, `/admin` invalid-login rejection, `/admin` valid login -> Refresh button pulling newly added team `VTX2-902`, `Waitlist` button sending `p_status: 'waitlisted'`, `Delete Permanently` confirmation modal -> `/api/admin/action` `op: 'delete_team'` -> immediate count update (`ROUND 1 EVALUATION (1)`), `/admin` `401` refresh displaying error instead of false success, `/register` + `/submit-ppt` rendering, and `0` page errors.
- **Live External Tests:** Live Google Drive OAuth, PDF upload/download/archive/delete, and Apps Script webhook/Sheets tests passed in an earlier session with `.env.staging.local` and were not repeated. Production Supabase (`krkiwilhwppqauyhwlcw`) and Vercel production remain untouched.

---

## 5. Safe Production Cutover Sequence & Rollback (`< 2 min`)

1. **Pre-Cutover Env Setup:** Add all missing Vercel Production environment variables (especially `SUPABASE_SERVICE_ROLE_KEY`, plus the existing `.env.staging.local` Google/GAS/Cron values) and verify fresh pre-`010` snapshot (`backups/krkiwilhwppqauyhwlcw_pre010_snapshot_2026-11-25.json`).
2. **Phase A DB Migration (Backward-Compatible):** Run `backend_sql/010_production_hardening_v2.sql` on `krkiwilhwppqauyhwlcw` (existing `main` frontend keeps working cleanly).
3. **Frontend + Serverless Deployment:** Merge `hardening/production-reliability` into `main` -> Vercel builds and deploys `/api/register`, `/api/ppt/*`, `/api/round2/*`, `/api/team/recover`, `/api/admin/action`, and updated React UI (`TrackerPage.jsx`, `api.js`, `supabaseClient.js`).
4. **Live Smoke Verification:** Confirm existing teams `VTX2-022`..`VTX2-027` appear in `/admin`, Refresh button updates live, test synthetic team registration + PDF upload + clean up test artifact.
5. **Phase B DB Lockdown:** Once smoke tests pass, run `backend_sql/011_revoke_legacy_rpcs.sql` to revoke legacy public `register_free_team` / `submit_round1_ppt` and drop legacy `lookup_*` functions.
6. **Emergency Rollback (`< 2 min`):** Promote prior `main` Vercel deployment (`76403c4` / `dpl_VCkCZkoDqAGUAK37DwJ98KVZBruh`) AND run `backend_sql/010_rollback.sql` (`GRANT EXECUTE` back on `register_free_team` & `submit_round1_ppt`), keeping all participant rows and Drive files intact.
