/* =============================================================
   TUS DATOS PERSONALES
   Edita este archivo para cambiar tu nombre, presentación,
   habilidades y formas de contacto. Guarda y recarga la página.
   ============================================================= */

window.PERFIL = {
  nombre: "Cesar Julián",
  iniciales: "CJ",
  titulo: "Estudiante de Ingeniería · Desarrollador de software",
  ubicacion: "Bogotá, Colombia",

  // Frase corta que aparece en la portada
  presentacion:
    "Desarrollo aplicaciones web y móviles que resuelven problemas reales. " +
    "Aquí encontrarás mis proyectos: qué hace cada uno, para qué sirve y cómo probarlo o descargarlo.",

  // Texto de la sección "Sobre mí" (cada elemento es un párrafo)
  sobreMi: [
    "Soy estudiante de la Universidad ECCI y me apasiona crear software útil, claro y bien hecho.",
    "Este sitio reúne mis proyectos para que cualquier persona pueda conocerlos, probarlos en línea o descargarlos de forma segura.",
  ],

  // Habilidades agrupadas (puedes crear, borrar o renombrar grupos)
  habilidades: {
    "Lenguajes": ["JavaScript", "HTML", "CSS", "Java", "Python"],
    "Desarrollo": ["Aplicaciones web", "Aplicaciones Android", "Bases de datos"],
    "Herramientas": ["Git", "VS Code", "Android Studio"],
  },

  // Formación / experiencia (de la más reciente a la más antigua)
  trayectoria: [
    { periodo: "2023 – actualidad", titulo: "Ingeniería", lugar: "Universidad ECCI" },
  ],

  // Contacto: deja "" en lo que no quieras mostrar
  contacto: {
    email: "cesarjulianecci@gmail.com",
    github: "",     // ej: "https://github.com/tu-usuario"
    linkedin: "",   // ej: "https://www.linkedin.com/in/tu-usuario"
    whatsapp: "",   // ej: "573001234567" (código de país + número, sin espacios)
  },
};
