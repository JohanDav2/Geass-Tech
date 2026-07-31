export default {
  data: () => ({ activeItem: "inicio", profileOpen: false, menuItems: [
    { id: "inicio", label: "Inicio", icon: "⌂" }, { id: "vehiculos", label: "Vehículos", icon: "▱" },
    { id: "clientes", label: "Clientes", icon: "♙" }, { id: "organizaciones", label: "Organizaciones", icon: "▦" }, { id: "reportes", label: "Reportes", icon: "▥" }
  ] }),
  methods: {
    selectItem(id) { this.activeItem = id; this.profileOpen = false; },
    closeProfile() { this.profileOpen = false; },
    onProfileFocusOut(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) this.closeProfile();
    }
  },
  mounted() {
    this.onEscape = event => event.key === "Escape" && this.closeProfile();
    this.onDocumentClick = event => !this.$refs.profile?.contains(event.target) && this.closeProfile();
    document.addEventListener("keydown", this.onEscape);
    document.addEventListener("click", this.onDocumentClick);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.onEscape);
    document.removeEventListener("click", this.onDocumentClick);
  },
  template: `
    <aside class="app-sidebar" aria-label="Navegación principal">
      <a class="app-logo" href="./dashboard.html" aria-label="Inicio">G</a>
      <nav class="app-nav"><a v-for="item in menuItems" :key="item.id" :href="'#' + item.id" class="nav-link" :class="{ 'is-active': activeItem === item.id }" :aria-current="activeItem === item.id ? 'page' : undefined" @click="selectItem(item.id)"><b aria-hidden="true">{{ item.icon }}</b><span>{{ item.label }}</span></a></nav>
      <div class="app-nav-footer"><a href="#ajustes" class="nav-link" :class="{ 'is-active': activeItem === 'ajustes' }" @click="selectItem('ajustes')"><b aria-hidden="true">⚙</b><span>Ajustes</span></a></div>
    </aside>
    <header class="app-topbar"><div class="app-title">Panel de flota</div><div class="app-actions"><label class="app-search" aria-label="Buscar">⌕<input type="search" placeholder="Buscar vehículo, cliente u organización…"></label><button class="app-icon" type="button" aria-label="Calendario">□</button><button class="app-icon" type="button" aria-label="Notificaciones">♢<span class="notification-count">3</span></button><div ref="profile" class="profile" :data-open="profileOpen" @focusout="onProfileFocusOut"><button class="profile-button" type="button" :aria-expanded="profileOpen" @click="profileOpen = !profileOpen"><span class="avatar">J</span><span class="profile-meta"><strong>Johan Duitama</strong><small>Administrador</small></span></button><div class="profile-menu"><a href="#perfil" @click="closeProfile">Ver perfil</a><a href="#ayuda" @click="closeProfile">Obtener ayuda</a><a href="#privacidad" @click="closeProfile">Política de privacidad</a><a href="#cerrar-sesion" class="logout" @click="closeProfile">Cerrar sesión</a></div></div></div></header>
  `
};
