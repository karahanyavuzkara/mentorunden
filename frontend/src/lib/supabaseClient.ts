import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration error:');
  console.error('URL:', supabaseUrl || 'MISSING');
  console.error('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
  console.error('Please check your .env.local file and restart the dev server.');
}

// Debug in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔑 Supabase client initialized:');
  console.log('URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
  console.log('Key:', supabaseAnonKey ? `✓ Configured (${supabaseAnonKey.substring(0, 20)}...)` : '✗ Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

