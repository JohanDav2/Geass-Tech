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
 * En la página de login: si ya hay sesión activa, redirige al destino correcto según su ROL.
 * Previene que un usuario con rol 'Usuario' sea enviado a dashboard.html por error.
 */
export async function redirectIfAuthenticated() {
  const session = getCustomSession();

  if (session) {
    const rolNorm = (session.rol ?? "").toLowerCase().trim();
    const isAdmin =
      rolNorm === "superadministrador" ||
      rolNorm === "administrador empresa" ||
      rolNorm === "editor empresa";

    let destination = "./dashboard.html";
    if (!isAdmin && session.empresa && session.empresa.trim()) {
      const folder = encodeURIComponent(session.empresa.trim().toLowerCase());
      destination = `./empresas/${folder}/index.html`;
    }

    window.location.replace(destination);
  }

  return session;
}
