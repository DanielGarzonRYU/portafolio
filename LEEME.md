# Mi portafolio de proyectos

Sitio web personal para mostrar tus proyectos (apps, páginas web, APKs, herramientas) con:

- **Catálogo** con buscador y filtros, y una página por proyecto que explica *qué hace* y *para qué sirve*.
- **Pregúntale a mi IA**: un chat que responde sobre ti y tus proyectos.
- **Demos en vivo**: prueba webs y apps dentro de la página.
- **Descargas verificadas**: cada archivo publica su huella SHA-256 y el visitante puede comprobar su descarga.
- **Contador** de visitas y descargas.

---

## 1. Estructura

```
mi-WEB/
├─ sitio/                  ← todo lo que ve el visitante
│  ├─ index.html           ← página de inicio
│  ├─ proyecto.html        ← página de detalle (proyecto.html?id=...)
│  ├─ js/config.js         ← ✏️ TUS DATOS (nombre, bio, habilidades, contacto)
│  ├─ js/proyectos.js      ← ✏️ TUS PROYECTOS
│  ├─ img/proyectos/       ← ✏️ portadas y capturas
│  ├─ demos/               ← ✏️ proyectos web pequeños alojados aquí mismo
│  └─ css/estilos.css      ← colores y diseño
├─ functions/api/          ← servidor: chat con IA y contadores
├─ herramientas/hash.ps1   ← calcula huella SHA-256 y tamaño de un archivo
└─ wrangler.toml           ← configuración de Cloudflare
```

En el día a día **solo editas los archivos marcados con ✏️**.

## 2. Ver el sitio en tu computador

**Rápido (sin IA ni contadores):** doble clic en `sitio/index.html`.
El chat funciona en "modo básico" buscando en tus datos.

**Completo (igual que en internet):**

```powershell
npm install        # solo la primera vez
npm run dev        # abre http://localhost:8788
```

Para probar la IA en local, copia `.dev.vars.ejemplo` como `.dev.vars` y pon tu clave.

## 3. Agregar un proyecto

1. Abre `sitio/js/proyectos.js`.
2. Copia un bloque `{ ... },` completo y pégalo debajo del último.
3. Cambia los datos. Lo más importante: `id` (único, sin espacios ni tildes), `nombre`, `resumen`, `descripcion` y `utilidad`.
4. (Opcional) Pon una imagen en `sitio/img/proyectos/` y escribe su ruta en `imagen`.

Si la página queda en blanco, casi siempre falta una coma o una comilla.
Presiona **F12 → Consola** en el navegador y te dirá la línea exacta.

### Demos en vivo

- **Proyecto web pequeño:** copia su carpeta dentro de `sitio/demos/` y pon
  `demo: { tipo: "movil", url: "demos/mi-proyecto/index.html" }` (o `tipo: "web"` para verlo en formato computador).
- **Web publicada en otro lugar:** `demo: { tipo: "web", url: "https://..." }`.
  Algunos sitios bloquean mostrarse dentro de otra página; en ese caso sigue funcionando el botón "Abrir en pestaña nueva".
- **App Android:** súbela gratis a [appetize.io](https://appetize.io) y usa su enlace con `tipo: "movil"`, o graba un video y usa
  `demo: { tipo: "video", url: "https://www.youtube.com/embed/CODIGO" }`.

### Descargas (APK, ZIP, EXE…)

Cloudflare no acepta archivos de más de 25 MB, así que aloja los archivos en **GitHub Releases** (gratis, hasta 2 GB por archivo):

1. Crea un repositorio en GitHub → *Releases* → *Draft a new release* → arrastra tu APK → *Publish*.
2. Clic derecho sobre el archivo publicado → *Copiar dirección del enlace* → pégalo en `url`.
3. Calcula la huella y el tamaño:
   ```powershell
   .\herramientas\hash.ps1 "C:\ruta\a\mi-app.apk"
   ```
   Copia las líneas `tamano` y `sha256` que te muestra dentro de la descarga en `proyectos.js`.

> Cada vez que publiques una versión nueva del archivo, **vuelve a calcular el sha256**: si no coincide, la página avisará a los visitantes que el archivo no es el original.

## 4. Publicar en internet (gratis, sin comprar dominio)

Usaremos **Cloudflare Pages**, que te da una dirección como `mi-portafolio.pages.dev`.

1. Crea una cuenta gratis en [dash.cloudflare.com](https://dash.cloudflare.com).
2. En esta carpeta ejecuta:
   ```powershell
   npx wrangler login
   npx wrangler kv namespace create CONTADORES
   ```
   Copia el `id` que aparece y pégalo en `wrangler.toml` en lugar de `REEMPLAZA_CON_TU_ID`.
3. (Opcional) Cambia `name = "mi-portafolio"` en `wrangler.toml` por el nombre que quieras en tu dirección, por ejemplo `cesar-julian` → `cesar-julian.pages.dev`.
4. Publica:
   ```powershell
   npm run publicar
   ```
5. Activa la IA: en Cloudflare → *Workers & Pages* → tu proyecto → *Settings* → *Variables and Secrets* → agrega el secreto
   `ANTHROPIC_API_KEY` con tu clave de [console.anthropic.com](https://console.anthropic.com). Luego vuelve a publicar.

Para actualizar el sitio después de editar: `npm run publicar`.

## 5. Sobre la IA

- Lee automáticamente `config.js` y `proyectos.js`: lo que escribas ahí es lo que sabe. Mientras más clara sea la `descripcion` y la `utilidad` de cada proyecto, mejores serán sus respuestas.
- Usa el modelo `claude-opus-5-5` con esfuerzo bajo, así responde rápido. El modelo se cambia en `functions/api/chat.js` (`MODELO`).
- Cada pregunta tiene un pequeño costo en tu cuenta de Anthropic. Para evitar abusos, cada visitante puede hacer como máximo 8 preguntas por minuto (`PREGUNTAS_POR_MINUTO`). También te recomiendo fijar un límite de gasto mensual en console.anthropic.com.
- Sin clave, o si falla, el chat sigue funcionando en modo básico.

## 6. Personalizar el diseño

En `sitio/css/estilos.css`, al inicio, están los colores. Cambia `--acento` para cambiar el color principal de todo el sitio.
El sitio se adapta solo al modo oscuro del dispositivo del visitante.
