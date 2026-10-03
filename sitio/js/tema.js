/* =============================================================
   MODO CLARO / OSCURO
   Lo usan todas las páginas. El tema inicial lo aplica antes un
   pequeño script en <head> (sin parpadeo); aquí se conecta el botón.
   ============================================================= */

import { temaInicial } from "./datos.js";

// Botón de modo claro/oscuro. La elección se guarda en el navegador del visitante;
// si nunca eligió, la página sigue al sistema (también si este cambia mientras está abierta).
export function activarTema() {
  const raiz = document.documentElement;
  const boton = document.querySelector(".boton-tema");
  const sistema = window.matchMedia("(prefers-color-scheme: dark)");
  let guardado = null;
  try {
    guardado = localStorage.getItem("tema");
  } catch {}
  const aplicar = (tema) => {
    raiz.dataset.theme = tema;
    boton?.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => (m.content = tema === "dark" ? "#0c0c0e" : "#fafafa"));
  };
  aplicar(temaInicial(guardado, sistema.matches));
  boton?.addEventListener("click", () => {
    const nuevo = raiz.dataset.theme === "dark" ? "light" : "dark";
    aplicar(nuevo);
    try {
      localStorage.setItem("tema", nuevo);
    } catch {}
  });
  sistema.addEventListener("change", (e) => {
    let elegido = null;
    try {
      elegido = localStorage.getItem("tema");
    } catch {}
    if (!elegido) aplicar(e.matches ? "dark" : "light");
  });
}
