/* =============================================================
   DIBUJA LA PÁGINA
   Lee datos/sitio.json y datos/proyectos.json (los edita el panel)
   y arma los bloques de proyectos. No necesitas editar este archivo.
   ============================================================= */

import { normalizarSitio, normalizarProyectos, enlaceWhatsapp, dominio, iniciales, logoTecnologia, telefonoLegible } from "./datos.js";
import { activarTema } from "./tema.js";
import { activarRespaldoScroll } from "./scroll-3d.js";

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
  document.querySelectorAll("[data-iniciales]").forEach((n) => (n.textContent = iniciales(sitio.nombre)));
  document.querySelectorAll("[data-whatsapp]").forEach((a) => (a.href = enlaceContacto));
  document.querySelectorAll("[data-telefono]").forEach((n) => (n.textContent = telefonoLegible(sitio.whatsapp)));
  document.querySelectorAll("[data-correo-enlace]").forEach((a) => (a.href = `mailto:${sitio.correo}`));
  document.querySelectorAll("[data-correo-texto]").forEach((n) => (n.textContent = sitio.correo));
  document.querySelectorAll("[data-correo]").forEach((a) => {
    a.href = `mailto:${sitio.correo}`;
    a.textContent = sitio.correo;
  });
  escribirTitulo(document.getElementById("frase"), sitio.frase);
}

// El título viene en el HTML separado en palabras (para animarlas sin parpadeo).
// Solo se reescribe si la frase del panel es distinta.
function escribirTitulo(h1, frase) {
  if (h1.textContent.trim() === frase) return;
  h1.replaceChildren();
  frase.split(/\s+/).forEach((texto, i) => {
    if (i) h1.append(" ");
    const palabra = el("span", "palabra", texto);
    palabra.style.setProperty("--i", i);
    h1.append(palabra);
  });
}

function crearRespaldo(p) {
  return el("div", "respaldo", p.nombre);
}

const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Reproduce el video solo cuando el bloque está en pantalla (ahorra datos del celular),
// salvo que el visitante lo haya pausado con el botón.
const observador =
  !menosMovimiento && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            const video = e.target;
            video.dataset.enPantalla = e.isIntersecting ? "1" : "";
            if (!e.isIntersecting) video.pause();
            else if (!video.dataset.pausaManual) video.play().catch(() => {}); // si se bloquea, queda el botón de reproducir
          }
        },
        { threshold: 0.35 }
      )
    : null;

// Arrancar un video por primera vez inicializa su decodificador (~60 ms bloqueando la página).
// Para que ese tirón no ocurra justo al hacer scroll, se prepara cuando el navegador está
// desocupado: se reproduce y, si no está en pantalla, se pausa de inmediato.
// No se hace con "ahorro de datos" ni en conexiones lentas (descargaría el video antes de tiempo).
function prepararVideos() {
  const conexion = navigator.connection;
  if (!observador || conexion?.saveData || /(^|-)2g|3g/.test(conexion?.effectiveType || "")) return;
  const preparar = () => {
    document.querySelectorAll(".proyecto-media video").forEach((video) => {
      if (video.dataset.pausaManual || video.dataset.enPantalla) return;
      video.preload = "auto";
      video
        .play()
        .then(() => {
          if (!video.dataset.enPantalla) video.pause();
        })
        .catch(() => {});
    });
  };
  if ("requestIdleCallback" in window) requestIdleCallback(preparar, { timeout: 4000 });
  else setTimeout(preparar, 2000);
}

// Botón propio de pausa/reproducción sobre el video (WCAG 2.2.2: todo lo que se mueve se puede pausar)
function crearBotonVideo(video) {
  const boton = el("button", "boton-video");
  boton.type = "button";
  const actualizar = () => {
    const pausado = video.paused;
    boton.dataset.estado = pausado ? "pausado" : "reproduciendo";
    boton.setAttribute("aria-label", pausado ? "Reproducir video" : "Pausar video");
  };
  boton.addEventListener("click", () => {
    if (video.paused) {
      delete video.dataset.pausaManual;
      video.play().catch(() => {});
    } else {
      video.dataset.pausaManual = "1";
      video.pause();
    }
  });
  video.addEventListener("play", actualizar);
  video.addEventListener("pause", actualizar);
  actualizar();
  return boton;
}

// Revela el texto de cada proyecto (y el marco, si el navegador no tiene animación por scroll) al aparecer.
const revelador =
  !menosMovimiento && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entradas, obs) => {
          for (const e of entradas) {
            if (!e.isIntersecting) continue;
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        },
        { threshold: 0.2 }
      )
    : null;
if (revelador) document.documentElement.classList.add("con-revelado");

// Inclinación 3D sutil siguiendo el puntero (solo mouse/trackpad). Se suaviza con interpolación
// para que tenga inercia; se actualiza el transform del elemento directamente, sin variables CSS.
// intensidad: grados máximos aproximados; brillo: elemento cuyo reflejo sigue al puntero (--bx/--by).
function activarInclinacion(escena, capa, { intensidad = 3, brillo = null } = {}) {
  if (menosMovimiento || !punteroFino) return;
  let objetivo = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  let cuadro = 0;
  const pintar = () => {
    actual.x += (objetivo.x - actual.x) * 0.12;
    actual.y += (objetivo.y - actual.y) * 0.12;
    const quieto = Math.abs(objetivo.x - actual.x) < 0.01 && Math.abs(objetivo.y - actual.y) < 0.01;
    if (quieto) Object.assign(actual, objetivo); // llegar exacto al reposo
    const enReposo = actual.x === 0 && actual.y === 0;
    capa.style.transform = enReposo ? "" : `rotateX(${actual.y.toFixed(3)}deg) rotateY(${actual.x.toFixed(3)}deg)`;
    cuadro = quieto ? 0 : requestAnimationFrame(pintar);
  };
  const mover = (x, y) => {
    objetivo = { x, y };
    if (!cuadro) cuadro = requestAnimationFrame(pintar);
  };
  escena.addEventListener("pointermove", (ev) => {
    const r = escena.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    mover((x - 0.5) * intensidad * 2, -(y - 0.5) * intensidad * 1.7);
    if (brillo) {
      brillo.style.setProperty("--bx", `${(x * 100).toFixed(1)}%`);
      brillo.style.setProperty("--by", `${(y * 100).toFixed(1)}%`);
    }
  });
  escena.addEventListener("pointerleave", () => mover(0, 0));
}

// Marco tipo navegador con el dominio real del proyecto, dentro de una escena 3D
function crearMarco(p) {
  const escena = el("div", "escena");
  const capa = el("div", "inclinacion");
  const marco = el("div", "marco");
  const barra = el("div", "marco-barra");
  const host = dominio(p.enlace);
  if (host) barra.append(el("span", "marco-url", host));
  marco.append(barra, crearMedia(p));
  capa.append(marco);
  escena.append(capa);
  activarInclinacion(escena, capa);
  return escena;
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
    video.addEventListener("error", () => {
      observador?.unobserve(video);
      mostrarPortada();
    });
    video.src = p.video;
    marco.append(video, crearBotonVideo(video));
    observador?.observe(video);
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
  articulo.dataset.revelar = "";
  const cuerpo = el("div", "proyecto-cuerpo");

  if (p.tipo) cuerpo.append(el("p", "proyecto-tipo", p.tipo));
  cuerpo.append(el("h3", "", p.nombre), el("p", "proyecto-frase", p.frase));
  if (p.logros.length) cuerpo.append(crearLista("logros", p.logros));

  if (p.enlace) {
    const fila = el("div", "proyecto-enlace");
    const boton = el("a", "btn btn-principal", "Ver sitio en vivo");
    const flecha = el("span", "flecha");
    flecha.setAttribute("aria-hidden", "true");
    boton.append(flecha);
    boton.href = p.enlace;
    boton.target = "_blank";
    boton.rel = "noopener";
    fila.append(boton);
    if (p.nota_enlace) fila.append(el("span", "nota", p.nota_enlace));
    cuerpo.append(fila);
  }

  if (p.tecnologias.length) {
    const tecnologias = el("ul", "tecnologias");
    for (const nombre of p.tecnologias) {
      const item = el("li");
      const logo = logoTecnologia(nombre);
      if (logo) {
        // Logo monocromático (Simple Icons) pintado con el color del texto
        const icono = el("span", "logo-tec");
        icono.setAttribute("aria-hidden", "true");
        icono.style.maskImage = icono.style.webkitMaskImage = `url("${logo}")`;
        item.append(icono);
      }
      item.append(nombre);
      tecnologias.append(item);
    }
    tecnologias.setAttribute("aria-label", "Tecnologías");
    cuerpo.append(tecnologias);
  }

  articulo.append(crearMarco(p), cuerpo);
  revelador?.observe(articulo);
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
  activarTema();
  const conectarRespaldo = activarRespaldoScroll(); // solo en navegadores sin animation-timeline
  const tarjeta = document.querySelector(".tarjeta");
  if (tarjeta) activarInclinacion(document.querySelector(".tarjeta-escena"), document.querySelector(".tarjeta-inclinacion"), { intensidad: 9, brillo: tarjeta });
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
  conectarRespaldo?.();
  prepararVideos();
}

iniciar();
