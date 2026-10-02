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
