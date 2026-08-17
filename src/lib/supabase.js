import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
    'Get these from your Supabase project dashboard: Project Settings > API. ' +
    'Use the "Project URL" (https://<project-ref>.supabase.co) and the "anon public" key — ' +
    'NOT the database password, and NOT the service_role key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'desk-diary-web'
    }
  }
})

console.log('Supabase client initialized with URL:', supabaseUrl)