import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://krkiwilhwppqauyhwlcw.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_mxOTG_ykJt2RHXdJ7HOhZw_9i9s8SFu';

export const PRODUCTION_SUPABASE_REF = 'krkiwilhwppqauyhwlcw';
export const PRODUCTION_VERCEL_HOSTS = ['veltrax-x-2-0-web.vercel.app'];
export const IS_PRODUCTION_SUPABASE = supabaseUrl.includes(PRODUCTION_SUPABASE_REF);

export function isPreviewDeployment() {
  const vercelEnv = typeof __VERCEL_ENV__ !== 'undefined' ? String(__VERCEL_ENV__) : '';
  if (vercelEnv === 'preview') return true;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    if (host.endsWith('.vercel.app') && !PRODUCTION_VERCEL_HOSTS.includes(host)) {
      return true;
    }
  }
  return false;
}

export function isPreviewWriteBlocked() {
  return isPreviewDeployment() && IS_PRODUCTION_SUPABASE;
}

export function getPreviewProtectionError(actionLabel = 'Data modification') {
  return `PREVIEW_READ_ONLY: ${actionLabel} is disabled on Preview deployments connected to Production Supabase.`;
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const AUTHORIZED_COORDINATOR_EMAILS = [
  'admin@veltraxx.com',
  'dhilipkumarece@siet.ac.in',
  'trenitacdc@siet.ac.in',
  'premacece@siet.ac.in',
  'priscillasobhiaece@siet.ac.in',
  'vasanthiece@siet.ac.in',
  'darshanra24vl@srishakthi.ac.in',
  'subikshal24vl@srishakthi.ac.in',
  'darshan4721@gmail.com',
  'vlsireseachlab@siet.ac.in'
];

