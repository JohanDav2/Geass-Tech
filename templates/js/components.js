import { logout } from "../../core/auth/logout.js";
import { getCustomSession } from "../../core/auth/login.js";
import { supabase } from "../../core/database/supabase.js";

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
  const settingsLink = container.querySelector(".app-nav-footer .nav-link");

  const path = window.location.pathname.toLowerCase();
  const isCompanySubfolder = path.includes("/empresas/");

  // Redirigir el logo de los 4 cuadritos y el botón Inicio a index.html en subcarpetas de empresa
  if (isCompanySubfolder) {
    const appLogo = container.querySelector(".app-logo");
    if (appLogo) appLogo.href = "./index.html";

    const inicioLink = container.querySelector(".nav-link-inicio") || container.querySelector(".app-nav .nav-link");
    if (inicioLink) inicioLink.href = "./index.html";
  }

  // 1. Cargar nombre, cargo e imagen/inicial del usuario en la Nav
  const session = getCustomSession();
  if (session) {
    const strongName = profile?.querySelector(".profile-meta strong");
    const smallCargo = profile?.querySelector(".profile-meta small");
    const avatar = profile?.querySelector(".avatar");

    const fullName = [session.nombres, session.apellidos].filter(Boolean).join(" ");
    const initial = (session.nombres?.[0] || "U").toUpperCase();

    if (strongName) strongName.textContent = fullName || "Usuario";
    if (smallCargo) smallCargo.textContent = session.cargo || session.rol || "Colaborador";

    const renderAvatarImg = (avatarUrl, fallbackText) => {
      if (!avatar) return;
      if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()) {
        avatar.innerHTML = `<img src="${escapeHtml(avatarUrl.trim())}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;" onerror="this.onerror=null; this.outerHTML='${escapeHtml(fallbackText)}';">`;
      } else {
        avatar.textContent = fallbackText;
      }
    };

    renderAvatarImg(session.avatar_url, initial);

    // Consultar detalles adicionales (avatar_url y cargo) desde Supabase
    loadUserExtraDetails(session, smallCargo, (url) => renderAvatarImg(url, initial));

    // 2. Si es portal exclusivo de empresa (en subcarpeta o rol Usuario), quitar opción "Empresas" del Nav
    if (isCompanySubfolder || session.rol === "Usuario") {
      const empresasLink = container.querySelector(".nav-link-empresas");
      if (empresasLink) empresasLink.style.display = "none";
    }

    // 3. Aplicar color_primario de la empresa a la barra de navegación (sin modificar el logo de Geass Tech)
    if (session.empresa) {
      applyCompanyTheme(container, session.empresa);
    }
  }

  // Resaltado de enlaces activos según ruta
  if (path.includes("empresas.html")) {
    container.querySelectorAll(".nav-link.is-active").forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const empresasLink = container.querySelector(".nav-link-empresas");
    empresasLink?.classList.add("is-active");
    empresasLink?.setAttribute("aria-current", "page");
  } else if (path.includes("ajustes")) {
    container.querySelectorAll(".nav-link.is-active").forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    settingsLink?.classList.add("is-active");
    settingsLink?.setAttribute("aria-current", "page");
  }

  logoutLink?.addEventListener("click", async (event) => {
    event.preventDefault();
    logoutLink.setAttribute("aria-busy", "true");

    try {
      await logout({ redirectTo: isCompanySubfolder ? "../../login.html" : "./login.html" });
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

/**
 * Consulta el usuario en Supabase y obtiene su avatar_url y cargo resuelto para mostrar en la Nav.
 */
async function loadUserExtraDetails(session, smallCargoElement, updateAvatarCallback) {
  try {
    let uData = null;

    if (session.id) {
      const { data } = await supabase
        .from("usuarios")
        .select("cargo, rol, avatar_url")
        .eq("id", session.id)
        .maybeSingle();
      uData = data;
    }

    if (!uData && session.email) {
      const { data } = await supabase
        .from("usuarios")
        .select("cargo, rol, avatar_url")
        .ilike("email", session.email)
        .maybeSingle();
      uData = data;
    }

    if (uData) {
      // 1. Cargar imagen de avatar si está guardada en Supabase
      if (uData.avatar_url && typeof updateAvatarCallback === "function") {
        updateAvatarCallback(uData.avatar_url);
      }

      // 2. Cargar cargo resuelto
      const rawCargo = uData.cargo || session.cargo;
      if (smallCargoElement && rawCargo) {
        if (/^[0-9a-fA-F\-]+$/.test(String(rawCargo).trim())) {
          const { data: cData } = await supabase
            .from("cargos")
            .select("nombre")
            .eq("id", rawCargo)
            .maybeSingle();

          if (cData?.nombre) {
            smallCargoElement.textContent = cData.nombre;
            return;
          }
        }
        smallCargoElement.textContent = String(rawCargo);
      }
    }
  } catch (e) {
    console.warn("Info consulta detalles usuario para nav:", e);
  }
}

/**
 * Consulta la empresa por nombre y aplica su color_primario al sidebar sin tocar el contenedor del logo Geass Tech.
 */
async function applyCompanyTheme(container, nombreEmpresa) {
  try {
    let colorPrimario = null;

    // Buscar en cache local primero
    try {
      const cache = JSON.parse(localStorage.getItem("gt_companies_cache") || "[]");
      const found = cache.find((c) => c.nombre_empresa?.toLowerCase() === nombreEmpresa.toLowerCase());
      if (found) {
        colorPrimario = found.color_primario || found.color_principal || found.colorPrimario;
      }
    } catch (e) {}

    // Buscar en Supabase DB si no está en cache
    if (!colorPrimario) {
      const { data } = await supabase
        .from("empresa")
        .select("color_primario, color_principal")
        .ilike("nombre_empresa", nombreEmpresa)
        .maybeSingle();

      if (data) {
        colorPrimario = data.color_primario || data.color_principal;
      }
    }

    if (colorPrimario) {
      const sidebar = container.querySelector(".app-sidebar");
      const avatar = container.querySelector(".avatar");

      if (sidebar) sidebar.style.backgroundColor = colorPrimario;
      if (avatar && !avatar.querySelector("img")) avatar.style.background = colorPrimario;
    }
  } catch (err) {
    console.warn("No se pudo cargar el color corporativo de la empresa:", err);
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
