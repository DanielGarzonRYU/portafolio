/* =============================================================
   "PREGÚNTALE A MI IA"
   Envía las preguntas a /api/chat (Claude, en Cloudflare).
   Si la IA no está disponible (sin internet, sin clave o abriendo
   el archivo directamente), responde en "modo básico" buscando
   en tus propios datos, así el chat nunca queda roto.
   ============================================================= */

(function () {
  const perfil = window.PERFIL || {};
  const proyectos = window.PROYECTOS || [];
  const historial = []; // { role: "user" | "assistant", content }
  let iaDisponible = location.protocol !== "file:";
  let ocupado = false;

  const nombreCorto = (perfil.nombre || "").split(" ")[0];
  const sugerencias = ["¿Qué proyectos tiene?", "¿Qué apps puedo descargar?", "¿Qué tecnologías maneja?", "¿Cómo lo contacto?"];

  /* ---------- Interfaz ---------- */
  const boton = document.createElement("button");
  boton.className = "chat-boton";
  boton.type = "button";
  boton.innerHTML = `${icono("chat")}Pregúntale a mi IA`;

  const panel = document.createElement("div");
  panel.className = "chat-panel oculto";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asistente con IA");
  panel.innerHTML = `
    <div class="chat-cabecera">
      <span class="monograma">${esc(perfil.iniciales || "IA")}</span>
      <div><strong>Asistente de ${esc(nombreCorto)}</strong><small id="chat-estado">Responde sobre mis proyectos</small></div>
      <button type="button" aria-label="Cerrar" data-cerrar>${icono("cerrar")}</button>
    </div>
    <div class="chat-mensajes" id="chat-mensajes" aria-live="polite"></div>
    <div class="sugerencias" id="chat-sugerencias">${sugerencias.map((s) => `<button type="button">${esc(s)}</button>`).join("")}</div>
    <form class="chat-form" id="chat-form">
      <input id="chat-entrada" autocomplete="off" maxlength="500" placeholder="Escribe tu pregunta…" aria-label="Tu pregunta">
      <button class="btn btn-primario btn-chico" type="submit" aria-label="Enviar">${icono("enviar")}</button>
    </form>
    <div class="chat-nota">Las respuestas las genera una IA y pueden contener errores.</div>`;

  document.body.append(boton, panel);
  const cajaMensajes = panel.querySelector("#chat-mensajes");
  const entrada = panel.querySelector("#chat-entrada");

  agregarMensaje("bot", `¡Hola! Soy el asistente de ${nombreCorto}. Pregúntame qué hace cada proyecto, para qué sirve o cómo descargarlo.`);

  function abrir(pregunta) {
    panel.classList.remove("oculto");
    boton.classList.add("oculto");
    if (pregunta) enviar(pregunta);
    else entrada.focus();
  }
  function cerrar() {
    panel.classList.add("oculto");
    boton.classList.remove("oculto");
  }

  boton.addEventListener("click", () => abrir());
  panel.querySelector("[data-cerrar]").addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrar());
  document.addEventListener("click", (e) => {
    const disparador = e.target.closest("[data-abrir-chat]");
    if (disparador) abrir(disparador.dataset.pregunta);
  });
  panel.querySelector("#chat-sugerencias").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") enviar(e.target.textContent);
  });
  panel.querySelector("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    enviar(entrada.value);
  });

  // Convierte el texto en HTML seguro y los [[id-proyecto]] en enlaces
  function formatear(texto) {
    return esc(texto).replace(/\[\[([a-z0-9-]+)\]\]/g, (_, id) => {
      const p = proyectos.find((x) => x.id === id);
      return p ? `<a href="proyecto.html?id=${id}">${esc(p.nombre)}</a>` : id;
    });
  }

  function agregarMensaje(quien, texto) {
    const div = document.createElement("div");
    div.className = `msg ${quien}`;
    div.innerHTML = quien === "bot" ? formatear(texto) : esc(texto);
    cajaMensajes.appendChild(div);
    cajaMensajes.scrollTop = cajaMensajes.scrollHeight;
    return div;
  }

  async function enviar(texto) {
    texto = (texto || "").trim();
    if (!texto || ocupado) return;
    ocupado = true;
    entrada.value = "";
    panel.querySelector("#chat-sugerencias").classList.add("oculto");
    agregarMensaje("yo", texto);
    historial.push({ role: "user", content: texto });
    const pensando = agregarMensaje("bot escribiendo", "Escribiendo…");

    let respuesta = null;
    if (iaDisponible) respuesta = await preguntarIA();
    if (!respuesta) {
      iaDisponible = false;
      panel.querySelector("#chat-estado").textContent = "Modo básico (sin IA)";
      respuesta = respuestaLocal(texto);
    }

    pensando.remove();
    agregarMensaje("bot", respuesta);
    historial.push({ role: "assistant", content: respuesta });
    ocupado = false;
    entrada.focus();
  }

  async function preguntarIA() {
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historial.slice(-10) }),
      });
      if (r.status === 429) return "Estoy recibiendo muchas preguntas en este momento. Intenta de nuevo en un minuto.";
      if (!r.ok) return null;
      const datos = await r.json();
      return datos.respuesta || null;
    } catch {
      return null;
    }
  }

  /* ---------- Modo básico: búsqueda en tus datos ---------- */
  function normalizar(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  const vacias = new Set("que cual cuales como para por con los las del una uno unos unas este esta esto tiene tienes hay hace hacen sobre sus mis tus puedo puede quiero donde cuando proyecto proyectos".split(" "));

  function respuestaLocal(pregunta) {
    const q = normalizar(pregunta);
    const c = perfil.contacto || {};
    const lista = (ps) => ps.map((p) => `• [[${p.id}]]: ${p.resumen}`).join("\n");

    if (/contact|correo|email|mail|whats|escrib|linkedin|llamar/.test(q)) {
      const formas = [c.email && `Correo: ${c.email}`, c.whatsapp && `WhatsApp: +${c.whatsapp}`, c.linkedin && `LinkedIn: ${c.linkedin}`, c.github && `GitHub: ${c.github}`].filter(Boolean);
      return formas.length ? `Puedes contactar a ${nombreCorto} por:\n${formas.join("\n")}` : "Encontrarás sus datos en la sección Contacto de la página.";
    }
    if (/tecnolog|habilidad|lenguaje|sabe|maneja|conoce|stack/.test(q)) {
      const grupos = Object.entries(perfil.habilidades || {}).map(([g, i]) => `${g}: ${i.join(", ")}`);
      return `${nombreCorto} trabaja con:\n${grupos.join("\n")}`;
    }
    if (/descarg|apk|instal|bajar/.test(q)) {
      const conDescarga = proyectos.filter((p) => (p.descargas || []).length);
      return conDescarga.length
        ? `Estos proyectos tienen descarga disponible:\n${lista(conDescarga)}\n\nCada descarga muestra su huella SHA-256 para que verifiques que el archivo es original.`
        : "Por ahora no hay archivos para descargar.";
    }
    if (/quien|sobre (el|ti)|estudi|universidad|present/.test(q)) {
      return `${perfil.nombre} — ${perfil.titulo}.\n${(perfil.sobreMi || []).join(" ")}`;
    }

    const palabras = q.split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !vacias.has(w));
    const puntuados = proyectos
      .map((p) => {
        const texto = normalizar([p.nombre, p.tipo, p.resumen, p.utilidad, ...(p.descripcion || []), ...(p.tecnologias || []), ...(p.funciones || [])].join(" "));
        const nombre = normalizar(p.nombre);
        const puntos = palabras.reduce((s, w) => s + (nombre.includes(w) ? 3 : texto.includes(w) ? 1 : 0), 0);
        return { p, puntos };
      })
      .filter((x) => x.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos);

    if (puntuados.length === 1 || (puntuados.length && puntuados[0].puntos >= 3)) {
      const p = puntuados[0].p;
      return `[[${p.id}]] (${p.tipo})\n${p.resumen}\n\nPara qué sirve: ${p.utilidad}`;
    }
    if (puntuados.length) return `Encontré estos proyectos relacionados:\n${lista(puntuados.slice(0, 4).map((x) => x.p))}`;
    return `Estos son los proyectos de ${nombreCorto}:\n${lista(proyectos)}\n\nPregúntame por cualquiera de ellos.`;
  }
})();
