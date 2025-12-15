import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase config
const isConfigValid = supabaseUrl && supabaseAnonKey && 
                      supabaseUrl.startsWith('http') && 
                      supabaseAnonKey.length > 0;

if (!isConfigValid) {
  console.error('❌ Supabase configuration is missing or invalid!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  console.error('Current values:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  });
}

// Initialize Supabase client with fallback values to prevent crashes
let supabase: SupabaseClient;

try {
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false, // We're not using auth, so no need to persist
      },
    }
  );

  // Log Supabase initialization
  if (isConfigValid) {
    console.log('🔷 Supabase initialized with URL:', supabaseUrl);
  } else {
    console.warn('⚠️ Supabase initialized with placeholder values - queries will fail until configured');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  // Create a dummy client to prevent crashes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
export default supabase;

