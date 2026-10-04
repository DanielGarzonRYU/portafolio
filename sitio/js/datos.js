/* =============================================================
   LIMPIEZA DE DATOS
   Convierte lo que guarda el panel (datos/*.json) en datos seguros
   para dibujar la página. No toca el DOM: se prueba con `npm test`.
   ============================================================= */

export const SITIO_POR_DEFECTO = {
  nombre: "Cesar Daniel Cristancho Garzón",
  frase: "Páginas web y apps que trabajan para tu negocio.",
  whatsapp: "573102165848",
  mensaje_whatsapp: "Hola Cesar, vi tu portafolio y me interesa un proyecto",
  correo: "ccdgarzon@gmail.com",
};

// Texto recortado; cualquier cosa que no sea texto o número cuenta como vacío.
function texto(valor) {
  if (typeof valor === "number") return String(valor);
  return typeof valor === "string" ? valor.trim() : "";
}

function listaDeTextos(valor) {
  if (!Array.isArray(valor)) return [];
  return valor.map(texto).filter(Boolean);
}

export function normalizarWhatsapp(numero) {
  const digitos = texto(numero).replace(/\D/g, "");
  // Celular colombiano escrito sin el 57
  if (digitos.length === 10 && digitos.startsWith("3")) return "57" + digitos;
  return digitos;
}

export function enlaceWhatsapp(numero, mensaje) {
  const digitos = normalizarWhatsapp(numero);
  if (!digitos) return "";
  const m = texto(mensaje);
  return `https://wa.me/${digitos}` + (m ? `?text=${encodeURIComponent(m)}` : "");
}

const ESQUEMA = /^[a-z][a-z0-9+.-]*:(?!\d)/i; // "javascript:", "data:"... pero no "dominio.com:8080"

export function urlSegura(valor) {
  const t = texto(valor);
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (ESQUEMA.test(t)) return "";
  return `https://${t}`;
}

export function rutaMedia(valor) {
  const t = texto(valor);
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (ESQUEMA.test(t)) return "";
  return "/" + t.replace(/^\.?\/+/, "");
}

export function normalizarSitio(raw) {
  const datos = raw && typeof raw === "object" ? raw : {};
  const sitio = {};
  for (const clave of Object.keys(SITIO_POR_DEFECTO)) {
    sitio[clave] = texto(datos[clave]) || SITIO_POR_DEFECTO[clave];
  }
  sitio.whatsapp = normalizarWhatsapp(sitio.whatsapp) || SITIO_POR_DEFECTO.whatsapp;
  return sitio;
}

export function normalizarProyecto(raw) {
  if (!raw || typeof raw !== "object") return null;
  const nombre = texto(raw.nombre);
  const frase = texto(raw.frase);
  if (!nombre || !frase) return null;
  return {
    nombre,
    tipo: texto(raw.tipo),
    frase,
    logros: listaDeTextos(raw.logros),
    video: rutaMedia(raw.video),
    portada: rutaMedia(raw.portada),
    enlace: urlSegura(raw.enlace),
    nota_enlace: texto(raw.nota_enlace),
    codigo: urlSegura(raw.codigo),
    descarga: urlSegura(raw.descarga),
    tecnologias: listaDeTextos(raw.tecnologias),
  };
}

export function normalizarProyectos(raw) {
  const lista = Array.isArray(raw) ? raw : Array.isArray(raw?.proyectos) ? raw.proyectos : [];
  return lista.map(normalizarProyecto).filter(Boolean);
}

// Host de un enlace para mostrarlo en la barra del marco (ej. "kaf-frontend.onrender.com")
export function dominio(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Monograma de la barra: nombre + primer apellido ("Cesar Daniel Cristancho Garzón" → "CC")
export function iniciales(nombre) {
  const palabras = texto(nombre).split(/\s+/).filter(Boolean);
  if (!palabras.length) return "";
  const apellido = palabras.length >= 4 ? palabras[palabras.length - 2] : palabras[palabras.length - 1];
  const letras = palabras.length === 1 ? [palabras[0]] : [palabras[0], apellido];
  return letras.map((p) => p[0].toUpperCase()).join("");
}

// Logo de la tecnología (Simple Icons, CC0) a partir del nombre escrito en el panel.
// Si no está en la lista, la etiqueta se muestra solo con texto.
const LOGOS = {
  react: "react", nodejs: "nodedotjs", node: "nodedotjs", postgresql: "postgresql", postgres: "postgresql",
  javascript: "javascript", js: "javascript", typescript: "typescript", ts: "typescript", html: "html5", html5: "html5",
  css: "css", css3: "css", java: "openjdk", kotlin: "kotlin", android: "android", androidstudio: "androidstudio",
  php: "php", mysql: "mysql", sqlite: "sqlite", python: "python", firebase: "firebase", mongodb: "mongodb",
  nextjs: "nextdotjs", tailwind: "tailwindcss", tailwindcss: "tailwindcss", vite: "vite", express: "express",
  expressjs: "express", cloudflare: "cloudflare", docker: "docker", git: "git",
};
export function logoTecnologia(nombre) {
  const clave = texto(nombre).toLowerCase().replace(/[\s.\-_]/g, "");
  return LOGOS[clave] ? `/iconos/tec/${LOGOS[clave]}.svg` : "";
}

// Tema al cargar: la elección guardada del visitante; si no hay, la del sistema.
export function temaInicial(guardado, sistemaOscuro) {
  if (guardado === "light" || guardado === "dark") return guardado;
  return sistemaOscuro ? "dark" : "light";
}

// Número legible para la tarjeta de contacto: "+57 310 216 5848" (otros países: +dígitos)
export function telefonoLegible(numero) {
  const d = normalizarWhatsapp(numero);
  if (!d) return "";
  const m = d.match(/^57(3\d{2})(\d{3})(\d{4})$/);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : `+${d}`;
}

// ---- Avance del scroll (para navegadores sin animation-timeline, como Firefox) ----
const limitar = (v) => Math.min(1, Math.max(0, v));

// Igual al rango "contain 0% → contain 100%" de CSS: 0 cuando la sección toca el borde
// superior de la ventana, 1 cuando su borde inferior toca el inferior.
export function progresoContener({ scrollY, inicio, alto, ventana }) {
  const recorrido = alto - ventana;
  return recorrido > 0 ? limitar((scrollY - inicio) / recorrido) : 0;
}

// Igual al rango "entry desdeEntrada → cover hastaCubierto" de CSS, a partir de la
// posición actual del borde superior del elemento (arriba) relativa a la ventana.
export function progresoEntrada({ arriba, alto, ventana, desdeEntrada = 0, hastaCubierto }) {
  const avanzado = ventana - arriba; // px recorridos desde que el elemento asomó por abajo
  const desde = desdeEntrada * alto;
  const hasta = hastaCubierto * (ventana + alto);
  return hasta > desde ? limitar((avanzado - desde) / (hasta - desde)) : 0;
}
