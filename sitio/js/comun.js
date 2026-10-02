/* Funciones compartidas por todas las páginas. No necesitas editar este archivo. */

const ICONOS = {
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  descarga: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  codigo: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5Z"/>',
  movil: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
  herramienta: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 1-1.9-1.9Z"/><path d="M14.5 5.5 17 3l4 4-2.5 2.5"/>',
  juego: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10.5v3M5.5 12h3M15.5 11h.01M17.5 13h.01"/>',
  caja: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
  escudo: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  alerta: '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/>',
  chat: '<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9.5h8M8 12.5h5"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  enviar: '<path d="M4 12 20 4l-6 16-3-7Z"/><path d="m11 13 9-9"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10.5V17M8 7.5h.01M12 17v-6.5M12 13.5c0-1.7 1.1-3 2.5-3s2.5 1 2.5 3V17"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2Z"/>',
  flecha: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  archivo: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
};

function icono(nombre, clase = "ico") {
  return `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre] || ""}</svg>`;
}

// Evita que un texto se interprete como HTML
function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function claseEstado(estado) {
  return (estado || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

function iconoTipo(tipo) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("móvil") || t.includes("movil") || t.includes("android") || t.includes("apk")) return "movil";
  if (t.includes("web") || t.includes("página") || t.includes("pagina")) return "web";
  if (t.includes("juego")) return "juego";
  if (t.includes("herramienta")) return "herramienta";
  return "caja";
}

function portadaHTML(p) {
  if (p.imagen) return `<img src="${esc(p.imagen)}" alt="Portada de ${esc(p.nombre)}" loading="lazy">`;
  return `<div class="portada-auto">${icono(iconoTipo(p.tipo))}<span class="inicial">${esc(p.nombre.trim().charAt(0))}</span></div>`;
}

function formatoFecha(aaaamm) {
  if (!aaaamm) return "";
  const [a, m] = String(aaaamm).split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return m ? `${meses[+m - 1] || m} ${a}` : a;
}

function formatoNumero(n) {
  return new Intl.NumberFormat("es-CO").format(n || 0);
}

function avisar(texto) {
  const el = document.createElement("div");
  el.className = "aviso-flotante";
  el.textContent = texto;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function proyectosOrdenados() {
  return [...(window.PROYECTOS || [])].sort(
    (a, b) => (b.destacado === true) - (a.destacado === true) || String(b.fecha || "").localeCompare(String(a.fecha || ""))
  );
}

// Nombre e iniciales en el encabezado y el pie de todas las páginas
function pintarMarca() {
  const perfil = window.PERFIL || {};
  document.querySelectorAll("[data-nombre]").forEach((el) => (el.textContent = perfil.nombre || ""));
  document.querySelectorAll("[data-iniciales]").forEach((el) => (el.textContent = perfil.iniciales || ""));
  document.querySelectorAll("[data-anio]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- Contador de visitas y descargas ----------
   Habla con /api/contador (Cloudflare). Si el sitio se abre sin
   servidor (doble clic en el archivo), simplemente no muestra cifras. */
const Contador = {
  async obtener(ids) {
    if (location.protocol === "file:" || !ids.length) return null;
    try {
      const r = await fetch(`/api/contador?ids=${encodeURIComponent(ids.join(","))}`);
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  },

  // tipo: "visita" | "descarga". Las visitas cuentan una vez por sesión.
  registrar(id, tipo) {
    if (location.protocol === "file:") return;
    if (tipo === "visita") {
      const clave = `visto:${id}`;
      try {
        if (sessionStorage.getItem(clave)) return;
        sessionStorage.setItem(clave, "1");
      } catch {}
    }
    const datos = new Blob([JSON.stringify({ id, tipo })], { type: "application/json" });
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/contador", datos))) {
      fetch("/api/contador", { method: "POST", body: datos, keepalive: true }).catch(() => {});
    }
  },
};

document.addEventListener("DOMContentLoaded", pintarMarca);
