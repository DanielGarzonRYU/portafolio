/* =============================================================
   DIBUJA LA PÁGINA
   Lee datos/sitio.json y datos/proyectos.json (los edita el panel)
   y arma los bloques de proyectos. No necesitas editar este archivo.
   ============================================================= */

import { normalizarSitio, normalizarProyectos, enlaceWhatsapp } from "./datos.js";

let enlaceContacto = "";

async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta, { cache: "no-cache" });
  if (!respuesta.ok) throw new Error(`${ruta} respondió ${respuesta.status}`);
  return respuesta.json();
}

// Crea un elemento con clase y texto (el texto nunca se interpreta como HTML)
function el(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

function aplicarSitio(sitio) {
  enlaceContacto = enlaceWhatsapp(sitio.whatsapp, sitio.mensaje_whatsapp);
  document.querySelectorAll("[data-nombre]").forEach((n) => (n.textContent = sitio.nombre));
  document.querySelectorAll("[data-whatsapp]").forEach((a) => (a.href = enlaceContacto));
  document.querySelectorAll("[data-correo]").forEach((a) => {
    a.href = `mailto:${sitio.correo}`;
    a.textContent = sitio.correo;
  });
  document.getElementById("frase").textContent = sitio.frase;
}

function crearRespaldo(p) {
  return el("div", "respaldo", p.nombre);
}

// Reproduce el video solo cuando el bloque está en pantalla (ahorra datos del celular).
// Si el visitante pidió menos movimiento, no se reproduce solo: se muestran los controles.
const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const observador =
  !menosMovimiento && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            if (e.isIntersecting) e.target.play().catch(() => {});
            else e.target.pause();
          }
        },
        { threshold: 0.35 }
      )
    : null;

function observarVideo(video) {
  if (observador) observador.observe(video);
  else video.controls = true;
}

function crearMedia(p) {
  const marco = el("div", "proyecto-media");

  // Sin video (o si el video falla): portada; si la portada falla, recuadro con el nombre.
  const mostrarPortada = () => {
    if (!p.portada) return marco.replaceChildren(crearRespaldo(p));
    const img = el("img");
    img.src = p.portada;
    img.alt = `Captura de ${p.nombre}`;
    img.loading = "lazy";
    img.addEventListener("error", () => marco.replaceChildren(crearRespaldo(p)));
    marco.replaceChildren(img);
  };

  if (p.video) {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", `Video de ${p.nombre} funcionando`);
    if (p.portada) video.poster = p.portada;
    video.addEventListener("error", mostrarPortada);
    video.src = p.video;
    marco.append(video);
    observarVideo(video);
  } else {
    mostrarPortada();
  }
  return marco;
}

function crearLista(clase, items) {
  const ul = el("ul", clase);
  items.forEach((t) => ul.append(el("li", "", t)));
  return ul;
}

function crearProyecto(p, indice) {
  const articulo = el("article", indice % 2 ? "proyecto proyecto--invertido" : "proyecto");
  const cuerpo = el("div", "proyecto-cuerpo");

  if (p.tipo) cuerpo.append(el("p", "proyecto-tipo", p.tipo));
  cuerpo.append(el("h3", "", p.nombre), el("p", "proyecto-frase", p.frase));
  if (p.logros.length) cuerpo.append(crearLista("logros", p.logros));

  if (p.enlace) {
    const fila = el("div", "proyecto-enlace");
    const boton = el("a", "btn btn-principal", "Ver sitio en vivo →");
    boton.href = p.enlace;
    boton.target = "_blank";
    boton.rel = "noopener";
    fila.append(boton);
    if (p.nota_enlace) fila.append(el("span", "nota", p.nota_enlace));
    cuerpo.append(fila);
  }

  if (p.tecnologias.length) {
    const tecnologias = crearLista("tecnologias", p.tecnologias);
    tecnologias.setAttribute("aria-label", "Tecnologías");
    cuerpo.append(tecnologias);
  }

  articulo.append(crearMedia(p), cuerpo);
  return articulo;
}

function mostrarAviso(lista, texto) {
  const aviso = el("p", "aviso", texto + " ");
  const enlace = el("a", "", "Escríbeme por WhatsApp");
  enlace.href = enlaceContacto;
  enlace.target = "_blank";
  enlace.rel = "noopener";
  aviso.append(enlace, document.createTextNode("."));
  lista.replaceChildren(aviso);
}

async function iniciar() {
  document.querySelectorAll("[data-anio]").forEach((n) => (n.textContent = new Date().getFullYear()));
  const lista = document.getElementById("lista-proyectos");

  const [sitio, proyectos] = await Promise.allSettled([
    cargarJSON("/datos/sitio.json"),
    cargarJSON("/datos/proyectos.json"),
  ]);

  if (sitio.status === "rejected") console.error("No se pudo cargar sitio.json:", sitio.reason);
  aplicarSitio(normalizarSitio(sitio.status === "fulfilled" ? sitio.value : null));

  if (proyectos.status === "rejected") {
    console.error("No se pudo cargar proyectos.json:", proyectos.reason);
    mostrarAviso(lista, "No se pudieron cargar los proyectos.");
    return;
  }

  const datos = normalizarProyectos(proyectos.value);
  if (!datos.length) {
    mostrarAviso(lista, "Muy pronto verás mis proyectos aquí.");
    return;
  }
  lista.replaceChildren(...datos.map(crearProyecto));
}

iniciar();
