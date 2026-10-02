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
    frase: "Desarrollo páginas web y apps para negocios.",
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
