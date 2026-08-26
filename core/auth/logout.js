import { signOutCustom } from "./login.js";

/**
 * Cierra la sesión del usuario (borra el sessionStorage) y redirige al login.
 */
export async function logout({ redirectTo = "./login.html" } = {}) {
  signOutCustom({ redirectTo });
}
