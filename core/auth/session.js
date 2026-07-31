import { supabase } from "../database/supabase.js";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  return data.user;
}

export function onSessionChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}
