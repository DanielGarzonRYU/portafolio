/* =============================================================
   TUS PROYECTOS
   Cada proyecto es un bloque { ... } dentro de la lista.
   Para agregar uno: copia un bloque completo, pégalo debajo
   del último (separado por una coma) y cambia los datos.

   Campos:
     id            Identificador único: minúsculas y guiones, sin tildes.
                   Se usa en el enlace:  proyecto.html?id=mi-proyecto
     nombre        Nombre del proyecto.
     tipo          Texto libre. Los filtros se crean solos a partir de él.
                   Sugeridos: "Aplicación móvil", "Aplicación web",
                   "Página web", "Herramienta", "Juego".
     estado        "Estable", "Beta" o "En desarrollo".
     destacado     true = aparece primero.
     fecha         "AAAA-MM" de publicación.
     resumen       Una frase: qué es.
     descripcion   ¿Qué hace? (uno o varios párrafos, en una lista).
     utilidad      ¿Para qué sirve y a quién le ayuda?
     casosDeUso    Ejemplos concretos de uso.
     funciones     Lista de funcionalidades.
     tecnologias   Con qué está hecho.
     plataforma    Dónde funciona (ej: "Android 8 o superior", "Navegador").
     imagen        Portada (ej: "img/proyectos/mi-app.png"). Vacío = portada automática.
     capturas      Lista de imágenes de pantallas.
     enlaces       web: sitio publicado · codigo: repositorio.
     demo          Demo en vivo dentro de la página:
                     { tipo: "web",   url: "..." }  página o app web
                     { tipo: "movil", url: "..." }  web/emulador con marco de celular
                     { tipo: "video", url: "..." }  enlace "embed" de YouTube
     descargas     Archivos (APK, ZIP, EXE...). Para el sha256 y el tamaño usa
                   herramientas/hash.ps1 (ver LEEME.md).
     versiones     Historial de cambios, de la más nueva a la más vieja.

   Si no usas un campo, déjalo vacío: "" o [].
   ============================================================= */

window.PROYECTOS = [
  {
    id: "calculadora-notas",
    nombre: "Calculadora de Notas",
    tipo: "Aplicación web",
    estado: "Estable",
    destacado: true,
    fecha: "2026-08",
    resumen: "Calcula tu nota definitiva por cortes y te dice cuánto necesitas para aprobar.",
    descripcion: [
      "Ingresas las notas de cada corte (en escala de 0 a 5) y la aplicación calcula la definitiva según los porcentajes 30 % – 30 % – 40 %.",
      "Si aún no tienes la nota del último corte, te indica exactamente cuánto necesitas sacar para aprobar la materia.",
    ],
    utilidad:
      "Sirve a estudiantes universitarios para planear su semestre: saber con anticipación si van bien, cuánto deben estudiar para el final y evitar sorpresas.",
    casosDeUso: [
      "Antes del examen final, saber qué nota mínima necesitas.",
      "Revisar rápidamente tu promedio en varias materias.",
    ],
    funciones: [
      "Cálculo automático de la nota definitiva",
      "Nota mínima necesaria en el último corte",
      "Porcentajes configurables",
      "Funciona en celular y computador, sin instalar nada",
    ],
    tecnologias: ["HTML", "CSS", "JavaScript"],
    plataforma: "Cualquier navegador",
    imagen: "",
    capturas: [],
    enlaces: {
      web: "demos/calculadora-notas/index.html",
      codigo: "",
    },
    demo: { tipo: "movil", url: "demos/calculadora-notas/index.html" },
    descargas: [],
    versiones: [
      { version: "1.0", fecha: "2026-08", cambios: ["Primera versión pública."] },
    ],
  },

  {
    // EJEMPLO: reemplázalo por una de tus apps
    id: "control-gastos",
    nombre: "Control de Gastos",
    tipo: "Aplicación móvil",
    estado: "Beta",
    destacado: true,
    fecha: "2026-06",
    resumen: "App Android para registrar gastos diarios y ver en qué se va el dinero.",
    descripcion: [
      "Permite anotar cada gasto en segundos, asignarle una categoría y consultar resúmenes por día, semana y mes.",
      "Los datos se guardan en el propio celular, sin necesidad de crear una cuenta ni de conexión a internet.",
    ],
    utilidad:
      "Ayuda a estudiantes y personas que quieren organizar sus finanzas a identificar gastos innecesarios y ahorrar.",
    casosDeUso: [
      "Controlar el presupuesto mensual de transporte y comida.",
      "Ver en una gráfica cuál categoría consume más dinero.",
    ],
    funciones: [
      "Registro rápido de gastos",
      "Categorías personalizables",
      "Gráficas por mes",
      "Funciona sin internet",
    ],
    tecnologias: ["Java", "Android", "SQLite"],
    plataforma: "Android 8.0 o superior",
    imagen: "",
    capturas: [],
    enlaces: { web: "", codigo: "" },
    demo: null,
    descargas: [
      {
        archivo: "control-gastos-v0.9.apk",
        version: "0.9",
        url: "",      // enlace de descarga (ej. GitHub Releases)
        tamano: "",   // lo da herramientas/hash.ps1
        sha256: "",   // lo da herramientas/hash.ps1
        fecha: "2026-06",
      },
    ],
    versiones: [
      { version: "0.9", fecha: "2026-06", cambios: ["Versión beta para pruebas.", "Gráficas mensuales."] },
    ],
  },

  {
    id: "portafolio",
    nombre: "Este portafolio",
    tipo: "Página web",
    estado: "Estable",
    destacado: false,
    fecha: "2026-09",
    resumen: "El sitio que estás viendo: un catálogo de proyectos con demos, descargas verificadas y asistente con IA.",
    descripcion: [
      "Reúne todos mis proyectos en un solo lugar, con su descripción, demos en vivo y descargas.",
      "Incluye un asistente con inteligencia artificial que responde preguntas sobre los proyectos y un verificador de archivos que comprueba que las descargas no fueron alteradas.",
    ],
    utilidad:
      "Permite a reclutadores, profesores y usuarios conocer mi trabajo, probarlo y descargarlo desde un único enlace fácil de compartir.",
    casosDeUso: [
      "Compartir un solo enlace en el CV o en redes.",
      "Distribuir aplicaciones APK de forma segura.",
    ],
    funciones: [
      "Catálogo con buscador y filtros",
      "Asistente con IA",
      "Demos en vivo",
      "Descargas verificadas con SHA-256",
      "Contador de visitas y descargas",
    ],
    tecnologias: ["HTML", "CSS", "JavaScript", "Cloudflare Pages", "Claude API"],
    plataforma: "Navegador",
    imagen: "",
    capturas: [],
    enlaces: { web: "index.html", codigo: "" },
    demo: null,
    descargas: [],
    versiones: [
      { version: "1.0", fecha: "2026-09", cambios: ["Lanzamiento del sitio."] },
    ],
  },
];
