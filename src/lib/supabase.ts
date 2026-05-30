import { createClient } from '@supabase/supabase-js';

const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '';

const supabaseUrl = (urlEnv && urlEnv !== 'undefined' && urlEnv !== 'null') 
  ? urlEnv 
  : 'https://placeholder-project-for-build.supabase.co';

const supabaseAnonKey = (keyEnv && keyEnv !== 'undefined' && keyEnv !== 'null') 
  ? keyEnv 
  : 'placeholder-key-for-build';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
