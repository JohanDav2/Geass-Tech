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

/**
 * Mapa de íconos SVG por código de módulo.
 * Cada valor es el innerHTML del <svg viewBox="0 0 24 24">.
 */
const MODULE_ICONS = {
  asistencia:    `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  capacitaciones:`<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  legal:         `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
  peligros:      `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  corporativa:   `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  documental:    `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,
  indicadores:   `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  auditorias:    `<path d="M9 11l3 3L22 4"/><circle cx="12" cy="12" r="10"/>`,
  activos:       `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  contratistas:  `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  sst:           `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  "gps-tracker": `<circle cx="12" cy="12" r="3"/><path d="M19.94 11a8 8 0 1 0 .06 1"/>`,
};

/**
 * Devuelve el SVG innerHTML para un módulo dado su código.
 * Si no está en el mapa usa un ícono genérico de módulo.
 */
function getModuleIcon(codigo) {
  const key = (codigo || "").toLowerCase().trim();
  return MODULE_ICONS[key] ||
    `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`;
}

/**
 * Carga los módulos activos de la empresa desde Supabase,
 * verifica si existe la carpeta local ./modulos/{codigo}/index.html
 * y los inyecta en el sidebar.
 */
async function loadCompanyModules(container, empresaNombre) {
  try {
    // 1. Buscar empresa por nombre
    const { data: empresa } = await supabase
      .from("empresa")
      .select("id")
      .ilike("nombre_empresa", empresaNombre)
      .maybeSingle();

    if (!empresa?.id) return;

    // 2. Obtener módulos activos asignados a esta empresa
    const { data: empresaModulos } = await supabase
      .from("empresa_modulo")
      .select("modulo_id")
      .eq("empresa_id", empresa.id)
      .eq("estado", "Activo");

    if (!empresaModulos || empresaModulos.length === 0) return;

    const moduloIds = empresaModulos.map((em) => em.modulo_id);

    // 3. Obtener detalles de esos módulos
    const { data: modulos } = await supabase
      .from("modulos")
      .select("id, nombre, codigo")
      .in("id", moduloIds)
      .eq("estado", "Activo")
      .order("orden", { ascending: true });

    if (!modulos || modulos.length === 0) return;

    // 4. Calcular el base path de la empresa (hasta /empresas/{nombre}/)
    //    Funciona desde cualquier página dentro del portal: index, módulo, etc.
    const currentPath = window.location.pathname;
    const empresasIdx = currentPath.toLowerCase().indexOf("/empresas/");
    // Encontrar el siguiente "/" después del nombre de la empresa
    const afterEmpresasSlash = currentPath.indexOf("/", empresasIdx + "/empresas/".length);
    const empresaBasePath = afterEmpresasSlash !== -1
      ? currentPath.slice(0, afterEmpresasSlash + 1)  // ej. "/empresas/dulce pan/"
      : currentPath;

    const navEl = container.querySelector(".app-nav");
    if (!navEl) return;

    // Contenedor para los módulos dinámicos (evita duplicados)
    let modulesSlot = navEl.querySelector("#nav-modules");
    if (!modulesSlot) {
      modulesSlot = document.createElement("div");
      modulesSlot.id = "nav-modules";
      modulesSlot.style.cssText = "display:contents";
      navEl.appendChild(modulesSlot);
    } else {
      modulesSlot.innerHTML = ""; // limpiar si ya había
    }

    const checks = await Promise.allSettled(
      modulos.map(async (mod) => {
        const codigo = (mod.codigo || mod.nombre || "").toLowerCase().trim();
        const moduloPath = `${empresaBasePath}modulos/${encodeURIComponent(codigo)}/index.html`;
        const fetchUrl = moduloPath; // URL absoluta de pathname
        try {
          const res = await fetch(fetchUrl, { method: "HEAD" });
          return res.ok ? { mod, moduloPath, codigo } : null;
        } catch {
          return null;
        }
      })
    );

    checks.forEach((result) => {
      if (result.status !== "fulfilled" || !result.value) return;
      const { mod, moduloPath, codigo } = result.value;

      const label = mod.nombre || codigo;
      const iconInner = getModuleIcon(codigo);

      // Detectar si esta página es del módulo activo
      const isActive = currentPath.toLowerCase().includes(`/modulos/${codigo}/`);

      const link = document.createElement("a");
      link.href = moduloPath;
      link.className = `nav-link nav-link-mod-${codigo}${isActive ? " is-active" : ""}`;
      link.dataset.module = codigo;
      if (isActive) link.setAttribute("aria-current", "page");
      link.title = label;
      link.innerHTML = `<svg viewBox="0 0 24 24">${iconInner}</svg><span>${label}</span>`;

      modulesSlot.appendChild(link);
    });
  } catch (err) {
    console.warn("No se pudieron cargar los módulos del portal:", err);
  }
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

    // 4. Cargar módulos activos de la empresa en el sidebar (solo en portales de empresa)
    if (isCompanySubfolder && session.empresa) {
      loadCompanyModules(container, session.empresa);
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

  // Manejador del botón hamburguesa para pantallas pequeñas (<= 800px)
  const toggleBtn = container.querySelector("#nav-toggle-btn") || container.querySelector(".nav-toggle-btn");
  const sidebar = container.querySelector(".app-sidebar");

  if (toggleBtn && sidebar) {
    const closeMobileMenu = () => {
      sidebar.classList.remove("is-mobile-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    };

    toggleBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = sidebar.classList.contains("is-mobile-open");
      if (isOpen) {
        closeMobileMenu();
      } else {
        sidebar.classList.add("is-mobile-open");
        toggleBtn.setAttribute("aria-expanded", "true");
      }
    });

    // Cerrar menú al hacer clic en un enlace de navegación
    container.addEventListener("click", (event) => {
      if (event.target.closest(".nav-link")) {
        closeMobileMenu();
      }
    });

    // Cerrar menú al hacer clic fuera del sidebar y del botón
    document.addEventListener("click", (event) => {
      if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
        closeMobileMenu();
      }
    });
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
