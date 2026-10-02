/* Página de inicio: portada, catálogo de proyectos, sobre mí y contacto. */

(function () {
  const perfil = window.PERFIL || {};
  const proyectos = proyectosOrdenados();
  let filtroActivo = "Todos";
  let textoBusqueda = "";
  let conteos = null;

  document.title = `${perfil.nombre} · Portafolio de proyectos`;
  document.getElementById("titulo").textContent = perfil.titulo || "";
  document.getElementById("presentacion").textContent = perfil.presentacion || "";
  document.getElementById("cifra-proyectos").textContent = proyectos.length;

  /* ---------- Filtros ---------- */
  const tipos = ["Todos", ...new Set(proyectos.map((p) => p.tipo).filter(Boolean))];
  const cajaFiltros = document.getElementById("filtros");
  cajaFiltros.innerHTML = tipos
    .map((t) => `<button type="button" class="filtro${t === filtroActivo ? " activo" : ""}" data-tipo="${esc(t)}">${esc(t)}</button>`)
    .join("");
  cajaFiltros.addEventListener("click", (e) => {
    const boton = e.target.closest(".filtro");
    if (!boton) return;
    filtroActivo = boton.dataset.tipo;
    cajaFiltros.querySelectorAll(".filtro").forEach((b) => b.classList.toggle("activo", b === boton));
    pintarProyectos();
  });
  document.getElementById("buscar").addEventListener("input", (e) => {
    textoBusqueda = normalizar(e.target.value);
    pintarProyectos();
  });

  function normalizar(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }

  function coincide(p) {
    if (filtroActivo !== "Todos" && p.tipo !== filtroActivo) return false;
    if (!textoBusqueda) return true;
    const texto = normalizar(
      [p.nombre, p.tipo, p.resumen, p.utilidad, ...(p.tecnologias || []), ...(p.funciones || []), ...(p.descripcion || [])].join(" ")
    );
    return textoBusqueda.split(/\s+/).every((palabra) => texto.includes(palabra));
  }

  /* ---------- Tarjetas ---------- */
  function tarjeta(p) {
    const enlace = `proyecto.html?id=${encodeURIComponent(p.id)}`;
    const descarga = (p.descargas || []).find((d) => d.url);
    const c = conteos && conteos[p.id];
    const estadisticas = c
      ? `<div class="estadisticas">
           <span title="Visitas">${icono("ojo")}${formatoNumero(c.visitas)}</span>
           ${(p.descargas || []).length ? `<span title="Descargas">${icono("descarga")}${formatoNumero(c.descargas)}</span>` : ""}
         </div>`
      : `<div class="estadisticas"></div>`;

    let botonSecundario = "";
    if (p.demo && p.demo.url) botonSecundario = `<a class="btn btn-secundario btn-chico" href="${enlace}#demo">${icono("play")}Probar</a>`;
    else if (descarga) botonSecundario = `<a class="btn btn-secundario btn-chico" href="${enlace}#descargas">${icono("descarga")}Descargar</a>`;
    else if (p.enlaces && p.enlaces.web) botonSecundario = `<a class="btn btn-secundario btn-chico" href="${esc(p.enlaces.web)}" target="_blank" rel="noopener">${icono("externo")}Visitar</a>`;

    return `
      <article class="tarjeta">
        <a class="portada" href="${enlace}" tabindex="-1" aria-hidden="true">${portadaHTML(p)}</a>
        <div class="tarjeta-cuerpo">
          <div class="meta">
            <span class="insignia">${icono(iconoTipo(p.tipo))}${esc(p.tipo)}</span>
            ${p.estado ? `<span class="insignia ${claseEstado(p.estado)}">${esc(p.estado)}</span>` : ""}
          </div>
          <h3><a href="${enlace}">${esc(p.nombre)}</a></h3>
          <p class="resumen">${esc(p.resumen)}</p>
          ${p.utilidad ? `<div class="util"><strong>Para qué sirve:</strong> ${esc(p.utilidad)}</div>` : ""}
          <div class="etiquetas">${(p.tecnologias || []).map((t) => `<span class="etiqueta">${esc(t)}</span>`).join("")}</div>
          <div class="tarjeta-pie">
            ${estadisticas}
            ${botonSecundario}
            <a class="btn btn-primario btn-chico" href="${enlace}">Ver detalles</a>
          </div>
        </div>
      </article>`;
  }

  function pintarProyectos() {
    const visibles = proyectos.filter(coincide);
    document.getElementById("rejilla").innerHTML = visibles.length
      ? visibles.map(tarjeta).join("")
      : `<div class="vacio" style="grid-column:1/-1">No hay proyectos que coincidan con la búsqueda.</div>`;
  }

  /* ---------- Sobre mí ---------- */
  document.getElementById("sobre-texto").innerHTML = (perfil.sobreMi || []).map((t) => `<p>${esc(t)}</p>`).join("");
  document.getElementById("trayectoria").innerHTML = (perfil.trayectoria || [])
    .map((t) => `<li><div class="periodo">${esc(t.periodo)}</div><strong>${esc(t.titulo)}</strong><div>${esc(t.lugar)}</div></li>`)
    .join("");
  document.getElementById("habilidades").innerHTML = Object.entries(perfil.habilidades || {})
    .map(
      ([grupo, items]) => `
      <div class="grupo-habilidades">
        <h4>${esc(grupo)}</h4>
        <div class="etiquetas">${items.map((i) => `<span class="etiqueta">${esc(i)}</span>`).join("")}</div>
      </div>`
    )
    .join("");

  /* ---------- Contacto ---------- */
  const c = perfil.contacto || {};
  const contactos = [
    c.email && { icono: "correo", titulo: "Correo", detalle: c.email, url: `mailto:${c.email}` },
    c.whatsapp && { icono: "whatsapp", titulo: "WhatsApp", detalle: "Enviar mensaje", url: `https://wa.me/${c.whatsapp}` },
    c.linkedin && { icono: "linkedin", titulo: "LinkedIn", detalle: "Ver perfil", url: c.linkedin },
    c.github && { icono: "github", titulo: "GitHub", detalle: "Ver repositorios", url: c.github },
  ].filter(Boolean);
  document.getElementById("contactos").innerHTML = contactos
    .map(
      (x) => `<a class="contacto" href="${esc(x.url)}" target="_blank" rel="noopener">${icono(x.icono)}<span><strong>${esc(x.titulo)}</strong><small>${esc(x.detalle)}</small></span></a>`
    )
    .join("");

  pintarProyectos();

  /* ---------- Contadores ---------- */
  Contador.obtener(proyectos.map((p) => p.id)).then((datos) => {
    if (!datos) return;
    conteos = datos;
    const total = (campo) => Object.values(datos).reduce((s, x) => s + (x[campo] || 0), 0);
    document.getElementById("cifra-descargas").textContent = formatoNumero(total("descargas"));
    document.getElementById("cifra-visitas").textContent = formatoNumero(total("visitas"));
    document.getElementById("bloque-descargas").classList.remove("oculto");
    document.getElementById("bloque-visitas").classList.remove("oculto");
    pintarProyectos();
  });
})();
