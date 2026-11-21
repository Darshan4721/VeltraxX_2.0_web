import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://krkiwilhwppqauyhwlcw.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_mxOTG_ykJt2RHXdJ7HOhZw_9i9s8SFu';

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

