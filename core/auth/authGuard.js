import { getCustomSession } from "./login.js";

/**
 * Protege una página: redirige al login si no hay sesión activa.
 * Úsalo en dashboard.html, ajustes.html, empresas.html, etc.
 */
export async function requireAuth({ redirectTo = "./login.html" } = {}) {
  const session = getCustomSession();

  if (!session) {
    window.location.replace(redirectTo);
    return null;
  }

  return session;
}

/**
 * En la página de login: si ya hay sesión, redirige al destino.
 * Úsalo en login.html para evitar que un usuario logueado vea el login.
 */
export async function redirectIfAuthenticated({ redirectTo = "./dashboard.html" } = {}) {
  const session = getCustomSession();

  if (session) {
    window.location.replace(redirectTo);
  }

  return session;
}
