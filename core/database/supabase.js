import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://vnexbahtogoljyruiepy.supabase.co";
const supabaseKey = "sb_publishable_AqQUMaimUyZgbrM64C05Cw_zzrlatYk";

export const supabase = createClient(supabaseUrl, supabaseKey);
