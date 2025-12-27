import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabase.url;
const supabaseServiceKey = config.supabase.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL or Service Role Key is missing!');
  console.error('   Please check your .env file in the backend directory.');
  console.error('   Required variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// Create Supabase client with service role key (for backend/admin operations)
// Note: Service role key bypasses RLS, use with caution
// SSL certificate verification is handled via NODE_TLS_REJECT_UNAUTHORIZED environment variable
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase client initialized successfully');

