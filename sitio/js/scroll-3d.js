/* =============================================================
   RESPALDO DE LAS ANIMACIONES 3D LIGADAS AL SCROLL
   Chrome y Edge las hacen solas con CSS (animation-timeline: view()).
   Firefox y Safari antiguo no lo soportan: para ellos este archivo crea
   las mismas animaciones (leídas del CSS, sin duplicarlas) y las avanza
   según el scroll, como máximo una vez por cuadro.
   ============================================================= */

import { progresoContener, progresoEntrada } from "./datos.js";

const DURACION = 1000; // las animaciones se recorren de 0 a 1000 ms según el avance del scroll

// Convierte una regla @keyframes del CSS en fotogramas para la Web Animations API
function fotogramas(nombre) {
  for (const hoja of document.styleSheets) {
    let reglas;
    try {
      reglas = hoja.cssRules;
    } catch {
      continue;
    }
    for (const regla of reglas) {
      if (regla.type !== CSSRule.KEYFRAMES_RULE || regla.name !== nombre) continue;
      const lista = [];
      for (const f of regla.cssRules) {
        for (const clave of f.keyText.split(",")) {
          const k = clave.trim();
          const offset = k === "from" ? 0 : k === "to" ? 1 : parseFloat(k) / 100;
          const cuadro = { offset };
          for (const prop of ["transform", "opacity"]) {
            const v = f.style.getPropertyValue(prop);
            if (v) cuadro[prop] = v;
          }
          lista.push(cuadro);
        }
      }
      return lista.sort((a, b) => a.offset - b.offset);
    }
  }
  return null;
}

function animar(el, cuadros) {
  if (!el || !cuadros) return null;
  const a = el.animate(cuadros, { duration: DURACION, fill: "both", easing: "linear" });
  a.pause();
  return a;
}

export function activarRespaldoScroll() {
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sinMovimiento || CSS.supports("animation-timeline: view()") || !Element.prototype.animate) return;
  document.documentElement.classList.add("scroll-js"); // activa el diseño fijo de la presentación (ver CSS)

  const tareas = [];
  const presentacion = document.querySelector(".presentacion");

  // Galería 3D de la presentación: rango "contain" de la sección
  if (presentacion) {
    const movil = window.matchMedia("(max-width: 860px)").matches;
    const enSeccion = (desde, hasta) => () => {
      const p = progresoContener({
        scrollY: window.scrollY,
        inicio: presentacion.getBoundingClientRect().top + window.scrollY,
        alto: presentacion.offsetHeight,
        ventana: window.innerHeight,
      });
      return (p - desde) / (hasta - desde);
    };
    tareas.push([animar(document.querySelector(".pila"), fotogramas(movil ? "pila-sube-movil" : "pila-sube")), enSeccion(0, 1)]);
    tareas.push([animar(document.querySelector(".texto-intro"), fotogramas("intro-sale")), enSeccion(0, 0.34)]);
    // Cada pantalla se eleva desde su profundidad inicial (--z0) a la final (--z1)
    document.querySelectorAll(".lamina").forEach((lamina) => {
      const estilo = getComputedStyle(lamina);
      const z0 = estilo.getPropertyValue("--z0").trim();
      const z1 = estilo.getPropertyValue("--z1").trim();
      tareas.push([animar(lamina, [{ transform: `translateZ(${z0})` }, { transform: `translateZ(${z1})` }]), enSeccion(0, 1)]);
    });
  }

  // Elementos que entran por abajo: se mide el contenedor (no el elemento que gira)
  const alEntrar = (el, medir, desdeEntrada, hastaCubierto, nombre) => {
    if (!el || !medir) return;
    tareas.push([
      animar(el, fotogramas(nombre)),
      () => {
        const r = medir.getBoundingClientRect();
        return progresoEntrada({ arriba: r.top, alto: r.height, ventana: window.innerHeight, desdeEntrada, hastaCubierto });
      },
    ]);
  };
  const conectarProyectos = () =>
    document.querySelectorAll("[data-revelar] .marco").forEach((marco) => {
      if (marco.dataset.respaldo) return;
      marco.dataset.respaldo = "1";
      alEntrar(marco, marco.closest(".escena"), 0, 0.42, "enderezar");
    });
  alEntrar(document.querySelector(".tarjeta"), document.querySelector(".tarjeta-inclinacion"), 0.05, 0.35, "entregar");

  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    for (const [anim, progreso] of tareas) {
      if (anim) anim.currentTime = Math.min(1, Math.max(0, progreso())) * DURACION;
    }
  };
  const pedirCuadro = () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  };
  // Escucha pasiva: no bloquea el scroll y agrupa todo en un solo cálculo por cuadro
  window.addEventListener("scroll", pedirCuadro, { passive: true });
  window.addEventListener("resize", pedirCuadro, { passive: true });
  actualizar();

  // Los proyectos se dibujan después de cargar los datos: se conectan cuando aparecen
  return () => {
    conectarProyectos();
    pedirCuadro();
  };
}
