import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SITIO_POR_DEFECTO,
  normalizarWhatsapp,
  enlaceWhatsapp,
  urlSegura,
  rutaMedia,
  normalizarSitio,
  normalizarProyecto,
  normalizarProyectos,
  dominio,
  iniciales,
  logoTecnologia,
  temaInicial,
  telefonoLegible,
  progresoContener,
  progresoEntrada,
} from "../sitio/js/datos.js";

test("normalizarWhatsapp deja solo dígitos y agrega 57 a celulares colombianos", () => {
  assert.equal(normalizarWhatsapp("573102165848"), "573102165848");
  assert.equal(normalizarWhatsapp("310 216 5848"), "573102165848");
  assert.equal(normalizarWhatsapp("+57 310-216-5848"), "573102165848");
  assert.equal(normalizarWhatsapp(573102165848), "573102165848");
  assert.equal(normalizarWhatsapp(""), "");
  assert.equal(normalizarWhatsapp(null), "");
});

test("enlaceWhatsapp arma wa.me con el mensaje codificado", () => {
  assert.equal(
    enlaceWhatsapp("573102165848", "Hola Cesar, vi tu portafolio"),
    "https://wa.me/573102165848?text=Hola%20Cesar%2C%20vi%20tu%20portafolio"
  );
  assert.equal(enlaceWhatsapp("573102165848", ""), "https://wa.me/573102165848");
  assert.equal(enlaceWhatsapp("", "Hola"), "");
});

test("urlSegura agrega https y descarta esquemas peligrosos", () => {
  assert.equal(urlSegura("https://kaf-frontend.onrender.com"), "https://kaf-frontend.onrender.com");
  assert.equal(urlSegura("http://ejemplo.com"), "http://ejemplo.com");
  assert.equal(urlSegura("kaf-frontend.onrender.com"), "https://kaf-frontend.onrender.com");
  assert.equal(urlSegura("  kaf.com/tienda  "), "https://kaf.com/tienda");
  assert.equal(urlSegura("javascript:alert(1)"), "");
  assert.equal(urlSegura("JAVASCRIPT:alert(1)"), "");
  assert.equal(urlSegura("data:text/html,hola"), "");
  assert.equal(urlSegura(""), "");
  assert.equal(urlSegura(null), "");
});

test("rutaMedia convierte rutas relativas en absolutas", () => {
  assert.equal(rutaMedia("/media/kaf.mp4"), "/media/kaf.mp4");
  assert.equal(rutaMedia("media/kaf.mp4"), "/media/kaf.mp4");
  assert.equal(rutaMedia("./media/kaf.mp4"), "/media/kaf.mp4");
  assert.equal(rutaMedia("https://cdn.ejemplo.com/v.mp4"), "https://cdn.ejemplo.com/v.mp4");
  assert.equal(rutaMedia("javascript:alert(1)"), "");
  assert.equal(rutaMedia(""), "");
  assert.equal(rutaMedia(undefined), "");
});

test("normalizarSitio usa los valores por defecto cuando faltan datos", () => {
  assert.deepEqual(normalizarSitio(null), SITIO_POR_DEFECTO);
  assert.deepEqual(normalizarSitio({ nombre: "", frase: null }), SITIO_POR_DEFECTO);
  const sitio = normalizarSitio({ nombre: "  Otro Nombre ", whatsapp: "310 216 5848" });
  assert.equal(sitio.nombre, "Otro Nombre");
  assert.equal(sitio.whatsapp, "573102165848");
  assert.equal(sitio.correo, "ccdgarzon@gmail.com");
});

test("SITIO_POR_DEFECTO tiene los datos acordados", () => {
  assert.deepEqual(SITIO_POR_DEFECTO, {
    nombre: "Cesar Daniel Cristancho Garzón",
    frase: "Páginas web y apps que trabajan para tu negocio.",
    whatsapp: "573102165848",
    mensaje_whatsapp: "Hola Cesar, vi tu portafolio y me interesa un proyecto",
    correo: "ccdgarzon@gmail.com",
  });
});

test("normalizarProyecto exige nombre y frase", () => {
  assert.equal(normalizarProyecto(null), null);
  assert.equal(normalizarProyecto("texto"), null);
  assert.equal(normalizarProyecto({ nombre: "KAF" }), null);
  assert.equal(normalizarProyecto({ frase: "Algo" }), null);
  assert.equal(normalizarProyecto({ nombre: "  ", frase: "Algo" }), null);
});

test("normalizarProyecto trata igual vacío, null y ausente", () => {
  const minimo = { nombre: "KAF", frase: "Tienda en línea." };
  const esperado = {
    nombre: "KAF",
    tipo: "",
    frase: "Tienda en línea.",
    logros: [],
    video: "",
    portada: "",
    enlace: "",
    nota_enlace: "",
    tecnologias: [],
  };
  assert.deepEqual(normalizarProyecto(minimo), esperado);
  assert.deepEqual(
    normalizarProyecto({ ...minimo, tipo: "", logros: null, video: "", portada: null, enlace: "", nota_enlace: null, tecnologias: "" }),
    esperado
  );
});

test("normalizarProyecto limpia listas y rutas", () => {
  const p = normalizarProyecto({
    nombre: " KAF ",
    frase: "Tienda.",
    logros: ["Uno", "", "  Dos  ", null, 3],
    tecnologias: ["React", ""],
    video: "media/kaf.mp4",
    portada: "/media/kaf.jpg",
    enlace: "kaf-frontend.onrender.com",
  });
  assert.equal(p.nombre, "KAF");
  assert.deepEqual(p.logros, ["Uno", "Dos", "3"]);
  assert.deepEqual(p.tecnologias, ["React"]);
  assert.equal(p.video, "/media/kaf.mp4");
  assert.equal(p.portada, "/media/kaf.jpg");
  assert.equal(p.enlace, "https://kaf-frontend.onrender.com");
});

test("normalizarProyectos acepta objeto o lista y descarta inválidos", () => {
  const valido = { nombre: "KAF", frase: "Tienda." };
  assert.equal(normalizarProyectos({ proyectos: [valido, { nombre: "Sin frase" }] }).length, 1);
  assert.equal(normalizarProyectos([valido, valido]).length, 2);
  assert.deepEqual(normalizarProyectos(null), []);
  assert.deepEqual(normalizarProyectos({ proyectos: "no es lista" }), []);
});

import { readFileSync } from "node:fs";

const leerJSON = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), "utf8"));

test("sitio.json real tiene todos los datos, sin depender de los valores por defecto", () => {
  const crudo = leerJSON("../sitio/datos/sitio.json");
  for (const clave of Object.keys(SITIO_POR_DEFECTO)) {
    assert.ok(typeof crudo[clave] === "string" && crudo[clave].trim(), `falta "${clave}" en sitio.json`);
  }
  assert.equal(normalizarSitio(crudo).whatsapp, "573102165848");
});

test("proyectos.json real: KAF completo y nada se pierde al limpiar", () => {
  const crudo = leerJSON("../sitio/datos/proyectos.json");
  assert.ok(Array.isArray(crudo.proyectos));
  const proyectos = normalizarProyectos(crudo);
  assert.equal(proyectos.length, crudo.proyectos.length, "algún proyecto no tiene nombre o frase");
  const kaf = proyectos[0];
  assert.equal(kaf.enlace, "https://kaf-frontend.onrender.com");
  assert.equal(kaf.logros.length, 3);
  assert.equal(kaf.video, "/media/kaf.mp4");
  assert.equal(kaf.portada, "/media/kaf.jpg");
});

test(".pages.yml usa exactamente las claves que lee la página", () => {
  const yml = readFileSync(new URL("../.pages.yml", import.meta.url), "utf8");
  const nombres = [...yml.matchAll(/^\s*- name: (\w+)/gm)].map((m) => m[1]);
  for (const clave of Object.keys(SITIO_POR_DEFECTO)) assert.ok(nombres.includes(clave), `falta ${clave}`);
  for (const clave of ["nombre", "tipo", "frase", "logros", "video", "portada", "enlace", "nota_enlace", "tecnologias"]) {
    assert.ok(nombres.includes(clave), `falta ${clave}`);
  }
  assert.match(yml, /input: sitio\/media/);
  assert.match(yml, /output: \/media/);
});

test("los textos visibles no usan raya larga ni semirraya", () => {
  for (const ruta of ["../sitio/datos/sitio.json", "../sitio/datos/proyectos.json", "../sitio/index.html", "../sitio/legal.html"]) {
    const contenido = readFileSync(new URL(ruta, import.meta.url), "utf8");
    assert.doesNotMatch(contenido, /[—–]/, `${ruta} tiene una raya larga`);
  }
});

test("dominio muestra solo el host del enlace, sin www", () => {
  assert.equal(dominio("https://kaf-frontend.onrender.com"), "kaf-frontend.onrender.com");
  assert.equal(dominio("https://www.ejemplo.com/tienda?x=1"), "ejemplo.com");
  assert.equal(dominio(""), "");
  assert.equal(dominio("no es una url"), "");
});

test("iniciales toma nombre y primer apellido", () => {
  assert.equal(iniciales("Cesar Daniel Cristancho Garzón"), "CC");
  assert.equal(iniciales("Ana Gómez"), "AG");
  assert.equal(iniciales("ana maría gómez"), "AG");
  assert.equal(iniciales("Prince"), "P");
  assert.equal(iniciales(""), "");
});

test("logoTecnologia reconoce nombres comunes como se escriben en el panel", () => {
  assert.equal(logoTecnologia("React"), "/iconos/tec/react.svg");
  assert.equal(logoTecnologia("Node.js"), "/iconos/tec/nodedotjs.svg");
  assert.equal(logoTecnologia("node js"), "/iconos/tec/nodedotjs.svg");
  assert.equal(logoTecnologia("PostgreSQL"), "/iconos/tec/postgresql.svg");
  assert.equal(logoTecnologia(" HTML "), "/iconos/tec/html5.svg");
  assert.equal(logoTecnologia("Algo raro"), "");
  assert.equal(logoTecnologia(""), "");
});

test("temaInicial respeta la elección guardada y si no, el sistema", () => {
  assert.equal(temaInicial("dark", false), "dark");
  assert.equal(temaInicial("light", true), "light");
  assert.equal(temaInicial(null, true), "dark");
  assert.equal(temaInicial(null, false), "light");
  assert.equal(temaInicial("basura", true), "dark");
});

test("la política de datos existe, está enlazada desde el pie y cita la Ley 1581", () => {
  const inicio = readFileSync(new URL("../sitio/index.html", import.meta.url), "utf8");
  assert.match(inicio, /href="\/legal"/);
  const legal = readFileSync(new URL("../sitio/legal.html", import.meta.url), "utf8");
  for (const texto of ["Ley 1581 de 2012", "ccdgarzon@gmail.com", "Superintendencia de Industria y Comercio", "cookies"]) {
    assert.ok(legal.includes(texto), `falta "${texto}" en legal.html`);
  }
});

test("telefonoLegible formatea celulares colombianos", () => {
  assert.equal(telefonoLegible("573102165848"), "+57 310 216 5848");
  assert.equal(telefonoLegible("3102165848"), "+57 310 216 5848");
  assert.equal(telefonoLegible("+1 555 123 4567"), "+15551234567");
  assert.equal(telefonoLegible(""), "");
});

test("progresoContener: avance mientras una sección alta queda fija (rango contain de CSS)", () => {
  // sección de 2520 px que empieza en y=0, ventana de 900 px → recorrido de 1620 px
  assert.equal(progresoContener({ scrollY: 0, inicio: 0, alto: 2520, ventana: 900 }), 0);
  assert.equal(progresoContener({ scrollY: 810, inicio: 0, alto: 2520, ventana: 900 }), 0.5);
  assert.equal(progresoContener({ scrollY: 5000, inicio: 0, alto: 2520, ventana: 900 }), 1);
  assert.equal(progresoContener({ scrollY: 0, inicio: 300, alto: 2520, ventana: 900 }), 0);
});

test("progresoEntrada: avance de un elemento que entra por abajo (rango entry X% → cover Y%)", () => {
  // elemento de 100 px; ventana de 1000 px; rango entry 0% → cover 50% = 550 px de recorrido
  const base = { alto: 100, ventana: 1000, desdeEntrada: 0, hastaCubierto: 0.5 };
  assert.equal(progresoEntrada({ ...base, arriba: 1000 }), 0);   // asoma por abajo
  assert.equal(progresoEntrada({ ...base, arriba: 725 }), 0.5);
  assert.equal(progresoEntrada({ ...base, arriba: 450 }), 1);
  assert.equal(progresoEntrada({ ...base, arriba: 2000 }), 0);
  // entry 5% desplaza el inicio un 5% del alto del elemento
  assert.equal(progresoEntrada({ ...base, desdeEntrada: 0.05, arriba: 995 }), 0);
});
