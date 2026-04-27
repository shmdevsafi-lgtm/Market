import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "⚠️  Supabase server credentials are not set. Database operations will fail."
  );
}

// Server-side client with service role (admin privileges)
// Use this for operations that require elevated permissions (user management, etc)
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceRoleKey || "placeholder-key"
);

// Client-side compatible server client (for read-only operations)
export const supabaseServer = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key"
);
