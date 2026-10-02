# Portafolio para clientes — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `mi-WEB` en un portafolio de una sola página para clientes, con proyectos administrables desde un panel Pages CMS y publicación automática en Cloudflare Pages.

**Architecture:** Sitio estático (HTML + CSS + JS en módulos ES, sin framework ni compilación) en `sitio/`. La página lee `datos/sitio.json` y `datos/proyectos.json`. Las funciones puras que limpian esos datos viven en `js/datos.js` y se prueban con `node --test`. `js/app.js` solo dibuja el DOM. Pages CMS edita los JSON y sube los videos al repositorio de GitHub, y Cloudflare Pages publica cada commit.

**Tech Stack:** HTML/CSS/JavaScript (ES modules), Node 24 (`node:test`, solo para pruebas), Wrangler 4 (servidor local), Pages CMS, GitHub, Cloudflare Pages. Herramientas temporales para el video, instaladas en el scratchpad y no en el proyecto: `playwright`, `ffmpeg-static`.

**Spec:** `docs/superpowers/specs/2026-10-02-portafolio-clientes-design.md`

## Global Constraints

- Idioma de toda la interfaz y de los comentarios: español.
- Nombre que se muestra: `Cesar Daniel Cristancho Garzón`. El texto "Cesar Julián" no debe quedar en ningún archivo de `sitio/`.
- WhatsApp: `573102165848`. Mensaje predeterminado: `Hola Cesar, vi tu portafolio y me interesa un proyecto`.
- Correo de contacto: `ccdgarzon@gmail.com`.
- Frase de presentación: `Desarrollo páginas web y apps para negocios.`
- Sin dependencias en tiempo de ejecución. El único `devDependency` es `wrangler`.
- Todo texto que venga de JSON se inserta con `textContent` o atributos DOM, nunca con `innerHTML`.
- Los enlaces externos llevan `target="_blank"` y `rel="noopener"`.
- Video: H.264 MP4, 1280 px de ancho o menos, sin audio, **10 MB o menos** (objetivo: 1 a 2 MB).
- Las rutas de media se escriben como `/media/<archivo>` (Pages CMS usa `output: /media`).
- La página debe funcionar desde 360 px de ancho sin desplazamiento horizontal, en modo claro y oscuro.
- Git: firmar como `Cesar Daniel Cristancho Garzón <ccdgarzon@gmail.com>` (ya está configurado en el repo). Cada commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Campos vacíos tal como los guarda el panel.** Pages CMS puede guardar un campo opcional como `""`, como `null` o no guardarlo. En los tres casos el bloque se dibuja igual y sin ese elemento. Las pruebas están en la Tarea 2.
2. **WhatsApp escrito "a mano".** Si alguien guarda `310 216 5848`, `+57 310-216-5848` o el número como `number` de JSON, el enlace debe quedar `https://wa.me/573102165848`. Las pruebas están en la Tarea 2.
3. **Enlaces sin `https://` o peligrosos.** `kaf-frontend.onrender.com` se convierte en `https://kaf-frontend.onrender.com`. `javascript:alert(1)` se descarta y no se muestra botón. Las pruebas están en la Tarea 2.
4. **Rutas de media relativas o absolutas.** `media/kaf.mp4`, `./media/kaf.mp4` y `/media/kaf.mp4` deben resolver a `/media/kaf.mp4`. Las pruebas están en la Tarea 2.
5. **Textos largos en celular.** Un nombre de proyecto de 60 caracteres sin espacios, o 4 logros largos, no deben provocar desplazamiento horizontal a 360 px. La verificación visual está en la Tarea 4.

---

## Estructura de archivos (resultado final)

```
mi-WEB/
├─ .pages.yml                 Tarea 6 — esquema del panel
├─ .gitignore                 Tarea 1
├─ package.json               Tarea 1 — "type": "module", scripts dev/test
├─ wrangler.toml              Tarea 1 — sin KV
├─ LEEME.md                   Tarea 6
├─ tests/datos.test.js        Tareas 2 y 3
└─ sitio/
   ├─ index.html              Tarea 4
   ├─ css/estilos.css         Tarea 4
   ├─ js/datos.js             Tarea 2 — funciones puras (sin DOM)
   ├─ js/app.js               Tareas 4 y 5 — dibuja la página
   ├─ datos/sitio.json        Tarea 3
   ├─ datos/proyectos.json    Tarea 3
   └─ media/kaf.mp4, kaf.jpg  Tarea 5
```

---

### Task 1: Limpiar el sitio anterior y preparar el proyecto

**Files:**
- Delete: `functions/`, `herramientas/`, `.dev.vars.ejemplo`, `sitio/proyecto.html`, `sitio/demos/`, `sitio/js/chat.js`, `sitio/js/comun.js`, `sitio/js/config.js`, `sitio/js/inicio.js`, `sitio/js/proyecto.js`, `sitio/js/proyectos.js`
- Modify: `package.json`, `wrangler.toml`, `.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces: `npm test` corre `node --test tests/`; `npm run dev` sirve `sitio/` en `http://localhost:8788`; `"type": "module"` permite importar `sitio/js/datos.js` desde Node.

- [ ] **Step 1: Confirmar que el respaldo existe**

Run: `git log --oneline`
Expected: aparece `Respaldo del portafolio anterior antes del rediseño`. Si no aparece, DETENERSE: no borrar nada sin respaldo.

- [ ] **Step 2: Borrar lo que ya no se usa**

```bash
git rm -r -q functions herramientas .dev.vars.ejemplo sitio/proyecto.html sitio/demos sitio/js/chat.js sitio/js/comun.js sitio/js/config.js sitio/js/inicio.js sitio/js/proyecto.js sitio/js/proyectos.js
```

`sitio/index.html` y `sitio/css/estilos.css` se conservan porque la Tarea 4 los reescribe.

- [ ] **Step 3: Reescribir `package.json`**

```json
{
  "name": "mi-web",
  "private": true,
  "description": "Portafolio de proyectos de Cesar Daniel Cristancho Garzón",
  "type": "module",
  "scripts": {
    "dev": "wrangler pages dev",
    "test": "node --test tests/"
  },
  "devDependencies": {
    "wrangler": "^4.143.0"
  }
}
```

- [ ] **Step 4: Reescribir `wrangler.toml`**

```toml
# Configuración de Cloudflare Pages.
# Cloudflare publica la carpeta "sitio" tal cual, sin compilar nada.
name = "cesarcristancho"
pages_build_output_dir = "sitio"
compatibility_date = "2026-09-01"
```

- [ ] **Step 5: Actualizar `.gitignore`**

```
node_modules/
.wrangler/
.dev.vars
.playwright-mcp/
```

(Igual que antes. Confirmar que no falta ninguna línea.)

- [ ] **Step 6: Reinstalar dependencias y comprobar**

Run: `npm install`
Expected: termina sin errores, y `node_modules/@anthropic-ai` ya no existe (`ls node_modules/@anthropic-ai` falla).

Run: `npm test`
Expected: falla con un mensaje como "Could not find" o "no test files", porque `tests/` todavía no existe. Es lo esperado.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Quitar chat, contadores, descargas y página de detalle del sitio anterior

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Funciones puras para limpiar los datos (`datos.js`)

**Files:**
- Create: `sitio/js/datos.js`
- Test: `tests/datos.test.js`

**Interfaces:**
- Consumes: `"type": "module"` (Tarea 1).
- Produces (todas exportadas desde `sitio/js/datos.js`):
  - `SITIO_POR_DEFECTO: { nombre, frase, whatsapp, mensaje_whatsapp, correo }`, todos `string`.
  - `normalizarWhatsapp(numero: unknown): string`: solo dígitos. Antepone `57` a los celulares colombianos de 10 dígitos que empiezan por `3`.
  - `enlaceWhatsapp(numero: unknown, mensaje: unknown): string`: `https://wa.me/<dígitos>?text=<codificado>`, o `""` si no hay número.
  - `urlSegura(valor: unknown): string`: devuelve una URL `http(s)` o `""`.
  - `rutaMedia(valor: unknown): string`: devuelve `/ruta` o una URL `http(s)`, o `""`.
  - `normalizarSitio(raw: unknown): Sitio`: misma forma que `SITIO_POR_DEFECTO`.
  - `normalizarProyecto(raw: unknown): Proyecto | null`.
  - `normalizarProyectos(raw: unknown): Proyecto[]`: acepta `{ proyectos: [...] }` o `[...]`.
  - `Proyecto = { nombre, tipo, frase, logros: string[], video, portada, enlace, nota_enlace, tecnologias: string[] }`.

- [ ] **Step 1: Escribir las pruebas que fallan**

Crear `tests/datos.test.js`:

```js
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
```

- [ ] **Step 2: Correr las pruebas y ver que fallan**

Run: `npm test`
Expected: FAIL con `Cannot find module '.../sitio/js/datos.js'` (ERR_MODULE_NOT_FOUND).

- [ ] **Step 3: Implementar `sitio/js/datos.js`**

```js
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
```

- [ ] **Step 4: Correr las pruebas y ver que pasan**

Run: `npm test`
Expected: PASS, con `# pass 10` y `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add sitio/js/datos.js tests/datos.test.js
git commit -m "Agregar limpieza de datos del panel con pruebas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Datos iniciales (sitio y proyecto KAF)

**Files:**
- Create: `sitio/datos/sitio.json`, `sitio/datos/proyectos.json`
- Modify: `tests/datos.test.js` (agregar pruebas al final)

**Interfaces:**
- Consumes: `normalizarSitio`, `normalizarProyectos` (Tarea 2).
- Produces: `sitio.json` con las claves de `SITIO_POR_DEFECTO`; `proyectos.json` con la forma `{ "proyectos": [ Proyecto ] }`. Es la misma forma que usa `.pages.yml` en la Tarea 6.

- [ ] **Step 1: Escribir las pruebas que fallan**

Agregar al final de `tests/datos.test.js`:

```js
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
```

- [ ] **Step 2: Ver que fallan**

Run: `npm test`
Expected: FAIL con `ENOENT: no such file or directory ... sitio.json`.

- [ ] **Step 3: Crear `sitio/datos/sitio.json`**

```json
{
  "nombre": "Cesar Daniel Cristancho Garzón",
  "frase": "Desarrollo páginas web y apps para negocios.",
  "whatsapp": "573102165848",
  "mensaje_whatsapp": "Hola Cesar, vi tu portafolio y me interesa un proyecto",
  "correo": "ccdgarzon@gmail.com"
}
```

- [ ] **Step 4: Crear `sitio/datos/proyectos.json`**

```json
{
  "proyectos": [
    {
      "nombre": "KAF — Sandalias artesanales",
      "tipo": "Tienda en línea · 2026",
      "frase": "Catálogo en línea donde el dueño administra sus productos sin tocar código y los clientes piden por WhatsApp.",
      "logros": [
        "27 productos con galería de fotos",
        "Panel privado para agregar, editar y eliminar productos",
        "Pedidos directos a WhatsApp desde cada producto"
      ],
      "video": "/media/kaf.mp4",
      "portada": "/media/kaf.jpg",
      "enlace": "https://kaf-frontend.onrender.com",
      "nota_enlace": "Puede tardar unos segundos en abrir.",
      "tecnologias": ["React", "Node.js", "PostgreSQL"]
    }
  ]
}
```

- [ ] **Step 5: Ver que pasan**

Run: `npm test`
Expected: PASS, con `# pass 12` y `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add sitio/datos tests/datos.test.js
git commit -m "Agregar datos del sitio y proyecto KAF

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Página, estilos y dibujo de proyectos

**Files:**
- Modify (reescribir completo): `sitio/index.html`, `sitio/css/estilos.css`
- Create: `sitio/js/app.js`

**Interfaces:**
- Consumes: todo lo exportado por `datos.js` (Tarea 2) y los JSON (Tarea 3).
- Produces: `crearMedia(p)` dentro de `app.js`. La Tarea 5 le agrega la reproducción del video mediante `observarVideo(video)`, que en esta tarea queda definida como una función que solo muestra los controles.
- Contrato con el HTML:
  - `[data-nombre]` recibe el texto del nombre.
  - `#frase` recibe la frase.
  - `[data-whatsapp]` recibe `href`.
  - `[data-correo]` recibe `href` y texto.
  - `#lista-proyectos` es el contenedor de los bloques.
  - `[data-anio]` recibe el año.

- [ ] **Step 1: Reescribir `sitio/index.html`**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cesar Daniel Cristancho Garzón · Páginas web y apps para negocios</title>
  <meta name="description" content="Desarrollo páginas web y apps para negocios. Mira proyectos reales funcionando y escríbeme por WhatsApp.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Cesar Daniel Cristancho Garzón · Páginas web y apps para negocios">
  <meta property="og:description" content="Mira proyectos reales funcionando y escríbeme por WhatsApp.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%231d4e89'/><path d='M11 11l-5 5 5 5M21 11l5 5-5 5' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/estilos.css">
  <script type="module" src="/js/app.js"></script>
</head>
<body>
  <a class="salto" href="#proyectos">Saltar a los proyectos</a>

  <header class="barra">
    <div class="contenedor">
      <a class="marca" href="#" data-nombre>Cesar Daniel Cristancho Garzón</a>
      <a class="btn btn-whatsapp btn-pequeno" data-whatsapp href="https://wa.me/573102165848?text=Hola%20Cesar%2C%20vi%20tu%20portafolio%20y%20me%20interesa%20un%20proyecto" target="_blank" rel="noopener">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2Z"/></svg>
        WhatsApp
      </a>
    </div>
  </header>

  <main>
    <section class="presentacion">
      <div class="contenedor">
        <h1 data-nombre>Cesar Daniel Cristancho Garzón</h1>
        <p class="frase" id="frase">Desarrollo páginas web y apps para negocios.</p>
        <div class="acciones">
          <a class="btn btn-principal" href="#proyectos">Ver proyectos</a>
          <a class="btn btn-secundario" data-whatsapp href="https://wa.me/573102165848?text=Hola%20Cesar%2C%20vi%20tu%20portafolio%20y%20me%20interesa%20un%20proyecto" target="_blank" rel="noopener">Escríbeme</a>
        </div>
      </div>
    </section>

    <section class="proyectos" id="proyectos" aria-labelledby="titulo-proyectos">
      <div class="contenedor">
        <h2 class="etiqueta" id="titulo-proyectos">Proyectos</h2>
        <div class="lista-proyectos" id="lista-proyectos">
          <p class="aviso">Cargando proyectos…</p>
        </div>
      </div>
    </section>

    <section class="contacto" aria-labelledby="titulo-contacto">
      <div class="contenedor">
        <h2 id="titulo-contacto">¿Tienes un proyecto en mente?</h2>
        <p>Cuéntame qué necesita tu negocio y te respondo pronto.</p>
        <div class="acciones">
          <a class="btn btn-whatsapp" data-whatsapp href="https://wa.me/573102165848?text=Hola%20Cesar%2C%20vi%20tu%20portafolio%20y%20me%20interesa%20un%20proyecto" target="_blank" rel="noopener">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2Z"/></svg>
            Escríbeme por WhatsApp
          </a>
          <a class="enlace-correo" data-correo href="mailto:ccdgarzon@gmail.com">ccdgarzon@gmail.com</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="pie">
    <div class="contenedor">© <span data-anio>2026</span> <span data-nombre>Cesar Daniel Cristancho Garzón</span></div>
  </footer>
</body>
</html>
```

Todos los enlaces de contacto vienen escritos en el HTML. Si el JavaScript o los JSON fallan, siguen funcionando.

- [ ] **Step 2: Reescribir `sitio/css/estilos.css`**

```css
/* =============================================================
   ESTILOS DEL PORTAFOLIO
   Los colores están en :root. Cambia --acento para cambiar
   el color principal. El modo oscuro se activa solo.
   ============================================================= */

:root {
  --fondo: #f6f7f9;
  --superficie: #ffffff;
  --superficie-2: #eef1f5;
  --borde: #dde2e9;
  --texto: #16202e;
  --texto-suave: #556274;
  --acento: #1d4e89;
  --acento-hover: #163d6c;
  --exito: #1f7a4d;
  --whatsapp: #157347;
  --whatsapp-hover: #105c38;
  --portada-1: #1d4e89;
  --portada-2: #0f2a4a;
  --sombra: 0 1px 2px rgba(16, 24, 40, .05), 0 8px 28px rgba(16, 24, 40, .08);
  --radio: 14px;
  --ancho: 1120px;
  --fuente: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --fuente-titulos: "Source Serif 4", Georgia, "Times New Roman", serif;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --fondo: #0d1420;
    --superficie: #141d2b;
    --superficie-2: #1b2636;
    --borde: #2a3648;
    --texto: #e6ebf2;
    --texto-suave: #9aa8bb;
    --acento: #7fb0ea;
    --acento-hover: #a3c7f1;
    --exito: #5cc58f;
    --portada-1: #1f3f66;
    --portada-2: #0f1c2e;
    --sombra: 0 1px 2px rgba(0, 0, 0, .3), 0 8px 28px rgba(0, 0, 0, .3);
    color-scheme: dark;
  }
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 72px; }
body {
  margin: 0;
  background: var(--fondo);
  color: var(--texto);
  font-family: var(--fuente);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img, video { max-width: 100%; display: block; }
a { color: var(--acento); }
a:focus-visible, .btn:focus-visible { outline: 2px solid var(--acento); outline-offset: 3px; }
h1, h2, h3 { font-family: var(--fuente-titulos); line-height: 1.15; margin: 0; font-weight: 600; overflow-wrap: anywhere; }
p { margin: 0 0 1em; }
.contenedor { max-width: var(--ancho); margin: 0 auto; padding: 0 16px; }
.ico { width: 1.15em; height: 1.15em; flex: none; }

.salto { position: absolute; left: -9999px; }
.salto:focus { left: 16px; top: 12px; z-index: 100; background: var(--superficie); padding: 8px 12px; border-radius: 8px; }

/* ---------- Botones ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5em;
  padding: .75em 1.35em; border-radius: 999px; border: 1px solid transparent;
  font: 600 1rem/1.2 var(--fuente); text-decoration: none; cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease;
}
.btn-pequeno { padding: .5em 1em; font-size: .9rem; }
.btn-principal { background: var(--acento); color: #fff; }
.btn-principal:hover { background: var(--acento-hover); }
.btn-secundario { background: var(--superficie); color: var(--texto); border-color: var(--borde); }
.btn-secundario:hover { border-color: var(--texto-suave); }
.btn-whatsapp { background: var(--whatsapp); color: #fff; }
.btn-whatsapp:hover { background: var(--whatsapp-hover); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .btn-principal { color: #0d1420; }
}

/* ---------- Barra superior ---------- */
.barra {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--fondo) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--borde);
}
.barra .contenedor { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 60px; }
.marca { color: var(--texto); font-weight: 600; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---------- Presentación ---------- */
.presentacion { padding: 72px 0 48px; }
.presentacion h1 { font-size: clamp(2rem, 5vw, 3.25rem); max-width: 18ch; }
.frase { font-size: clamp(1.1rem, 2.2vw, 1.35rem); color: var(--texto-suave); margin: .6em 0 1.4em; max-width: 36ch; }
.acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

/* ---------- Proyectos ---------- */
.proyectos { padding: 24px 0 88px; }
.etiqueta {
  font: 600 .8rem/1 var(--fuente); letter-spacing: .12em; text-transform: uppercase;
  color: var(--texto-suave); margin-bottom: 32px;
}
.lista-proyectos { display: grid; gap: 88px; }

.proyecto { display: grid; grid-template-columns: 1.3fr 1fr; gap: 48px; align-items: center; }
.proyecto--invertido .proyecto-media { order: 2; }

.proyecto-media {
  aspect-ratio: 16 / 10; border-radius: var(--radio); overflow: hidden;
  background: var(--superficie-2); border: 1px solid var(--borde); box-shadow: var(--sombra);
}
.proyecto-media video, .proyecto-media img { width: 100%; height: 100%; object-fit: cover; }
.respaldo {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 24px;
  background: linear-gradient(135deg, var(--portada-1), var(--portada-2));
  color: #fff; font: 600 clamp(1.4rem, 3vw, 2rem)/1.2 var(--fuente-titulos); text-align: center; overflow-wrap: anywhere;
}

.proyecto-tipo { font-size: .8rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--acento); margin: 0 0 .5em; }
.proyecto h3 { font-size: clamp(1.5rem, 3vw, 2rem); margin-bottom: .45em; }
.proyecto-frase { color: var(--texto-suave); font-size: 1.075rem; }

.logros { list-style: none; padding: 0; margin: 0 0 1.6em; }
.logros li { position: relative; padding-left: 1.7em; margin: .45em 0; overflow-wrap: anywhere; }
.logros li::before { content: "✓"; position: absolute; left: 0; color: var(--exito); font-weight: 700; }

.proyecto-enlace { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.nota { font-size: .875rem; color: var(--texto-suave); }

.tecnologias { list-style: none; padding: 0; margin: 1.6em 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
.tecnologias li { font-size: .8rem; color: var(--texto-suave); border: 1px solid var(--borde); border-radius: 999px; padding: .2em .75em; }

.aviso { padding: 32px; border: 1px dashed var(--borde); border-radius: var(--radio); text-align: center; color: var(--texto-suave); margin: 0; }

/* ---------- Contacto y pie ---------- */
.contacto { background: var(--superficie); border-top: 1px solid var(--borde); padding: 72px 0; text-align: center; }
.contacto h2 { font-size: clamp(1.6rem, 4vw, 2.25rem); margin-bottom: .4em; }
.contacto p { color: var(--texto-suave); }
.contacto .acciones { justify-content: center; }
.enlace-correo { font-weight: 500; overflow-wrap: anywhere; }
.pie { padding: 24px 0; color: var(--texto-suave); font-size: .875rem; text-align: center; }

/* ---------- Celular ---------- */
@media (max-width: 800px) {
  .presentacion { padding: 48px 0 32px; }
  .lista-proyectos { gap: 64px; }
  .proyecto { grid-template-columns: 1fr; gap: 20px; }
  .proyecto--invertido .proyecto-media { order: 0; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .btn { transition: none; }
}
```

- [ ] **Step 3: Crear `sitio/js/app.js`**

```js
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

// La Tarea 5 reemplaza esta función por la reproducción automática.
function observarVideo(video) {
  video.controls = true;
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
```

- [ ] **Step 4: Correr las pruebas**

Hasta la Tarea 5 no existen `kaf.mp4` ni `kaf.jpg`. Con `preload="none"` el navegador no pide el video hasta reproducirlo, así que el bloque KAF muestra un **recuadro de video vacío con controles**. Es lo esperado en esta tarea; el respaldo se prueba en el paso 7.

Run: `npm test`
Expected: PASS, 12 de 12.

- [ ] **Step 5: Verificación visual en computador y celular**

Run (en segundo plano): `npm run dev`
Expected: `Ready on http://localhost:8788`.

Con Playwright MCP:
1. `browser_navigate` a `http://localhost:8788`.
2. `browser_resize` a 1280×800 y luego `browser_take_screenshot` de página completa.
3. `browser_resize` a 390×844 y luego `browser_take_screenshot` de página completa.
4. `browser_resize` a 360×740 y luego `browser_evaluate` con `() => document.documentElement.scrollWidth <= innerWidth`.
5. `browser_console_messages`.

Expected:
- Se ven el nombre, la frase, el bloque KAF (recuadro de video con controles, 3 logros con ✓, botón "Ver sitio en vivo →", nota, 3 etiquetas) y la sección de contacto.
- El paso 4 devuelve `true`.
- En el paso 5, el único error permitido es el 404 de `/media/kaf.jpg` (la portada llega en la Tarea 5).

- [ ] **Step 6: Comprobar los enlaces de contacto**

Con `browser_evaluate`:

```js
() => [...document.querySelectorAll("[data-whatsapp]")].map(a => a.href)
  .concat(document.querySelector("[data-correo]").href)
```

Expected: tres veces `https://wa.me/573102165848?text=Hola%20Cesar%2C%20vi%20tu%20portafolio%20y%20me%20interesa%20un%20proyecto` y luego `mailto:ccdgarzon@gmail.com`.

- [ ] **Step 7: Casos de falla (Review Focus 1 y 5)**

1. `proyectos.json` ya está en un commit (Tarea 3), así que se puede restaurar con Git al final.
2. Reemplazar `sitio/datos/proyectos.json` por esta versión de prueba:

```json
{
  "proyectos": [
    { "nombre": "Proyectoconunnombremuylargoquenotieneespaciosparaprobarelcelular", "frase": "Sin video, sin portada, sin enlace.", "logros": ["Un logro bastante largo que debería ajustarse sin salirse de la pantalla del celular", "Dos", "Tres", "Cuatro"], "video": "", "portada": null, "enlace": "" },
    { "nombre": "Con enlace peligroso", "frase": "No debe mostrar botón.", "enlace": "javascript:alert(1)" },
    { "nombre": "Sin frase" }
  ]
}
```

3. Recargar a 360×740.
   Expected:
   - 2 bloques: el tercero se descarta porque no tiene frase.
   - El primero muestra el respaldo y ningún botón.
   - El segundo no tiene botón.
   - El segundo bloque tiene la clase `proyecto--invertido`, aunque a 360 px se ve apilado igual que el primero.
   - `scrollWidth <= innerWidth` es `true`.
4. Borrar `sitio/datos/proyectos.json` y recargar.
   Expected: el aviso "No se pudieron cargar los proyectos. Escríbeme por WhatsApp." con un enlace funcional, y los botones de la barra y del contacto siguen apuntando a `wa.me/573102165848`.
5. Video que falla pero con portada válida: no se puede probar hasta tener `kaf.jpg`; queda en la Tarea 5, paso 7.
6. Restaurar el archivo original.
   Run: `git checkout -- sitio/datos/proyectos.json && git status --short sitio/datos`
   Expected: sin cambios.

- [ ] **Step 8: Commit**

```bash
git add sitio/index.html sitio/css/estilos.css sitio/js/app.js
git commit -m "Construir la página de una sola sección de proyectos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Video de KAF y reproducción automática

**Files:**
- Create: `sitio/media/kaf.mp4`, `sitio/media/kaf.jpg`
- Modify: `sitio/js/app.js`, solo la función `observarVideo`
- Herramienta temporal (no se guarda en el repo): `<scratchpad>/grabar-kaf/grabar.js`

**Interfaces:**
- Consumes: `crearMedia` llama a `observarVideo(video)` (Tarea 4).
- Produces: los archivos de media que referencia `proyectos.json` (`/media/kaf.mp4`, `/media/kaf.jpg`).

- [ ] **Step 1: Preparar la herramienta de grabación en el scratchpad**

```bash
SCRATCH="C:/Users/ccdga/AppData/Local/Temp/claude/C--Users-ccdga-Desktop-CL-mi-WEB/64e6777f-b8fd-465d-b5c0-72ab636f9a2a/scratchpad"
mkdir -p "$SCRATCH/grabar-kaf" && cd "$SCRATCH/grabar-kaf"
npm init -y >/dev/null && npm pkg set type=module
npm install playwright ffmpeg-static
npx playwright install chromium
```

Expected: termina sin errores.

- [ ] **Step 2: Escribir `grabar.js`**

```js
// Graba ~16 s de KAF funcionando y genera kaf.mp4 (H.264, sin audio) y kaf.jpg.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const SITIO = "https://kaf-frontend.onrender.com";
const API = "https://kaf-backend.onrender.com";
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// 1) Despertar Render ANTES de grabar (el plan gratis tarda ~50 s la primera vez)
for (const url of [API, SITIO]) {
  for (let i = 0; i < 12; i++) {
    try { await fetch(url); break; } catch { await espera(10_000); }
  }
}

// 2) Grabar el recorrido
const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: "grabacion", size: { width: 1280, height: 800 } },
});
const pagina = await contexto.newPage();
const inicio = Date.now();
await pagina.goto(SITIO, { waitUntil: "networkidle", timeout: 120_000 });
await pagina.locator(".catalogo-grid .product-card").first().waitFor({ timeout: 120_000 });
await pagina.evaluate(() => scrollTo(0, 0));
await espera(800);
const recorte = (Date.now() - inicio) / 1000; // segundos de carga que se cortan del video
await pagina.screenshot({ path: "kaf.jpg", type: "jpeg", quality: 82 });

await espera(2000); // portada
await pagina.evaluate(() => document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" }));
await espera(2500);
await pagina.mouse.wheel(0, 350);
await espera(1500);
await pagina.locator(".catalogo-grid .product-card .product-card-info h3").first().click();
await espera(1500);
const siguiente = pagina.locator(".modal-producto .gallery-nav-next");
if (await siguiente.count()) {
  await siguiente.first().click(); await espera(1200);
  await siguiente.first().click(); await espera(1200);
}
await pagina.locator(".modal-boton-whatsapp").hover();
await espera(2500);

const rutaVideo = await pagina.video().path();
await contexto.close();
await navegador.close();

// 3) Convertir a MP4 liviano, sin la parte de carga
execFileSync(ffmpeg, [
  "-y", "-ss", recorte.toFixed(2), "-i", rutaVideo, "-t", "16", "-an",
  "-vf", "scale=1280:-2,fps=30", "-c:v", "libx264", "-crf", "28", "-preset", "slow",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "kaf.mp4",
], { stdio: "inherit" });
console.log("Listo: kaf.mp4 y kaf.jpg");
```

- [ ] **Step 3: Grabar**

Run: `node grabar.js` (dentro de `grabar-kaf`, con timeout de 600000 ms)
Expected: `Listo: kaf.mp4 y kaf.jpg`.

**Si falla un selector** (KAF cambió) o el video sale en blanco, hacer **una sola** corrección revisando el sitio con Playwright MCP (`browser_snapshot`). Si vuelve a fallar, usar el **plan B**: pedir a Cesar que grabe 15 s con `Win + Alt + R` siguiendo el mismo recorrido y convertir su archivo con el comando ffmpeg del paso 3 del script, usando `-ss 0`.

- [ ] **Step 4: Revisar peso y contenido**

Run: `ls -l kaf.mp4 kaf.jpg`
Expected: `kaf.mp4` pesa 10 MB o menos (lo ideal, de 1 a 2 MB) y `kaf.jpg` menos de 400 KB.

Revisar `kaf.jpg` con Read (es una imagen). Expected: la portada de KAF ya cargada, sin pantalla de carga.

Si `kaf.mp4` pasa de 10 MB, repetir solo la conversión con `-crf 32`.

- [ ] **Step 5: Copiar al sitio**

```bash
mkdir -p "C:/Users/ccdga/Desktop/CL/mi-WEB/sitio/media"
cp kaf.mp4 kaf.jpg "C:/Users/ccdga/Desktop/CL/mi-WEB/sitio/media/"
```

- [ ] **Step 6: Reemplazar `observarVideo` en `sitio/js/app.js`**

Reemplazar la función temporal por:

```js
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
```

- [ ] **Step 7: Verificar la reproducción**

Con el servidor de la Tarea 4 corriendo, usar Playwright MCP:
1. Navegar a `http://localhost:8788` a 1280×800 y desplazarse hasta `#proyectos`.
2. Esperar 2 s y luego `browser_evaluate`:

```js
() => { const v = document.querySelector(".proyecto-media video"); return { paused: v.paused, t: v.currentTime, poster: v.poster }; }
```

   Expected: `paused: false`, `t > 0` y `poster` termina en `/media/kaf.jpg`.
3. Desplazarse a la sección de contacto, de modo que el video quede fuera de pantalla, y evaluar de nuevo.
   Expected: `paused: true`.
4. `browser_emulate_media` con `reducedMotion: "reduce"`, recargar y evaluar `v.controls && v.paused`.
   Expected: `true`.
5. Video roto con portada válida: cambiar temporalmente `"video"` de KAF a `"/media/no-existe.mp4"`, recargar y desplazarse hasta el bloque.
   Expected: se ve `kaf.jpg` en lugar del video.
   Restaurar con `git checkout -- sitio/datos/proyectos.json`.
6. Quitar la emulación, recargar, tomar capturas de página completa a 1280 y 390, y revisar la consola.
   Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add sitio/media sitio/js/app.js
git commit -m "Agregar video de KAF y reproducción al entrar en pantalla

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Panel Pages CMS y LEEME

**Files:**
- Create: `.pages.yml`
- Modify (reescribir completo): `LEEME.md`

**Interfaces:**
- Consumes: la forma de `sitio.json` y `proyectos.json` (Tarea 3) y la carpeta `sitio/media` (Tarea 5).
- Produces: el esquema del panel. Cada `name` debe coincidir exactamente con las claves que lee `normalizarSitio` y `normalizarProyecto`.

- [ ] **Step 1: Crear `.pages.yml`**

```yaml
# Configuración del panel (https://app.pagescms.org).
# Los nombres (name) deben coincidir con las claves de sitio/datos/*.json.

media:
  input: sitio/media
  output: /media
  rename: safe
  categories: [image, video]

content:
  - name: sitio
    label: Datos del sitio
    type: file
    path: sitio/datos/sitio.json
    format: json
    fields:
      - name: nombre
        label: Tu nombre
        type: string
        required: true
      - name: frase
        label: Frase de presentación
        type: string
        required: true
      - name: whatsapp
        label: WhatsApp
        description: "Código de país + número, solo dígitos. Ej: 573102165848"
        type: string
        required: true
        pattern:
          regex: "^[0-9]{10,15}$"
          message: "Solo números, con el 57 adelante. Ej: 573102165848"
      - name: mensaje_whatsapp
        label: Mensaje que aparece escrito al abrir WhatsApp
        type: string
      - name: correo
        label: Correo de contacto
        type: string
        required: true

  - name: proyectos
    label: Proyectos
    type: file
    path: sitio/datos/proyectos.json
    format: json
    fields:
      - name: proyectos
        label: Proyectos
        description: "El primero de la lista aparece arriba en la página."
        type: object
        list:
          collapsible:
            collapsed: true
            summary: "{nombre}"
        fields:
          - name: nombre
            label: Nombre del proyecto
            type: string
            required: true
          - name: tipo
            label: Tipo y año
            description: "Ej: Tienda en línea · 2026"
            type: string
          - name: frase
            label: Qué hace (una frase)
            type: text
            required: true
          - name: logros
            label: Logros (máximo 4)
            description: "Puntos concretos que le importan a un cliente."
            type: string
            list:
              max: 4
          - name: video
            label: Video (MP4, máximo 10 MB)
            type: file
            options:
              categories: [video]
          - name: portada
            label: Imagen de portada (se ve mientras carga el video)
            type: image
          - name: enlace
            label: Enlace al sitio en vivo
            type: string
            pattern:
              regex: "^https?://"
              message: "Debe empezar por https://"
          - name: nota_enlace
            label: Nota junto al botón
            description: "Ej: Puede tardar unos segundos en abrir."
            type: string
          - name: tecnologias
            label: Tecnologías
            type: string
            list: true
```

- [ ] **Step 2: Validar que el esquema y los datos coinciden**

Agregar a `tests/datos.test.js`:

```js
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
```

Run: `npm test`
Expected: PASS, 13 de 13.

- [ ] **Step 3: Reescribir `LEEME.md`**

````markdown
# Mi portafolio

Página de una sola sección que muestra mis proyectos a clientes, con un video de cada uno y un botón de WhatsApp.

- **Sitio publicado:** https://cesarcristancho.pages.dev
- **Panel para editar:** https://app.pagescms.org (entrar con GitHub: `DanielGarzonRYU`)

## Agregar un proyecto (sin tocar código)

1. Entra a https://app.pagescms.org → repositorio `portafolio` → **Proyectos**.
2. Al final de la lista: **Add an entry** (agregar).
3. Llena: nombre, tipo y año, la frase de qué hace, hasta 4 logros, el enlace y las tecnologías.
4. **Video:** súbelo en el campo *Video*. **Portada:** una captura del proyecto en el campo *Imagen de portada*.
5. Arrastra el proyecto en la lista si quieres que salga más arriba.
6. **Save** (guardar). En 1 o 2 minutos aparece en el sitio.

Para **editar** o **eliminar** un proyecto, ábrelo en la misma lista.
Tu nombre, la frase de presentación, el WhatsApp y el correo están en **Datos del sitio**.

## Cómo grabar el video de un proyecto

1. Abre el proyecto en el navegador, a pantalla completa.
2. `Win + Alt + R` empieza a grabar. Haz un recorrido corto (10 a 15 s): portada → lo más importante → una acción.
3. `Win + Alt + R` otra vez para terminar. El video queda en `Videos/Capturas`.
4. Si pesa más de 10 MB, recórtalo o comprímelo en **Clipchamp** (viene con Windows): Exportar → 720p.
5. Para la portada usa `Win + Shift + S` y guarda la captura como JPG.

Videos de más de 25 MB no se publican (es un límite de Cloudflare). Lo ideal es que pesen de 1 a 2 MB.

## Ver la página en tu computador

```powershell
npm install   # solo la primera vez
npm run dev   # abre http://localhost:8788
npm test      # revisa que los datos estén bien
```

Al abrir `index.html` con doble clic **no** se cargan los proyectos (el navegador lo bloquea). Usa `npm run dev`.

## Estructura

```
sitio/index.html            la página
sitio/datos/sitio.json      nombre, frase, WhatsApp, correo   (lo edita el panel)
sitio/datos/proyectos.json  la lista de proyectos             (lo edita el panel)
sitio/media/                videos y portadas                 (los sube el panel)
sitio/css/estilos.css       colores y diseño (--acento cambia el color principal)
sitio/js/datos.js           limpia los datos del panel (tiene pruebas)
sitio/js/app.js             dibuja la página
.pages.yml                  qué formularios muestra el panel
```

## Si algo falla

- **El proyecto no aparece:** le falta el *nombre* o la *frase*, que son obligatorios.
- **El video no se ve:** revisa que sea MP4. Mientras tanto se muestra la portada o el nombre.
- **El sitio no se actualizó:** en Cloudflare → Workers & Pages → `cesarcristancho` → Deployments, mira si la última publicación falló.
- **Recuperar el sitio anterior** (chat con IA, contadores…): está en el primer commit del historial, "Respaldo del portafolio anterior".
````

- [ ] **Step 4: Commit**

```bash
git add .pages.yml LEEME.md tests/datos.test.js
git commit -m "Agregar configuración del panel Pages CMS y guía de uso

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Publicar (GitHub + Cloudflare + panel), con pasos de Cesar

Esta tarea mezcla acciones de Cesar en el navegador con comandos. **Cada paso marcado 👤 lo hace Cesar.** Esperar a que confirme antes de seguir.

**Files:**
- Modify: `sitio/index.html` (`og:image` y `og:url` con el dominio final), `LEEME.md` (dirección final si cambia)

**Interfaces:**
- Consumes: el repo completo, con las Tareas 1 a 6 en commits.
- Produces: el sitio público, el repo `DanielGarzonRYU/portafolio` y el panel funcionando.

- [ ] **Step 1: Verificación final local**

Run: `npm test`
Expected: PASS, 13 de 13.

Run: `grep -rn "Cesar Julián" sitio/ || echo "OK sin nombre viejo"`
Expected: `OK sin nombre viejo`.

- [ ] **Step 2: 👤 Recuperar el acceso a GitHub y crear el repositorio**
  1. Entrar a github.com como `DanielGarzonRYU`. Si no recuerda la contraseña, usar "Forgot password" con su correo.
  2. En Settings → Emails, confirmar que `ccdgarzon@gmail.com` está agregado y verificado. Si no, agregarlo.
  3. Crear un repositorio **privado** llamado `portafolio`, **vacío**: sin README, sin .gitignore y sin licencia.

- [ ] **Step 3: Subir el código obligando a usar la cuenta correcta**

El usuario en la URL hace que Git Credential Manager pida la cuenta `DanielGarzonRYU` y no use la sesión guardada de `cesarjulianecci-bot`.

```bash
git remote add origin https://DanielGarzonRYU@github.com/DanielGarzonRYU/portafolio.git
git push -u origin main
```

Expected: se abre una ventana de inicio de sesión de GitHub. 👤 Cesar entra con `DanielGarzonRYU` y el push termina con `main -> main`.

- [ ] **Step 4: 👤 Conectar Cloudflare Pages**
  1. Crear una cuenta en dash.cloudflare.com con `ccdgarzon@gmail.com`.
  2. Workers & Pages → Create → Pages → **Connect to Git** → autorizar GitHub (`DanielGarzonRYU`) → elegir `portafolio`.
  3. Project name: `cesarcristancho`. Si está ocupado, usar `cesar-cristancho` y luego `cdcristancho`.
  4. Framework preset: **None**. Build command: **vacío**. Build output directory: `sitio`.
  5. Save and Deploy.

Expected: la publicación termina en verde. Cesar comparte la dirección final.

- [ ] **Step 5: Agregar la imagen para compartir en redes con el dominio final**

En `sitio/index.html`, después de `og:description`, agregar las dos líneas usando el dominio real del paso 4:

```html
  <meta property="og:url" content="https://cesarcristancho.pages.dev/">
  <meta property="og:image" content="https://cesarcristancho.pages.dev/media/kaf.jpg">
```

Si el dominio final cambió, actualizar también la línea "Sitio publicado" de `LEEME.md`.

```bash
git add sitio/index.html LEEME.md
git commit -m "Agregar vista previa para redes con el dominio final

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Verificar el sitio publicado**

Con Playwright MCP, sobre la dirección pública:
1. Captura de pantalla a 1280 y a 390.
2. Evaluar el estado del video, como en la Tarea 5, paso 7.
3. Revisar la consola.
4. `curl -sI https://<dominio>/media/kaf.mp4 | head -5`

Expected:
- Se ve igual que en local.
- La consola no muestra errores.
- El video responde `200` con `content-type: video/mp4`.

- [ ] **Step 7: 👤 Conectar el panel y probar el CRUD completo**
  1. Ir a https://app.pagescms.org → Sign in with GitHub (`DanielGarzonRYU`) → instalar la app de GitHub de Pages CMS **solo en el repo `portafolio`**.
  2. Abrir **Datos del sitio** y comprobar que muestra los datos actuales.
  3. Abrir **Proyectos** → agregar uno de prueba con nombre "Prueba", frase "Proyecto de prueba." y una imagen de portada cualquiera → Save.
  4. Esperar unos 2 minutos y recargar el sitio publicado. Expected: aparece el bloque "Prueba" con su imagen.
  5. Editar la frase de "Prueba" → Save → se ve el cambio en el sitio.
  6. Eliminar "Prueba" → Save → desaparece del sitio.

Después de la prueba, traer los commits del panel y comprobar que los datos quedaron limpios:

```bash
git pull
npm test
```

Expected: PASS, 13 de 13. La imagen de prueba queda en `sitio/media/`: borrarla con `git rm` y luego `git commit` y `git push`.

**Si el panel guarda una forma distinta** (por ejemplo, rutas sin `/` o `null`), `npm test` y `normalizarProyectos` ya lo toleran. Si `npm test` falla, revisar el JSON que escribió el panel y ajustar `.pages.yml`, nunca los datos a mano.

---

## Fuera de este plan (siguiente paso)

**Limpieza del perfil de GitHub `DanielGarzonRYU`.** Tiene 4 repositorios de 2022: `C-Users-Familia-Garzon-OneDrive-Escritorio-repositorio`, `menu-pa-acero4`, `proyecto-A` y `proyecto-MAED`. La limpieza consiste en:
- Borrar o archivar esos repositorios.
- Completar el perfil: nombre, bio y foto.
- Crear un README de perfil que enlace al portafolio.

Borrar repositorios es irreversible, así que se hará como una tarea aparte, con confirmación de Cesar repositorio por repositorio, después de publicar el portafolio.
