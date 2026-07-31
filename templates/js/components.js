import { logout } from "../../core/auth/logout.js";

export async function loadComponent(id, file) {
  const target = document.getElementById(id);

  if (!target) throw new Error(`No existe el contenedor del componente: #${id}`);

  const response = await fetch(file);
  if (!response.ok) throw new Error(`No se pudo cargar el componente: ${file}`);

  target.innerHTML = await response.text();
  target.dispatchEvent(new CustomEvent("component:loaded", { bubbles: true }));
  return target;
}

export function initializeNavbar(container) {
  const profile = container.querySelector(".profile");
  const trigger = profile?.querySelector(".profile-button");
  const logoutLink = container.querySelector(".logout");

  logoutLink?.addEventListener("click", async (event) => {
    event.preventDefault();
    logoutLink.setAttribute("aria-busy", "true");

    try {
      await logout();
    } catch (error) {
      console.error("No fue posible cerrar la sesión:", error);
      logoutLink.removeAttribute("aria-busy");
      window.alert("No fue posible cerrar la sesión. Inténtalo de nuevo.");
    }
  });

  if (!profile || !trigger) return;

  const closeMenu = () => {
    profile.dataset.open = "false";
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = profile.dataset.open === "true";
    profile.dataset.open = String(!isOpen);
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!profile.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
