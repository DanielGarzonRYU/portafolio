# Código QR del portafolio

Todos llevan a **https://cesarcristancho.pages.dev** y fueron verificados con un lector de QR.

| Archivo | Para qué |
|---|---|
| `qr-tarjeta.png` | Compartir por WhatsApp, estados e Instagram (1080×1350) |
| `qr-tarjeta-3d.mp4` | **Video** (7 s): la tarjeta gira en 3D y queda de frente para escanear. Estados de WhatsApp, historias y reels |
| `qr-tarjeta-3d.png` | Versión con perspectiva 3D para redes sociales (imagen fija) |
| `qr-imprimir.png` | Imprimir (2048×2048, fondo blanco) |
| `qr-cesarcristancho.svg` | Vectorial: imprentas, tarjetas físicas, letreros (escala sin perder calidad) |

**Al imprimir:** mínimo 2,5 cm de lado, sobre fondo claro y sin estirarlo.
El estilo usa corrección de errores alta (H), por eso el monograma CC del centro no impide leerlo.

Para regenerarlos (por ejemplo, si cambia la dirección del sitio), edita `URL_SITIO` en
`generar-qr.js` y ejecútalo con Node (necesita `qrcode`, `playwright`, `pngjs` y `jsqr`).
El video se regenera con `generar-video-qr.js` (además necesita `ffmpeg-static`) a partir del SVG.
