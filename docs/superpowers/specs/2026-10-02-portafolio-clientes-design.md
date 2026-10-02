# Diseño: Portafolio de proyectos para clientes

- **Fecha:** 2026-10-02
- **Autor:** Cesar Daniel Cristancho Garzón
- **Estado:** Aprobado en conversación. Pendiente de revisión escrita.

## 1. Objetivo

Una página web pública y sencilla para mostrar a **clientes potenciales** los proyectos que he hecho, para que me contacten y me contraten.
Tengo que poder **agregar, editar y eliminar proyectos desde un panel visual** sin tocar código, y que el sitio se actualice solo.

**El éxito se ve así:**
- Un cliente entiende en menos de 10 segundos qué hace cada proyecto, gracias al video y una frase.
- Puede escribirme por WhatsApp con un clic desde cualquier parte de la página.
- Publico un proyecto nuevo desde el panel y aparece en línea en unos 1 a 2 minutos, sin usar la terminal.

**Fuera de alcance:** las secciones "Sobre mí", hobbies, historia, habilidades y trayectoria, el chat con IA, los contadores, el buscador, los filtros, la página de detalle por proyecto, las descargas con SHA-256, los testimonios y los precios.

## 2. Público y tono

- **Visitante:** dueño de un negocio o emprendedor que necesita una página o app.
- **Qué se destaca:** qué resuelve el proyecto y su resultado, más que la tecnología. Las tecnologías aparecen como etiquetas discretas.
- **Idioma:** español.

## 3. Estructura de la página (una sola página)

De arriba hacia abajo:

1. **Barra superior fija y delgada.** Nombre a la izquierda y botón de WhatsApp a la derecha.
2. **Presentación (~10 % de la pantalla).**
   - Nombre: *Cesar Daniel Cristancho Garzón*.
   - Frase: *"Desarrollo páginas web y apps para negocios."* (se edita en el panel).
   - Dos botones: **Ver proyectos** (baja a la sección) y **Escríbeme** (abre WhatsApp).
3. **Proyectos (~80 %).**
   - Un bloque a todo el ancho por proyecto, en el orden de la lista del panel.
   - En computador: video de un lado y texto del otro, alternando el lado en cada bloque.
   - En celular: el video arriba y el texto debajo.
4. **Cierre de contacto (~10 %).** *"¿Tienes un proyecto en mente?"* con botón de WhatsApp y el correo como enlace `mailto:`.
5. **Pie.** © año y nombre.

**Otras decisiones:**
- No hay sección "Próximamente". Un proyecto solo aparece cuando está terminado.
- **WhatsApp:** `https://wa.me/573102165848?text=` con el mensaje ya escrito *"Hola Cesar, vi tu portafolio y me interesa un proyecto"*. El número y el mensaje se editan en el panel.
- **Correo de contacto:** `ccdgarzon@gmail.com`.
- Funciona en modo claro y oscuro según el dispositivo del visitante.

## 4. Bloque de proyecto

| Campo | Obligatorio | Uso |
|---|---|---|
| `nombre` | sí | Título del bloque |
| `tipo` | no | Etiqueta pequeña sobre el título (ej. "Tienda en línea · 2026") |
| `frase` | sí | Una frase que dice qué hace |
| `logros` | no | Lista de 3 a 4 puntos concretos, mostrados con ✓ |
| `video` | no | Ruta a un MP4 en `media/` |
| `portada` | no | Ruta a una imagen en `media/`, se muestra mientras carga el video |
| `enlace` | no | URL del sitio en vivo. Muestra el botón **"Ver sitio en vivo →"** |
| `nota_enlace` | no | Texto pequeño junto al botón (ej. "Puede tardar unos segundos en abrir") |
| `tecnologias` | no | Lista de etiquetas pequeñas al final del bloque |

**Cómo se comporta el video:**
- Usa `<video autoplay muted loop playsinline>`, con `preload="none"` y la portada como `poster`.
- Solo se reproduce cuando el bloque está en pantalla (`IntersectionObserver`) y se pausa al salir de ella.
- Si el visitante tiene activado `prefers-reduced-motion`, no se reproduce solo y se ve la portada con los controles del video.
- Peso máximo por video: **10 MB**. El objetivo es unos 1 a 2 MB para 15 segundos en H.264, a 1280 px de ancho o menos.

**Si faltan datos** (degradación elegante):
- Sin video, se muestra la portada. Sin portada, un recuadro con el nombre del proyecto.
- Si un campo opcional está vacío, ese elemento no se dibuja.

## 5. Contenido inicial

**Solo un proyecto: KAF.** SIGPAR y Control de Gastos se agregarán desde el panel cuando estén terminados.

- **nombre:** KAF — Sandalias artesanales
- **tipo:** Tienda en línea · 2026
- **frase:** Catálogo en línea donde el dueño administra sus productos sin tocar código y los clientes piden por WhatsApp.
- **logros** (borrador basado en el README de KAF, Cesar los revisa antes de publicar):
  - 27 productos con galería de fotos
  - Panel privado para agregar, editar y eliminar productos
  - Pedidos directos a WhatsApp desde cada producto
- **enlace:** https://kaf-frontend.onrender.com
- **nota_enlace:** Puede tardar unos segundos en abrir. *(Render gratis "duerme" el sitio y el primer acceso tarda ~50 s.)*
- **tecnologias:** React, Node.js, PostgreSQL
- **video:** se graba en el sitio público con un navegador automatizado. El recorrido es portada → catálogo → abrir una sandalia con su galería → botón de WhatsApp, unos 15 s sin sonido. No incluye el panel admin de KAF. Si la grabación automática falla, Cesar lo graba con `Win + Alt + R` siguiendo una guía.

## 6. Arquitectura

```
Panel (Pages CMS) ──guarda──▶ GitHub (repo privado) ──dispara──▶ Cloudflare Pages ──▶ visitantes
  app.pagescms.org             JSON + media/                      publica sitio/
```

- **Sitio estático:** HTML, CSS y JavaScript sin framework y sin paso de compilación. Cloudflare publica la carpeta `sitio/` tal cual.
- **Datos:** dos archivos JSON que `js/app.js` carga con `fetch` y con los que arma la página.
- **Panel (CRUD):** Pages CMS. Se configura con `.pages.yml` en la raíz del repositorio y se entra con la cuenta de GitHub. Guarda los cambios como commits, sin servidor ni base de datos propios.
- **Publicación:** proyecto de Cloudflare Pages **conectado al repositorio de GitHub**. Cada commit en la rama principal se publica solo.
  - El proyecto debe crearse con integración de Git. Un proyecto de "subida directa" con `wrangler pages deploy` no se puede convertir después.
- **Cuentas:** GitHub, Cloudflare y Pages CMS usan `ccdgarzon@gmail.com`. El GitHub de este portafolio es una cuenta nueva, distinta de `cesarjulianecci-bot` (que se queda con KAF).
- **Dirección:** `cesarcristancho.pages.dev`. Alternativas en orden: `cesar-cristancho`, `cdcristancho`.

### Estructura de archivos

```
mi-WEB/
├─ .pages.yml                ← configuración del panel
├─ sitio/
│  ├─ index.html             ← única página, con contenido de respaldo y metadatos SEO/Open Graph
│  ├─ datos/
│  │  ├─ sitio.json          ← nombre, frase, whatsapp, mensaje_whatsapp, correo
│  │  └─ proyectos.json      ← { "proyectos": [ ... ] }
│  ├─ media/                 ← videos y portadas (se suben desde el panel)
│  ├─ css/estilos.css
│  └─ js/app.js
├─ docs/superpowers/specs/   ← este documento
├─ LEEME.md                  ← cómo entrar al panel, agregar un proyecto y exportar un video
└─ package.json              ← solo `npm run dev` para verlo en local (wrangler pages dev sitio)
```

### Configuración del panel (`.pages.yml`)

- **`media`:** carpeta `sitio/media`, con la ruta pública `media`.
- **Contenido de tipo `file` "Datos del sitio":** `sitio/datos/sitio.json`, con los campos `nombre`, `frase`, `whatsapp` (solo dígitos con código de país), `mensaje_whatsapp` y `correo`.
- **Contenido de tipo `file` "Proyectos":** `sitio/datos/proyectos.json`, con un campo `proyectos` de tipo lista de objetos con los campos de la sección 4.
  - `video` y `portada` son campos de tipo imagen o archivo que suben a `media`.
  - El orden de la lista define el orden en la página.

> Durante la implementación se verifica la sintaxis exacta de `.pages.yml` contra la documentación actual de Pages CMS (tipos de campo, listas de objetos, subida de archivos que no son imagen como MP4). Si Pages CMS no permite subir MP4 desde el panel, el video se sube desde la web de GitHub ("Add file → Upload") y en el panel se escribe solo su ruta. Esto quedaría documentado en el LEEME.

### Qué se elimina del sitio actual

- `functions/` (chat con IA y contadores) y `herramientas/hash.ps1`.
- `sitio/proyecto.html`, `sitio/demos/` y `.dev.vars.ejemplo`.
- `sitio/js/`: `chat.js`, `comun.js`, `inicio.js`, `proyecto.js`, `config.js` y `proyectos.js`. Se reemplazan por `app.js` y los JSON.
- La sección `kv_namespaces` de `wrangler.toml` y la dependencia `@anthropic-ai/sdk`.
- El nombre "Cesar Julián" en todo el sitio. Se reemplaza por el nombre completo.

Antes de eliminar nada, se inicializa Git y se guarda un commit con el sitio actual. Lo eliminado queda recuperable en el historial.

## 7. Manejo de errores

- **Si `proyectos.json` o `sitio.json` no cargan:**
  - Los botones de WhatsApp y correo escritos directamente en `index.html` siguen funcionando.
  - La sección de proyectos muestra *"No se pudieron cargar los proyectos. Escríbeme por WhatsApp."*
- **Si un campo es inválido** (por ejemplo, `logros` no es una lista), se ignora ese campo y el bloque se dibuja con lo demás.
- **Todo el texto que viene del JSON se inserta como texto** (`textContent`), nunca como HTML.
- **Los enlaces externos** se abren en pestaña nueva con `rel="noopener"`.

## 8. Pruebas y verificación

1. Revisión visual en local (`npm run dev`) en computador (1280 px) y celular (390 px), con capturas para Cesar.
2. El botón de WhatsApp genera `https://wa.me/573102165848?text=...` con el mensaje codificado correctamente.
3. Casos de falla:
   - Proyecto sin video.
   - Proyecto sin video ni portada.
   - Proyecto sin enlace.
   - `proyectos.json` inexistente.
4. Sin errores en la consola del navegador.
5. El peso del video de KAF es de 10 MB o menos.
6. Ya en producción: Cesar entra al panel, crea un proyecto de prueba, confirma que aparece en el sitio publicado y luego lo elimina.

## 9. Pasos que requieren a Cesar

- Crear la cuenta de GitHub y la de Cloudflare con `ccdgarzon@gmail.com`.
- Iniciar sesión en Pages CMS con esa cuenta de GitHub.
- Revisar los textos de KAF (frase y logros) antes de publicar.
- Confirmar la dirección `.pages.dev` final.
