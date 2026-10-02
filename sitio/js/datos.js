/* =============================================================
   LIMPIEZA DE DATOS
   Convierte lo que guarda el panel (datos/*.json) en datos seguros
   para dibujar la página. No toca el DOM: se prueba con `npm test`.
   ============================================================= */

export const SITIO_POR_DEFECTO = {
  nombre: "Cesar Daniel Cristancho Garzón",
  frase: "Desarrollo páginas web y apps para negocios.",
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
    tecnologias: listaDeTextos(raw.tecnologias),
  };
}

export function normalizarProyectos(raw) {
  const lista = Array.isArray(raw) ? raw : Array.isArray(raw?.proyectos) ? raw.proyectos : [];
  return lista.map(normalizarProyecto).filter(Boolean);
}
