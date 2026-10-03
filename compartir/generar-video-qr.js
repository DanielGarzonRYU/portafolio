// Video de la tarjeta QR girando en 3D (7 s, 1080x1350, 30 fps).
// Cada cuadro se dibuja fijando el tiempo exacto de las animaciones CSS, así el movimiento es perfecto.
import { chromium } from "playwright";
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
import { PNG } from "pngjs";
import jsQR from "jsqr";

const FPS = 30, DURACION = 7;
const FUENTE = "data:font/woff2;base64," + readFileSync("C:/Users/ccdga/Desktop/CL/mi-WEB/sitio/fuentes/Geist-Variable.woff2").toString("base64");
const svg = readFileSync("qr-cesarcristancho.svg", "utf8");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Geist;src:url("${FUENTE}") format("woff2");font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1080px;height:1350px;overflow:hidden;display:grid;place-items:center;font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased;background:#0c0c0e}
.fondo{position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 45%,#16382b 0%,#0c0c0e 70%);animation:respirar 7s ease-in-out both}
.escena{perspective:1700px;position:relative}
.tarjeta{position:relative;width:820px;padding:64px 64px 56px;border-radius:44px;color:#f4f4f5;overflow:hidden;
  background:radial-gradient(130% 120% at 0% 0%,#2c2c33 0%,#16161a 45%,#0b0b0d 100%);
  border:1px solid rgb(255 255 255/.1);
  box-shadow:inset 0 1px 0 rgb(255 255 255/.14),0 60px 120px -40px rgb(0 0 0/.9);
  animation:girar 7s both}
.tarjeta::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 50% at 100% 100%,rgb(52 211 153/.22),transparent 70%);pointer-events:none}
.brillo{position:absolute;inset:-40%;pointer-events:none;z-index:3;
  background:linear-gradient(105deg,transparent 42%,rgb(255 255 255/.16) 50%,transparent 58%);
  animation:barrer 7s both}
.arriba{display:flex;align-items:center;gap:16px;position:relative}
.mono{display:grid;place-items:center;width:56px;height:56px;border-radius:999px;background:#f4f4f5;color:#0b0b0d;font-weight:650;font-size:20px}
.nombre{font-size:24px;font-weight:600;letter-spacing:-.02em}
h1{position:relative;font-size:46px;line-height:1.08;letter-spacing:-.04em;font-weight:600;margin:40px 0 44px;max-width:16ch}
.panel{position:relative;background:#fff;border-radius:32px;padding:28px}
.panel svg{display:block;width:100%;height:auto}
.cta{position:relative;margin-top:36px;font-size:30px;font-weight:600;letter-spacing:-.02em;color:#34d399}
.url{position:relative;margin-top:8px;font-size:22px;color:#a1a1aa}
/* 0–60%: entra girando desde un costado y se acomoda de frente; 60–100%: quieta para escanear */
@keyframes girar{
  0%{transform:translateY(90px) rotateY(-62deg) rotateX(20deg) rotateZ(-6deg) scale(.78);opacity:0;animation-timing-function:cubic-bezier(.23,1,.32,1)}
  12%{opacity:1}
  38%{transform:translateY(0) rotateY(22deg) rotateX(-6deg) rotateZ(2deg) scale(.9);animation-timing-function:cubic-bezier(.77,0,.175,1)}
  60%{transform:none}
  100%{transform:none}}
/* El reflejo cruza la tarjeta mientras gira y da un último destello suave al quedar quieta */
@keyframes barrer{
  0%,14%{transform:translateX(-60%)}
  46%{transform:translateX(60%)}
  46.1%,68%{transform:translateX(-60%)}
  88%,100%{transform:translateX(60%)}}
@keyframes respirar{0%{opacity:.4}50%{opacity:1}100%{opacity:.75}}
</style></head><body>
<div class="fondo"></div>
<div class="escena"><div class="tarjeta">
  <div class="brillo"></div>
  <div class="arriba"><span class="mono">CC</span><span class="nombre">Cesar Daniel Cristancho Garzón</span></div>
  <h1>Páginas web y apps que trabajan para tu negocio.</h1>
  <div class="panel">${svg}</div>
  <p class="cta">Escanea para ver mi trabajo</p>
  <p class="url">cesarcristancho.pages.dev</p>
</div></div>
</body></html>`;

rmSync("cuadros", { recursive: true, force: true });
mkdirSync("cuadros");
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
await pagina.setContent(html, { waitUntil: "load" });
await pagina.evaluate(() => document.fonts.ready);
await pagina.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
const total = FPS * DURACION;
for (let i = 0; i < total; i++) {
  const ms = (i / FPS) * 1000;
  await pagina.evaluate((ms) => document.getAnimations().forEach((a) => (a.currentTime = ms)), ms);
  await pagina.screenshot({ path: `cuadros/${String(i).padStart(4, "0")}.png` });
}
await navegador.close();

// Comprobar que la tarjeta se puede escanear cuando queda quieta
const ultimo = PNG.sync.read(readFileSync(`cuadros/${String(total - 1).padStart(4, "0")}.png`));
const leido = jsQR(new Uint8ClampedArray(ultimo.data), ultimo.width, ultimo.height);
console.log("Cuadro final:", leido ? `LEE ${leido.data}` : "NO SE PUDO LEER");

execFileSync(ffmpeg, ["-v", "error", "-y", "-framerate", String(FPS), "-i", "cuadros/%04d.png",
  "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "qr-tarjeta-3d.mp4"], { stdio: "inherit" });
console.log("Listo: qr-tarjeta-3d.mp4");
