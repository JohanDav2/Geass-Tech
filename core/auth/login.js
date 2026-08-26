import { supabase } from "../database/supabase.js";

const GENERIC_ERROR = "No pudimos iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.";

/**
 * Sanitiza el nombre de empresa para usarlo como segmento de URL/carpeta.
 * Elimina tildes y reemplaza caracteres especiales por guiones bajos.
 */
function sanitizeFolderName(name) {
  return (name ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")    // quita tildes
    .replace(/[^a-zA-Z0-9\-]/g, "_")   // caracteres especiales → _
    .replace(/_+/g, "_")                // múltiples _ consecutivos → uno
    .replace(/^_|_$/g, "");             // quita _ al inicio y final
}

/**
 * Resuelve la URL de destino según el rol y empresa del usuario.
 * - Superadministrador, Administrador empresa, Editor empresa → dashboard.html
 * - Usuario (u otro) → empresas/{nombre_empresa}/index.html
 * - Si es Usuario pero no tiene empresa asignada → dashboard.html (fallback)
 */
function resolveRedirect(rol, empresa) {
  const rolNorm = (rol ?? "").toLowerCase().trim();

  const isAdmin =
    rolNorm === "superadministrador" ||
    rolNorm === "administrador empresa" ||
    rolNorm === "editor empresa";

  if (isAdmin) {
    return "./dashboard.html";
  }

  if (empresa) {
    const folder = sanitizeFolderName(empresa);
    return `./empresas/${folder}/index.html`;
  }

  // Fallback: sin empresa asignada
  return "./dashboard.html";
}

export async function signInWithPassword(email, password) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    throw new Error("Ingresa tu correo y contraseña.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) throw error;
  return data;
}

export function bindLoginForm({
  form,
  emailInput,
  passwordInput,
  submitButton,
  feedback,
  redirectTo, // ignorado: la redirección ahora es dinámica según el rol
}) {
  if (!form || !emailInput || !passwordInput || !submitButton || !feedback) {
    throw new Error("No se encontraron todos los elementos del formulario de inicio de sesión.");
  }

  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = false;
  };

  // Restaura el label original del botón (soporte para botón con <span> interno)
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
      const email = emailInput.value.trim();

      // 1. Autenticar con Supabase Auth (email + password)
      await signInWithPassword(email, passwordInput.value);

      // 2. Consultar la tabla "usuarios" para obtener rol y empresa
      let rol = null;
      let empresa = null;

      try {
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .select("rol, empresa")
          .ilike("email", email)
          .limit(1)
          .maybeSingle();

        if (!usuarioError && usuarioData) {
          rol = usuarioData.rol;
          empresa = usuarioData.empresa;
        }
      } catch (lookupErr) {
        console.warn(
          "No se pudo consultar la tabla usuarios, se usará rol por defecto:",
          lookupErr
        );
      }

      // 3. Decidir la URL de destino y redirigir
      const destination = resolveRedirect(rol, empresa);
      window.location.assign(destination);

    } catch (error) {
      console.error("Error de autenticación:", error);
      showFeedback(
        error.message === "Ingresa tu correo y contraseña."
          ? error.message
          : GENERIC_ERROR
      );
      passwordInput.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      setButtonLabel(originalLabel);
    }
  });
}
