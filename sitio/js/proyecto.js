/* Página de detalle de un proyecto: proyecto.html?id=... */

(function () {
  const perfil = window.PERFIL || {};
  const id = new URLSearchParams(location.search).get("id");
  const p = (window.PROYECTOS || []).find((x) => x.id === id);
  const main = document.getElementById("contenido");

  if (!p) {
    document.title = `Proyecto no encontrado · ${perfil.nombre}`;
    main.innerHTML = `
      <div class="contenedor seccion">
        <div class="vacio">
          <h2>Proyecto no encontrado</h2>
          <p>Es posible que el enlace esté incompleto o que el proyecto ya no esté publicado.</p>
          <a class="btn btn-primario" href="index.html#proyectos">Ver todos los proyectos</a>
        </div>
      </div>`;
    return;
  }

  document.title = `${p.nombre} · ${perfil.nombre}`;
  const descargas = (p.descargas || []).filter((d) => d.archivo);
  const hayDemo = p.demo && p.demo.url;
  const enlaces = p.enlaces || {};
  const lista = (items) => `<ul class="lista">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

  /* ---------- Botones principales ---------- */
  const acciones = [];
  if (hayDemo) acciones.push(`<a class="btn btn-primario" href="#demo">${icono("play")}Probar demo</a>`);
  if (descargas.some((d) => d.url)) acciones.push(`<a class="btn ${hayDemo ? "btn-secundario" : "btn-primario"}" href="#descargas">${icono("descarga")}Descargar</a>`);
  if (enlaces.web) acciones.push(`<a class="btn btn-secundario" href="${esc(enlaces.web)}" target="_blank" rel="noopener">${icono("externo")}Abrir sitio</a>`);
  if (enlaces.codigo) acciones.push(`<a class="btn btn-secundario" href="${esc(enlaces.codigo)}" target="_blank" rel="noopener">${icono("codigo")}Código fuente</a>`);

  /* ---------- Demo en vivo ---------- */
  function demoHTML() {
    if (!hayDemo) return "";
    const url = esc(p.demo.url);
    let cuerpo;
    if (p.demo.tipo === "video") {
      cuerpo = `<div class="video"><iframe src="${url}" title="Video de ${esc(p.nombre)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    } else if (p.demo.tipo === "movil") {
      cuerpo = `<div class="demo-movil"><div class="celular"><iframe src="${url}" title="Demo de ${esc(p.nombre)}" loading="lazy"></iframe></div></div>
                <p style="margin-top:10px;font-size:14px"><a href="${url}" target="_blank" rel="noopener">Abrir la demo en pantalla completa ${icono("externo")}</a></p>`;
    } else {
      cuerpo = `<div class="demo-marco">
                  <div class="demo-barra"><span class="puntos"><i></i><i></i><i></i></span><span>${esc(p.nombre)}</span>
                    <a href="${url}" target="_blank" rel="noopener">Abrir en pestaña nueva ${icono("externo")}</a></div>
                  <iframe src="${url}" title="Demo de ${esc(p.nombre)}" loading="lazy"></iframe>
                </div>`;
    }
    return `<section class="bloque" id="demo"><h2>Demo en vivo</h2><p style="color:var(--texto-suave)">Pruébalo aquí mismo, sin instalar nada.</p>${cuerpo}</section>`;
  }

  /* ---------- Descargas verificadas ---------- */
  function descargaHTML(d, i) {
    const hashValido = /^[a-f0-9]{64}$/i.test(d.sha256 || "");
    const sello = hashValido
      ? `<div class="sello ok">${icono("escudo")}Descarga verificable (SHA-256)</div>`
      : `<div class="sello pendiente">${icono("alerta")}Huella digital no publicada</div>`;
    const datos = [d.version && `Versión ${esc(d.version)}`, d.tamano && esc(d.tamano), d.fecha && formatoFecha(d.fecha)].filter(Boolean).join(" · ");
    const boton = d.url
      ? `<a class="btn btn-primario" href="${esc(d.url)}" data-descarga download>${icono("descarga")}Descargar</a>`
      : `<span class="btn btn-secundario deshabilitado">Próximamente</span>`;
    return `
      <div class="descarga">
        ${sello}
        <div class="nombre-archivo">${icono("archivo")} ${esc(d.archivo)}</div>
        <div class="datos">${datos}</div>
        ${hashValido ? `<div class="hash"><code title="${esc(d.sha256)}">${esc(d.sha256.toLowerCase())}</code><button type="button" data-copiar="${i}">Copiar</button></div>` : ""}
        ${boton}
      </div>`;
  }

  function descargasHTML() {
    if (!descargas.length) return "";
    const conHash = descargas.some((d) => /^[a-f0-9]{64}$/i.test(d.sha256 || ""));
    return `
      <div class="panel" id="descargas">
        <h3>Descargas</h3>
        ${descargas.map(descargaHTML).join("")}
        ${conHash ? `
        <h3 style="margin-top:20px">Verificar un archivo descargado</h3>
        <label class="verificador" id="verificador">
          <input type="file" id="archivo-verificar">
          Arrastra aquí el archivo descargado o <strong style="color:var(--acento)">haz clic para elegirlo</strong>.
          <br><small>Se revisa en tu equipo; el archivo no se sube a ningún lado.</small>
        </label>
        <div id="resultado-verificacion"></div>
        <details class="ayuda">
          <summary>¿Qué es esto y cómo verificar a mano?</summary>
          <p>La huella SHA-256 es como la “huella digital” del archivo: si alguien lo modifica, aunque sea un poco, la huella cambia. Si coincide con la publicada aquí, el archivo es exactamente el original.</p>
          <p>Windows (PowerShell):</p><pre>Get-FileHash .\\nombre-del-archivo -Algorithm SHA256</pre>
          <p>macOS / Linux:</p><pre>shasum -a 256 nombre-del-archivo</pre>
        </details>` : ""}
      </div>`;
  }

  /* ---------- Ficha técnica ---------- */
  const filasFicha = [
    ["Tipo", p.tipo],
    ["Estado", p.estado],
    ["Plataforma", p.plataforma],
    ["Versión", (p.versiones || [])[0]?.version],
    ["Publicado", formatoFecha(p.fecha)],
  ].filter(([, v]) => v);

  /* ---------- Página completa ---------- */
  main.innerHTML = `
    <div class="cabecera-proyecto">
      <div class="contenedor">
        <nav class="migas"><a href="index.html#proyectos">${icono("flecha")} Todos los proyectos</a></nav>
        <div class="meta" style="margin-top:18px">
          <span class="insignia">${icono(iconoTipo(p.tipo))}${esc(p.tipo)}</span>
          ${p.estado ? `<span class="insignia ${claseEstado(p.estado)}">${esc(p.estado)}</span>` : ""}
        </div>
        <h1>${esc(p.nombre)}</h1>
        <p class="resumen">${esc(p.resumen)}</p>
        <div class="acciones">${acciones.join("")}</div>
        <div class="estadisticas" id="estadisticas"></div>
      </div>
    </div>

    <div class="contenedor detalle">
      <div>
        <section class="bloque">
          <h2>¿Qué hace?</h2>
          ${(p.descripcion || []).map((t) => `<p>${esc(t)}</p>`).join("")}
        </section>

        ${p.utilidad || (p.casosDeUso || []).length ? `
        <section class="bloque">
          <h2>¿Para qué sirve?</h2>
          ${p.utilidad ? `<div class="destacado-util">${esc(p.utilidad)}</div>` : ""}
          ${(p.casosDeUso || []).length ? `<p><strong>Ejemplos de uso:</strong></p>${lista(p.casosDeUso)}` : ""}
        </section>` : ""}

        ${(p.funciones || []).length ? `<section class="bloque"><h2>Funcionalidades</h2>${lista(p.funciones)}</section>` : ""}

        ${demoHTML()}

        ${(p.capturas || []).length ? `
        <section class="bloque">
          <h2>Capturas de pantalla</h2>
          <div class="capturas">${p.capturas.map((c) => `<a href="${esc(c)}" target="_blank" rel="noopener"><img src="${esc(c)}" alt="Captura de ${esc(p.nombre)}" loading="lazy"></a>`).join("")}</div>
        </section>` : ""}

        ${(p.versiones || []).length ? `
        <section class="bloque">
          <h2>Historial de versiones</h2>
          <ul class="versiones">
            ${p.versiones.map((v) => `<li><div class="cab"><strong>Versión ${esc(v.version)}</strong><span>${formatoFecha(v.fecha)}</span></div>${lista(v.cambios || [])}</li>`).join("")}
          </ul>
        </section>` : ""}
      </div>

      <aside>
        ${descargasHTML()}
        <div class="panel">
          <h3>Ficha técnica</h3>
          <dl class="ficha">${filasFicha.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          ${(p.tecnologias || []).length ? `<h3 style="margin-top:18px">Tecnologías</h3><div class="etiquetas">${p.tecnologias.map((t) => `<span class="etiqueta">${esc(t)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="panel">
          <h3>¿Tienes preguntas sobre este proyecto?</h3>
          <p style="font-size:14px;color:var(--texto-suave)">El asistente con IA conoce todos mis proyectos.</p>
          <button class="btn btn-secundario" type="button" data-abrir-chat data-pregunta="¿Qué hace ${esc(p.nombre)} y para qué me sirve?">${icono("chat")}Preguntar a la IA</button>
        </div>
      </aside>
    </div>`;

  /* ---------- Interacciones ---------- */
  main.addEventListener("click", (e) => {
    const copiar = e.target.closest("[data-copiar]");
    if (copiar) {
      const hash = descargas[+copiar.dataset.copiar].sha256.toLowerCase();
      navigator.clipboard?.writeText(hash).then(() => avisar("Huella SHA-256 copiada"), () => avisar("No se pudo copiar"));
    }
    if (e.target.closest("[data-descarga]")) Contador.registrar(p.id, "descarga");
  });

  const verificador = document.getElementById("verificador");
  if (verificador) {
    const entrada = document.getElementById("archivo-verificar");
    entrada.addEventListener("change", () => entrada.files[0] && verificar(entrada.files[0]));
    ["dragenter", "dragover"].forEach((ev) => verificador.addEventListener(ev, (e) => { e.preventDefault(); verificador.classList.add("encima"); }));
    ["dragleave", "drop"].forEach((ev) => verificador.addEventListener(ev, () => verificador.classList.remove("encima")));
    verificador.addEventListener("drop", (e) => { e.preventDefault(); e.dataTransfer.files[0] && verificar(e.dataTransfer.files[0]); });
  }

  async function verificar(archivo) {
    const caja = document.getElementById("resultado-verificacion");
    const mostrar = (clase, html) => (caja.innerHTML = `<div class="resultado-verificacion ${clase}">${html}</div>`);
    if (!(window.crypto && crypto.subtle)) return mostrar("mal", "Tu navegador no permite verificar archivos. Usa el método manual de abajo.");
    mostrar("info", `Calculando la huella de <strong>${esc(archivo.name)}</strong>…`);
    try {
      const resumen = await crypto.subtle.digest("SHA-256", await archivo.arrayBuffer());
      const hash = [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, "0")).join("");
      const original = descargas.find((d) => (d.sha256 || "").toLowerCase() === hash);
      if (original) mostrar("ok", `${icono("escudo")} <strong>Archivo auténtico.</strong> Coincide exactamente con ${esc(original.archivo)}${original.version ? ` (versión ${esc(original.version)})` : ""}.`);
      else mostrar("mal", `${icono("alerta")} <strong>No coincide.</strong> Este archivo no es igual a ninguna descarga publicada aquí. Si lo obtuviste de otra fuente, no lo instales.<br><small>Huella calculada: ${hash}</small>`);
    } catch {
      mostrar("mal", "No se pudo leer el archivo.");
    }
  }

  /* ---------- Contadores ---------- */
  Contador.registrar(p.id, "visita");
  Contador.obtener([p.id]).then((datos) => {
    const c = datos && datos[p.id];
    if (!c) return;
    document.getElementById("estadisticas").innerHTML =
      `<span>${icono("ojo")}${formatoNumero(c.visitas)} ${c.visitas === 1 ? "visita" : "visitas"}</span>` +
      (descargas.length ? `<span>${icono("descarga")}${formatoNumero(c.descargas)} ${c.descargas === 1 ? "descarga" : "descargas"}</span>` : "");
  });

  if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 50);
})();
