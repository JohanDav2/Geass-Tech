import { getCustomSession, signOutCustom } from "./login.js";

/**
 * Protege una página: redirige al login si no hay sesión activa
 * o si el rol del usuario no está dentro de allowedRoles.
 * 
 * Ejemplo: requireAuth({ allowedRoles: ["Superadministrador"] })
 */
export async function requireAuth({ allowedRoles = null, redirectTo = "./login.html" } = {}) {
  const session = getCustomSession();

  if (!session) {
    window.location.replace(redirectTo);
    return null;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = (session.rol || "").trim().toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.trim().toLowerCase() === userRole);

    if (!isAllowed) {
      console.warn(`Acceso denegado. Rol "${session.rol}" no autorizado para esta vista.`);
      signOutCustom({ redirectTo });
      return null;
    }
  }

  return session;
}

/**
 * En la página de login: si ya hay sesión, redirige al destino correspondiente.
 */
export async function redirectIfAuthenticated({ redirectTo = "./dashboard.html" } = {}) {
  const session = getCustomSession();

  if (session) {
    window.location.replace(redirectTo);
  }

  return session;
}
