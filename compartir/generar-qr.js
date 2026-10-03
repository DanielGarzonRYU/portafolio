// Genera el QR con estilo (puntos redondeados, esquinas esmeralda, monograma CC)
// y lo exporta en 3 versiones: impresión, tarjeta para compartir y tarjeta en 3D.
import QRCode from "qrcode";
import { chromium } from "playwright";
import { writeFileSync, readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jsQR from "jsqr";

const URL_SITIO = "https://cesarcristancho.pages.dev";
// La fuente va incrustada (base64): el navegador bloquea cargarla desde un archivo local
const FUENTE = "data:font/woff2;base64," + readFileSync("C:/Users/ccdga/Desktop/CL/mi-WEB/sitio/fuentes/Geist-Variable.woff2").toString("base64");
const ESMERALDA = "#047857";
const TINTA = "#18181b";

const qr = QRCode.create(URL_SITIO, { errorCorrectionLevel: "H" });
const n = qr.modules.size;
const oscuro = (x, y) => qr.modules.get(y, x) === 1;
const margen = 4;
const total = n + margen * 2;

// Zonas reservadas: las 3 esquinas de ubicación (7x7) y el centro para el monograma
const enEsquina = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
const centro = (n - 1) / 2;
const radioLogo = 4.6; // en módulos
const enLogo = (x, y) => Math.hypot(x - centro, y - centro) < radioLogo + 0.6;

function svgQR({ fondo = "#ffffff", puntos = TINTA, ojos = ESMERALDA } = {}) {
  let p = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (oscuro(x, y) && !enEsquina(x, y) && !enLogo(x, y))
        p += `<circle cx="${x + margen + 0.5}" cy="${y + margen + 0.5}" r="0.5"/>`;
  const ojo = (ox, oy) => {
    const X = ox + margen, Y = oy + margen;
    return `<rect x="${X + 0.5}" y="${Y + 0.5}" width="6" height="6" rx="1.9" fill="none" stroke="${ojos}" stroke-width="1"/>
            <rect x="${X + 2}" y="${Y + 2}" width="3" height="3" rx="0.95" fill="${ojos}"/>`;
  };
  const c = centro + margen + 0.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">
  <rect width="${total}" height="${total}" fill="${fondo}"/>
  <g fill="${puntos}">${p}</g>
  ${ojo(0, 0)}${ojo(n - 7, 0)}${ojo(0, n - 7)}
  <circle cx="${c}" cy="${c}" r="${radioLogo}" fill="${fondo}"/>
  <circle cx="${c}" cy="${c}" r="${radioLogo - 0.9}" fill="${TINTA}"/>
  <text x="${c}" y="${c + 1.05}" text-anchor="middle" font-family="Geist, system-ui, sans-serif" font-weight="650" font-size="3" letter-spacing="-0.08" fill="#ffffff">CC</text>
</svg>`;
}

const estiloBase = `@font-face{font-family:Geist;src:url("${FUENTE}") format("woff2");font-weight:100 900}
*{margin:0;box-sizing:border-box}body{font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}`;

const tarjeta = (svg) => `
<div class="tarjeta">
  <div class="arriba"><span class="mono">CC</span><span class="nombre">Cesar Daniel Cristancho Garzón</span></div>
  <h1>Páginas web y apps que trabajan para tu negocio.</h1>
  <div class="panel">${svg}</div>
  <p class="cta">Escanea para ver mi trabajo</p>
  <p class="url">cesarcristancho.pages.dev</p>
</div>`;

const estiloTarjeta = `
.tarjeta{position:relative;width:820px;padding:64px 64px 56px;border-radius:44px;color:#f4f4f5;overflow:hidden;
  background:radial-gradient(130% 120% at 0% 0%,#2c2c33 0%,#16161a 45%,#0b0b0d 100%);
  border:1px solid rgb(255 255 255/.1);box-shadow:inset 0 1px 0 rgb(255 255 255/.14)}
.tarjeta::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 50% at 100% 100%,rgb(52 211 153/.22),transparent 70%);pointer-events:none}
.arriba{display:flex;align-items:center;gap:16px;position:relative}
.mono{display:grid;place-items:center;width:56px;height:56px;border-radius:999px;background:#f4f4f5;color:#0b0b0d;font-weight:650;font-size:20px}
.nombre{font-size:24px;font-weight:600;letter-spacing:-.02em}
h1{position:relative;font-size:46px;line-height:1.08;letter-spacing:-.04em;font-weight:600;margin:40px 0 44px;max-width:16ch}
.panel{position:relative;background:#fff;border-radius:32px;padding:28px;box-shadow:0 20px 50px -20px rgb(0 0 0/.6)}
.panel svg{display:block;width:100%;height:auto}
.cta{position:relative;margin-top:36px;font-size:30px;font-weight:600;letter-spacing:-.02em;color:#34d399}
.url{position:relative;margin-top:8px;font-size:22px;color:#a1a1aa}`;

const paginas = {
  imprimir: { ancho: 2048, alto: 2048, html: `<style>${estiloBase}svg{display:block;width:2048px;height:2048px}</style>${svgQR()}` },
  tarjeta: { ancho: 1080, alto: 1350, html: `<style>${estiloBase}${estiloTarjeta}
    body{width:1080px;height:1350px;display:grid;place-items:center;background:#0c0c0e}</style>${tarjeta(svgQR())}` },
  "tarjeta-3d": { ancho: 1080, alto: 1350, html: `<style>${estiloBase}${estiloTarjeta}
    body{width:1080px;height:1350px;display:grid;place-items:center;overflow:hidden;
      background:radial-gradient(90% 70% at 50% 40%,#1c2a24 0%,#0c0c0e 70%)}
    .escena{perspective:1600px}
    .tarjeta{transform:rotateX(16deg) rotateY(-20deg) rotateZ(3deg) scale(.9);
      box-shadow:inset 0 1px 0 rgb(255 255 255/.14),-40px 70px 90px -30px rgb(0 0 0/.85),0 0 0 1px rgb(52 211 153/.08)}</style>
    <div class="escena">${tarjeta(svgQR())}</div>` },
};

const navegador = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const resultados = {};
writeFileSync("qr-cesarcristancho.svg", svgQR());
for (const [nombre, { ancho, alto, html }] of Object.entries(paginas)) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pagina.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`, { waitUntil: "load" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(300);
  const archivo = `qr-${nombre}.png`;
  await pagina.screenshot({ path: archivo });
  await pagina.close();
  const png = PNG.sync.read(readFileSync(archivo));
  const leido = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  resultados[archivo] = leido ? `LEE: ${leido.data}` : "NO SE PUDO LEER";
}
await navegador.close();
console.log(JSON.stringify(resultados, null, 1));
