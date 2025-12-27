import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// Debug: Log config values (without exposing secrets)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Config loaded:');
  console.log('  Supabase URL:', config.supabase.url ? '✓ Set' : '✗ Missing');
  console.log('  Service Role Key:', config.supabase.serviceRoleKey ? '✓ Set' : '✗ Missing');
}

