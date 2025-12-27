export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

