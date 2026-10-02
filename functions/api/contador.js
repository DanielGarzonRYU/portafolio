/* =============================================================
   /api/contador  →  visitas y descargas de cada proyecto
   Guarda los números en la base de datos KV "CONTADORES" de
   Cloudflare (gratis). Ver LEEME.md para crearla.

   GET  /api/contador?ids=a,b,c      → { a: { visitas, descargas }, ... }
   POST /api/contador {id, tipo}     → suma 1 (tipo: "visita" | "descarga")
   ============================================================= */

const FORMATO_ID = /^[a-z0-9-]{1,60}$/;
const PREFIJOS = { visita: "v", descarga: "d" };

export async function onRequestGet({ request, env }) {
  if (!env.CONTADORES) return json({ error: "Contador no configurado." }, 503);

  const ids = (new URL(request.url).searchParams.get("ids") || "")
    .split(",")
    .filter((id) => FORMATO_ID.test(id))
    .slice(0, 100);

  const resultado = {};
  await Promise.all(
    ids.map(async (id) => {
      const [visitas, descargas] = await Promise.all([env.CONTADORES.get(`v:${id}`), env.CONTADORES.get(`d:${id}`)]);
      resultado[id] = { visitas: parseInt(visitas || "0", 10), descargas: parseInt(descargas || "0", 10) };
    })
  );
  return json(resultado, 200, "public, max-age=30");
}

export async function onRequestPost({ request, env }) {
  if (!env.CONTADORES) return json({ error: "Contador no configurado." }, 503);

  let datos;
  try {
    datos = JSON.parse(await request.text());
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const { id, tipo } = datos || {};
  if (!FORMATO_ID.test(id || "") || !PREFIJOS[tipo]) return json({ error: "Solicitud inválida." }, 400);

  // Solo cuenta proyectos que existen de verdad en proyectos.js
  const proyectos = await env.ASSETS.fetch(new URL("/js/proyectos.js", request.url)).then((r) => r.text());
  if (!new RegExp(`\\bid:\\s*["']${id}["']`).test(proyectos)) return json({ error: "Proyecto desconocido." }, 404);

  const clave = `${PREFIJOS[tipo]}:${id}`;
  const actual = parseInt((await env.CONTADORES.get(clave)) || "0", 10);
  await env.CONTADORES.put(clave, String(actual + 1));
  return json({ ok: true });
}

function json(datos, estado = 200, cache = "no-store") {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}
