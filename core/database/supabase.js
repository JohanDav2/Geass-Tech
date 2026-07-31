import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { supabaseConfig } from "./supabase.config.js";

const { url: supabaseUrl, publishableKey: supabaseKey } = supabaseConfig;

export const supabase = createClient(supabaseUrl, supabaseKey);
