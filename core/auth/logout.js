import { supabase } from "../database/supabase.js";

export async function logout({ redirectTo = "./login.html" } = {}) {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  window.location.replace(redirectTo);
}
