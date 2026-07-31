import { getSession } from "./session.js";

export async function requireAuth({ redirectTo = "./login.html" } = {}) {
  const session = await getSession();

  if (!session) {
    window.location.replace(redirectTo);
    return null;
  }

  return session;
}

export async function redirectIfAuthenticated({ redirectTo = "./dashboard.html" } = {}) {
  const session = await getSession();

  if (session) window.location.replace(redirectTo);
  return session;
}
