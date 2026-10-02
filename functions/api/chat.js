/* =============================================================
   /api/chat  →  "Pregúntale a mi IA"
   Se ejecuta en Cloudflare (no en el navegador), así tu clave
   de API nunca queda visible para los visitantes.

   Necesita la variable secreta ANTHROPIC_API_KEY (ver LEEME.md).
   Usa la base de datos CONTADORES (si existe) para limitar cuántas
   preguntas puede hacer cada visitante por minuto.
   ============================================================= */

import Anthropic from "@anthropic-ai/sdk";

const MODELO = "claude-opus-5-5";
const PREGUNTAS_POR_MINUTO = 8;
const MAX_MENSAJES = 10;
const MAX_CARACTERES = 1000;

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "La IA no está configurada." }, 503);

  if (await limiteExcedido(request, env)) return json({ error: "Demasiadas preguntas. Espera un minuto." }, 429);

  let mensajes;
  try {
    mensajes = limpiarMensajes((await request.json()).mensajes);
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  if (!mensajes) return json({ error: "Solicitud inválida." }, 400);

  // Lee tus datos directamente de los archivos del sitio: lo que edites
  // en config.js y proyectos.js es lo que la IA sabrá.
  const [perfil, proyectos] = await Promise.all([leerArchivo(env, request, "/js/config.js"), leerArchivo(env, request, "/js/proyectos.js")]);

  const sistema = `Eres el asistente del portafolio web personal. Atiendes a visitantes (reclutadores, profesores, usuarios) que quieren conocer al autor y sus proyectos.

Reglas:
- Responde solo con base en los datos de abajo. Si algo no está en los datos, dilo con naturalidad y sugiere usar la sección de Contacto. No inventes proyectos, cifras, experiencia ni enlaces.
- Responde en el idioma del visitante, en tono profesional y cercano, en texto plano (sin Markdown ni asteriscos). Sé breve: normalmente 2 a 5 frases o una lista corta con viñetas "•".
- Explica qué hace cada proyecto y para qué le sirve a la persona que pregunta.
- Para mencionar un proyecto escribe su id entre dobles corchetes, por ejemplo [[calculadora-notas]]; la página lo convierte en un enlace con su nombre, así que no repitas el nombre al lado.
- Si preguntan por descargas, recuerda que cada archivo publica su huella SHA-256 y que en la página del proyecto se puede verificar el archivo descargado.
- Si te piden algo ajeno al portafolio (tareas, código, temas generales), indica amablemente que solo puedes hablar sobre el autor y sus proyectos.

<datos_del_autor>
${perfil}
</datos_del_autor>

<proyectos>
${proyectos}
</proyectos>`;

  const cliente = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const respuesta = await cliente.beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: sistema, cache_control: { type: "ephemeral" } }],
      messages: mensajes,
    });

    if (respuesta.stop_reason === "refusal") {
      return json({ respuesta: "No puedo ayudarte con eso. Puedo contarte sobre los proyectos del portafolio." });
    }
    const texto = respuesta.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return json({ respuesta: texto || "No tengo una respuesta para eso. Prueba preguntando por un proyecto." });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "Servicio ocupado." }, 429);
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("ANTHROPIC_API_KEY inválida");
      return json({ error: "La IA no está configurada correctamente." }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Error de la API (${error.status}):`, error.message);
      return json({ error: "La IA no está disponible." }, 502);
    }
    console.error(error);
    return json({ error: "Error interno." }, 500);
  }
}

// Acepta solo mensajes de texto, alternados, empezando y terminando por el visitante
function limpiarMensajes(lista) {
  if (!Array.isArray(lista)) return null;
  const mensajes = lista
    .slice(-MAX_MENSAJES)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) }));
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== "user") return null;
  for (let i = 1; i < mensajes.length; i++) if (mensajes[i].role === mensajes[i - 1].role) return null;
  return mensajes;
}

async function leerArchivo(env, request, ruta) {
  const r = await env.ASSETS.fetch(new URL(ruta, request.url));
  return r.ok ? await r.text() : "(no disponible)";
}

async function limiteExcedido(request, env) {
  if (!env.CONTADORES) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const clave = `limite:${ip}:${Math.floor(Date.now() / 60000)}`;
  const usadas = parseInt((await env.CONTADORES.get(clave)) || "0", 10);
  if (usadas >= PREGUNTAS_POR_MINUTO) return true;
  await env.CONTADORES.put(clave, String(usadas + 1), { expirationTtl: 120 });
  return false;
}

function json(datos, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
