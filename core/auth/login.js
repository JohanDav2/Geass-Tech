import { supabase } from "../database/supabase.js";

const GENERIC_ERROR = "No pudimos iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.";

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
  redirectTo = "./dashboard.html",
}) {
  if (!form || !emailInput || !passwordInput || !submitButton || !feedback) {
    throw new Error("No se encontraron todos los elementos del formulario de inicio de sesión.");
  }

  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = false;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.hidden = true;

    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    const buttonLabel = submitButton.textContent;
    submitButton.textContent = "Validando…";

    try {
      await signInWithPassword(emailInput.value, passwordInput.value);
      window.location.assign(redirectTo);
    } catch (error) {
      console.error("Error de autenticación:", error);
      showFeedback(error.message === "Ingresa tu correo y contraseña." ? error.message : GENERIC_ERROR);
      passwordInput.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.textContent = buttonLabel;
    }
  });
}
