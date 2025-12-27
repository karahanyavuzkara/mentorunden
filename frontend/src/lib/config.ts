export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
} as const;

