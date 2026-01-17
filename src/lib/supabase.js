import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)