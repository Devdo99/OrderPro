// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zjbikausypntvedpumgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmlrYXVzeXBudHZlZHB1bWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzg4MjUsImV4cCI6MjA2NjM1NDgyNX0.MT-Jx1gdj33LvjGQg-g1NuCKKJTdSVK2ccLoplzWiQQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);