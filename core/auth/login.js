import { supabase } from "../database/supabase.js";

const SESSION_KEY = "gt_session";

/**
 * Sanitiza el nombre de empresa para usarlo como segmento de URL/carpeta.
 */
function sanitizeFolderName(name) {
  return (name ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Resuelve la URL de destino según el rol y empresa del usuario.
 */
function resolveRedirect(rol, empresa) {
  const rolNorm = (rol ?? "").toLowerCase().trim();

  const isAdmin =
    rolNorm === "superadministrador" ||
    rolNorm === "administrador empresa" ||
    rolNorm === "editor empresa";

  if (isAdmin) return "./dashboard.html";

  if (empresa) {
    const folder = sanitizeFolderName(empresa);
    return `./empresas/${folder}/index.html`;
  }

  return "./dashboard.html";
}

/**
 * Autentica al usuario contra la tabla `usuarios` usando email y pass.
 * Guarda la sesión en sessionStorage.
 */
export async function signInWithUsuariosTable(email, pass) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !pass) {
    throw new Error("Ingresa tu correo y contraseña.");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombres, apellidos, email, rol, empresa, estado")
    .ilike("email", normalizedEmail)
    .eq("pass", pass)
    .maybeSingle();

  if (error) {
    console.error("Error al consultar tabla usuarios:", error);
    throw new Error("Error al verificar credenciales. Intenta de nuevo.");
  }

  if (!data) {
    throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.");
  }

  if (data.estado === "Inactivo") {
    throw new Error("Tu cuenta está inactiva. Contacta al administrador.");
  }

  // Guardar sesión en sessionStorage
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    id: data.id,
    nombres: data.nombres,
    apellidos: data.apellidos,
    email: data.email,
    rol: data.rol,
    empresa: data.empresa,
    loginAt: new Date().toISOString()
  }));

  return data;
}

/**
 * Obtiene la sesión activa del usuario (desde sessionStorage).
 */
export function getCustomSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión borrando el sessionStorage y redirigiendo al login.
 */
export function signOutCustom({ redirectTo = "./login.html" } = {}) {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.replace(redirectTo);
}

export function bindLoginForm({
  form,
  emailInput,
  passwordInput,
  submitButton,
  feedback,
}) {
  if (!form || !emailInput || !passwordInput || !submitButton || !feedback) {
    throw new Error("Faltan elementos del formulario de inicio de sesión.");
  }

  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = false;
  };

  const getButtonLabel = () =>
    submitButton.querySelector("span")?.textContent?.trim() ||
    submitButton.textContent.trim();

  const setButtonLabel = (label) => {
    const span = submitButton.querySelector("span");
    if (span) span.textContent = label;
    else submitButton.textContent = label;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.hidden = true;

    if (!form.reportValidity()) return;

    const originalLabel = getButtonLabel();
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    setButtonLabel("Validando…");

    try {
      const usuario = await signInWithUsuariosTable(
        emailInput.value,
        passwordInput.value
      );

      const destination = resolveRedirect(usuario.rol, usuario.empresa);
      window.location.assign(destination);

    } catch (error) {
      console.error("Error de autenticación:", error);
      showFeedback(error.message || "No pudimos iniciar sesión. Intenta de nuevo.");
      passwordInput.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      setButtonLabel(originalLabel);
    }
  });
}
