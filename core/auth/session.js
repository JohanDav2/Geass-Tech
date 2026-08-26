import { getCustomSession } from "./login.js";

/**
 * Obtiene la sesión del usuario actualmente logueado (desde sessionStorage).
 * Retorna null si no hay sesión activa.
 */
export function getSession() {
  return getCustomSession();
}

/**
 * Obtiene los datos del usuario activo (alias de getSession).
 */
export function getCurrentUser() {
  return getCustomSession();
}

/**
 * Escucha cambios de sesión — no aplica con sessionStorage,
 * se mantiene por compatibilidad. No llama ningún callback automáticamente.
 */
export function onSessionChange(_callback) {
  // No implementado: la sesión es estática en sessionStorage.
}
