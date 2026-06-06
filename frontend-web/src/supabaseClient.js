import { createClient } from '@supabase/supabase-js';

// Kendi Supabase URL ve anon key'inizi buraya girin veya projenizin kök dizinindeki .env dosyasından çekin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
