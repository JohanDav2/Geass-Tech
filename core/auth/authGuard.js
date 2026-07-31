import { getSession } from "./session.js";

export async function requireAuth({ redirectTo = "./login.html" } = {}) {
  const session = await getSession();

  if (!session) {
    window.location.replace(redirectTo);
    return null;
  }

  return session;
}

export async function redirectIfAuthenticated({ redirectTo = "./dashboard.php" } = {}) {
  const session = await getSession();

  if (session) window.location.replace(redirectTo);
  return session;
}
