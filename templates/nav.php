<?php
/**
 * nav.php — Barra de navegación SecurApp
 * Sidebar lateral (rojo elegante) + Topbar (perfil, notificaciones, calendario, búsqueda)
 * Incluir con: include 'nav.php';
 */

// Datos de ejemplo — reemplazar por la sesión real del usuario
$userName    = $userName ?? "Johan Duitama";
$userRole    = $userRole ?? "Administrador";
$notifCount  = $notifCount ?? 3;
$activeItem  = $activeItem ?? "inicio"; // inicio | vehiculos | clientes | organizaciones | reportes | ajustes
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SecurApp · Navegación</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --red-950:#33070E;
    --red-900:#500F1B;
    --red-800:#711525;
    --red-700:#93202F;
    --amber-500:#E8A93B;
    --amber-300:#F3C978;
    --orange-500:#DD7A3B;
    --navy-900:#151C26;
    --navy-600:#5B6675;
    --cream-50:#FAF8F4;
    --white:#FFFFFF;
    --border:rgba(21,28,38,0.08);
    --shadow-sm:0 1px 2px rgba(21,28,38,0.06);
    --shadow-md:0 8px 24px rgba(21,28,38,0.12);
    --sidebar-w:76px;
    --topbar-h:64px;
  }

  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;height:100%;}
  body{
    font-family:"DM Sans", sans-serif;
    background:var(--cream-50);
    color:var(--navy-900);
    -webkit-font-smoothing:antialiased;
  }
  .mono{font-family:"JetBrains Mono", monospace;}

  a{color:inherit;text-decoration:none;}
  button{font-family:inherit;border:none;background:none;cursor:pointer;color:inherit;}

  /* ============ LAYOUT SHELL ============ */
  .app-shell{
    display:flex;
    min-height:100vh;
  }

  /* ============ SIDEBAR ============ */
  .sidebar{
    width:var(--sidebar-w);
    flex-shrink:0;
    height:100vh;
    position:sticky;
    top:0;
    background:linear-gradient(175deg, var(--red-900) 0%, var(--red-800) 55%, var(--red-950) 100%);
    display:flex;
    flex-direction:column;
    align-items:center;
    padding:18px 0 22px;
    box-shadow:2px 0 18px rgba(51,7,14,0.18);
    z-index:20;
  }

  .sidebar__logo{
    width:42px;
    height:42px;
    border-radius:12px;
    background:linear-gradient(135deg, var(--amber-500), var(--orange-500));
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow:0 4px 10px rgba(0,0,0,0.25);
    margin-bottom:26px;
  }
  .sidebar__logo svg{width:22px;height:22px;stroke:var(--red-950);}

  .sidebar__nav{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    flex:1;
    width:100%;
  }

  .nav-item{
    position:relative;
    width:52px;
    height:48px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:12px;
    color:rgba(255,255,255,0.62);
    transition:background .18s ease, color .18s ease;
  }
  .nav-item svg{width:21px;height:21px;stroke:currentColor;fill:none;stroke-width:1.8;}

  .nav-item:hover{
    background:rgba(255,255,255,0.08);
    color:#fff;
  }
  .nav-item:focus-visible{
    outline:2px solid var(--amber-300);
    outline-offset:2px;
  }

  .nav-item.is-active{
    background:rgba(232,169,59,0.14);
    color:var(--amber-300);
  }
  .nav-item.is-active::before{
    content:"";
    position:absolute;
    left:-14px;
    top:50%;
    transform:translateY(-50%);
    width:4px;
    height:22px;
    border-radius:0 4px 4px 0;
    background:var(--amber-500);
    box-shadow:0 0 8px 1px rgba(232,169,59,0.65);
    animation:pulse-ping 2.4s ease-in-out infinite;
  }
  @keyframes pulse-ping{
    0%,100%{opacity:1;}
    50%{opacity:.55;}
  }
  @media (prefers-reduced-motion: reduce){
    .nav-item.is-active::before{animation:none;}
  }

  /* tooltip */
  .nav-item .tooltip{
    position:absolute;
    left:calc(100% + 12px);
    top:50%;
    transform:translateY(-50%) translateX(-4px);
    background:var(--navy-900);
    color:#fff;
    font-size:12.5px;
    font-weight:500;
    padding:6px 10px;
    border-radius:7px;
    white-space:nowrap;
    opacity:0;
    pointer-events:none;
    transition:opacity .15s ease, transform .15s ease;
    box-shadow:var(--shadow-md);
    z-index:30;
  }
  .nav-item:hover .tooltip,
  .nav-item:focus-visible .tooltip{
    opacity:1;
    transform:translateY(-50%) translateX(0);
  }

  .sidebar__footer{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    padding-top:10px;
    border-top:1px solid rgba(255,255,255,0.08);
    width:100%;
  }

  /* ============ MAIN COLUMN ============ */
  .main-col{
    flex:1;
    min-width:0;
    display:flex;
    flex-direction:column;
  }

  /* ============ TOPBAR ============ */
  .topbar{
    height:var(--topbar-h);
    background:var(--white);
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:18px;
    padding:0 24px;
    position:sticky;
    top:0;
    z-index:15;
  }

  .topbar__title{
    font-weight:700;
    font-size:16.5px;
    color:var(--navy-900);
    display:flex;
    align-items:center;
    gap:8px;
  }
  .topbar__title .dot{
    width:7px;height:7px;border-radius:50%;
    background:var(--amber-500);
  }

  .topbar__right{
    display:flex;
    align-items:center;
    gap:10px;
  }

  /* search */
  .search{
    display:flex;
    align-items:center;
    gap:8px;
    background:var(--cream-50);
    border:1px solid var(--border);
    border-radius:10px;
    padding:8px 12px;
    width:280px;
    transition:box-shadow .18s ease, border-color .18s ease, width .18s ease;
  }
  .search:focus-within{
    border-color:var(--amber-500);
    box-shadow:0 0 0 3px rgba(232,169,59,0.16);
    width:320px;
  }
  .search svg{width:16px;height:16px;stroke:var(--navy-600);flex-shrink:0;}
  .search input{
    border:none;background:none;outline:none;
    font-family:inherit;font-size:13.5px;color:var(--navy-900);
    width:100%;
  }
  .search input::placeholder{color:var(--navy-600);opacity:.8;}

  /* icon buttons (bell / calendar) */
  .icon-btn{
    position:relative;
    width:38px;height:38px;
    display:flex;align-items:center;justify-content:center;
    border-radius:10px;
    color:var(--navy-600);
    transition:background .16s ease, color .16s ease;
  }
  .icon-btn svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.8;}
  .icon-btn:hover{background:var(--cream-50);color:var(--red-800);}
  .icon-btn:focus-visible{outline:2px solid var(--amber-500);outline-offset:2px;}

  .icon-btn__badge{
    position:absolute;
    top:4px;right:5px;
    min-width:15px;height:15px;
    padding:0 3px;
    border-radius:8px;
    background:var(--orange-500);
    color:#fff;
    font-size:9.5px;
    font-weight:600;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 2px var(--white);
  }

  .topbar__divider{
    width:1px;height:26px;
    background:var(--border);
    margin:0 2px;
  }

  /* profile trigger */
  .profile{
    position:relative;
  }
  .profile__trigger{
    display:flex;
    align-items:center;
    gap:9px;
    padding:5px 8px 5px 5px;
    border-radius:10px;
    transition:background .16s ease;
  }
  .profile__trigger:hover{background:var(--cream-50);}
  .profile__trigger:focus-visible{outline:2px solid var(--amber-500);outline-offset:2px;}

  .avatar{
    width:32px;height:32px;
    border-radius:50%;
    background:linear-gradient(135deg, var(--red-800), var(--red-700));
    color:var(--amber-300);
    display:flex;align-items:center;justify-content:center;
    font-size:12.5px;font-weight:700;
    flex-shrink:0;
  }

  .profile__meta{
    display:flex;flex-direction:column;
    line-height:1.2;
    text-align:left;
  }
  .profile__meta strong{font-size:13px;font-weight:600;color:var(--navy-900);}
  .profile__meta span{font-size:11.5px;color:var(--navy-600);}

  .profile__trigger .chev{width:14px;height:14px;stroke:var(--navy-600);transition:transform .18s ease;}
  .profile[data-open="true"] .chev{transform:rotate(180deg);}

  /* dropdown */
  .profile__menu{
    position:absolute;
    top:calc(100% + 10px);
    right:0;
    width:240px;
    background:var(--white);
    border:1px solid var(--border);
    border-radius:14px;
    box-shadow:var(--shadow-md);
    padding:6px;
    opacity:0;
    transform:translateY(-6px);
    pointer-events:none;
    transition:opacity .15s ease, transform .15s ease;
    z-index:40;
  }
  .profile[data-open="true"] .profile__menu{
    opacity:1;
    transform:translateY(0);
    pointer-events:auto;
  }

  .profile__menu-head{
    display:flex;align-items:center;gap:10px;
    padding:10px 10px 12px;
  }
  .profile__menu-head .avatar{width:38px;height:38px;font-size:14px;}
  .profile__menu-head strong{display:block;font-size:14px;font-weight:700;}
  .profile__menu-head a{font-size:12px;color:var(--red-800);font-weight:600;}
  .profile__menu-head a:hover{text-decoration:underline;}

  .menu-sep{height:1px;background:var(--border);margin:4px 6px;}

  .menu-item{
    display:block;
    width:100%;
    text-align:left;
    padding:9px 10px;
    border-radius:8px;
    font-size:13.5px;
    font-weight:500;
    color:var(--navy-900);
  }
  .menu-item:hover{background:var(--cream-50);}
  .menu-item.danger{color:var(--red-800);}
  .menu-item.danger:hover{background:rgba(147,32,47,0.08);}

  /* ============ RESPONSIVE ============ */
  @media (max-width:720px){
    .search{width:0;padding:0;border:none;}
    .search.is-mobile-open{
      position:fixed;
      top:12px;left:12px;right:12px;
      width:auto;
      background:var(--white);
      border:1px solid var(--border);
      padding:10px 12px;
      z-index:50;
      box-shadow:var(--shadow-md);
    }
    .profile__meta{display:none;}
    .topbar{padding:0 12px;gap:8px;}
  }
</style>
</head>
<body>

<div class="app-shell">

  <!-- ============ SIDEBAR ============ -->
  <aside class="sidebar" aria-label="Navegación principal">
    <div class="sidebar__logo" aria-hidden="true">
      <!-- pin / GPS mark -->
      <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="var(--red-950)" stroke="none"/><circle cx="12" cy="9.5" r="2.4" fill="var(--amber-500)" stroke="none"/></svg>
    </div>

    <nav class="sidebar__nav">
      <a href="#inicio" class="nav-item <?= $activeItem==='inicio' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='inicio' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
        <span class="tooltip">Inicio</span>
      </a>
      <a href="#vehiculos" class="nav-item <?= $activeItem==='vehiculos' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='vehiculos' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><path d="M3 13l1.5-5A2 2 0 0 1 6.4 6.5h9.2a2 2 0 0 1 1.9 1.5L19 13"/><rect x="2.5" y="13" width="18" height="5" rx="1.4"/><circle cx="7" cy="19.5" r="1.6"/><circle cx="17" cy="19.5" r="1.6"/></svg>
        <span class="tooltip">Vehículos</span>
      </a>
      <a href="#clientes" class="nav-item <?= $activeItem==='clientes' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='clientes' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.7 20c0-3.4 2.8-6 6.3-6s6.3 2.6 6.3 6"/><circle cx="17.5" cy="8.6" r="2.5"/><path d="M15.6 14.3c2.6.4 4.6 2.5 4.6 5.4"/></svg>
        <span class="tooltip">Clientes</span>
      </a>
      <a href="#organizaciones" class="nav-item <?= $activeItem==='organizaciones' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='organizaciones' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 8h6v13h-6"/><path d="M7.5 7.2h0M10.5 7.2h0M7.5 11h0M10.5 11h0M7.5 14.8h0M10.5 14.8h0"/></svg>
        <span class="tooltip">Organizaciones</span>
      </a>
      <a href="#reportes" class="nav-item <?= $activeItem==='reportes' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='reportes' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>
        <span class="tooltip">Reportes</span>
      </a>
    </nav>

    <div class="sidebar__footer">
      <a href="#ajustes" class="nav-item <?= $activeItem==='ajustes' ? 'is-active' : '' ?>" aria-current="<?= $activeItem==='ajustes' ? 'page' : 'false' ?>">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.9 7.9 0 0 0 0-3l1.9-1.5-2-3.4-2.2.9a8 8 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a8 8 0 0 0-2.6 1.5l-2.2-.9-2 3.4L4.6 10.5a7.9 7.9 0 0 0 0 3l-1.9 1.5 2 3.4 2.2-.9a8 8 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a8 8 0 0 0 2.6-1.5l2.2.9 2-3.4z"/></svg>
        <span class="tooltip">Ajustes</span>
      </a>
    </div>
  </aside>

  <!-- ============ MAIN COLUMN ============ -->
  <div class="main-col">

    <!-- ============ TOPBAR ============ -->
    <header class="topbar">
      <div class="topbar__title">
        <span class="dot" aria-hidden="true"></span>
        Panel de flota
      </div>

      <div class="topbar__right">
        <form class="search" role="search" onsubmit="return false;">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" name="q" placeholder="Buscar vehículo, cliente u organización…" autocomplete="off">
        </form>

        <button type="button" class="icon-btn" title="Calendario" aria-label="Abrir calendario">
          <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        </button>

        <button type="button" class="icon-btn" title="Notificaciones" aria-label="Ver notificaciones">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <?php if ($notifCount > 0): ?>
            <span class="icon-btn__badge mono"><?= (int)$notifCount ?></span>
          <?php endif; ?>
        </button>

        <div class="topbar__divider"></div>

        <div class="profile" id="profileMenu" data-open="false">
          <button type="button" class="profile__trigger" id="profileTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="avatar"><?= strtoupper(substr($userName,0,1)) ?></span>
            <span class="profile__meta">
              <strong><?= htmlspecialchars($userName) ?></strong>
              <span><?= htmlspecialchars($userRole) ?></span>
            </span>
            <svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <div class="profile__menu" role="menu">
            <div class="profile__menu-head">
              <span class="avatar"><?= strtoupper(substr($userName,0,1)) ?></span>
              <div>
                <strong><?= htmlspecialchars($userName) ?></strong>
                <a href="#perfil">Ver perfil</a>
              </div>
            </div>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#actualizaciones" role="menuitem">Últimas actualizaciones</a>
            <a class="menu-item" href="#ayuda" role="menuitem">Obtener ayuda</a>
            <a class="menu-item" href="#centro-ayuda" role="menuitem">Centro de ayuda</a>
            <a class="menu-item" href="#atajos" role="menuitem">Atajos</a>
            <a class="menu-item" href="#feedback" role="menuitem">Enviar comentarios</a>
            <a class="menu-item" href="#privacidad" role="menuitem">Política de privacidad</a>
            <div class="menu-sep"></div>
            <a class="menu-item danger" href="#cerrar-sesion" role="menuitem">Cerrar sesión</a>
          </div>
        </div>
      </div>
    </header>

    <!-- El contenido de la página va aquí, después de incluir nav.php -->

  </div>
</div>

<script>
  (function(){
    var wrap = document.getElementById('profileMenu');
    var trigger = document.getElementById('profileTrigger');

    function closeMenu(){
      wrap.setAttribute('data-open','false');
      trigger.setAttribute('aria-expanded','false');
    }
    function toggleMenu(e){
      e.stopPropagation();
      var open = wrap.getAttribute('data-open') === 'true';
      wrap.setAttribute('data-open', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    }

    trigger.addEventListener('click', toggleMenu);
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeMenu();
    });
  })();
</script>

</body>
</html>
