import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client with service role key.
 * NEVER expose this on the client side — it bypasses Row Level Security.
 * Only import this in server-side code (API routes, server actions, etc.)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
