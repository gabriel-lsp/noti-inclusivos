const fs = require("fs/promises");

const PALABRAS_CRITERIO = [
  // Inclusión educativa y educación especial
  "inclusión",
  "inclusion",
  "inclusiva",
  "inclusivo",
  "educación inclusiva",
  "educacion inclusiva",
  "educación especial",
  "educacion especial",
  "educación básica especial",
  "educacion basica especial",
  "atención a la diversidad",
  "atencion a la diversidad",
  "diversidad educativa",
  "necesidades educativas",
  "necesidades educativas especiales",
  "nee",
  "cebe",
  "prite",
  "saanee",
  "crebe",
  "cenarebe",
  "ugel",
  "minedu",

  // Discapacidad y accesibilidad
  "discapacidad",
  "persona con discapacidad",
  "personas con discapacidad",
  "estudiantes con discapacidad",
  "alumnos con discapacidad",
  "niños con discapacidad",
  "ninas con discapacidad",
  "niñas con discapacidad",
  "accesibilidad",
  "accesible",
  "accesibles",
  "barreras",
  "barreras educativas",
  "ajustes razonables",
  "apoyos educativos",
  "apoyos pedagógicos",
  "apoyos pedagogicos",
  "adaptaciones curriculares",
  "diversificación curricular",
  "diversificacion curricular",
  "diseño universal para el aprendizaje",
  "diseno universal para el aprendizaje",
  "dua",
  "materiales accesibles",
  "recursos educativos accesibles",
  "tecnología accesible",
  "tecnologia accesible",

  // Comunicación aumentativa, alternativa y accesible
  "comunicación aumentativa y alternativa",
  "comunicacion aumentativa y alternativa",
  "comunicación aumentativa",
  "comunicacion aumentativa",
  "comunicación alternativa",
  "comunicacion alternativa",
  "caa",
  "pictogramas",
  "pecs",
  "tablero de comunicación",
  "tablero de comunicacion",
  "sistemas alternativos de comunicación",
  "sistemas alternativos de comunicacion",

  // Accesibilidad digital e informativa
  "lectura fácil",
  "lectura facil",
  "documento accesible",
  "documentos accesibles",
  "accesibilidad web",
  "lector de pantalla",
  "lectores de pantalla",
  "subtitulado",
  "audiodescripción",
  "audiodescripcion",

  // Discapacidad visual
  "discapacidad visual",
  "ceguera",
  "ciego",
  "ciega",
  "personas ciegas",
  "estudiantes ciegos",
  "baja visión",
  "baja vision",
  "visión reducida",
  "vision reducida",
  "deficiencia visual",
  "limitación visual",
  "limitacion visual",
  "braille",
  "sistema braille",
  "lectoescritura braille",
  "macrotipo",
  "tiflotecnología",
  "tiflotecnologia",
  "orientación y movilidad",
  "orientacion y movilidad",
  "bastón blanco",
  "baston blanco",
  "tiflología",
  "tiflologia",
  "lupa electrónica",
  "lupa electronica",
  "magnificador",

  // Discapacidad auditiva y comunicación
  "discapacidad auditiva",
  "sordera",
  "sordo",
  "sorda",
  "personas sordas",
  "estudiantes sordos",
  "sordera total",
  "hipoacusia",
  "hipoacúsico",
  "hipoacusico",
  "deficiencia auditiva",
  "lengua de señas",
  "lengua de senas",
  "lengua de señas peruana",
  "lengua de senas peruana",
  "lsp",
  "señas",
  "senas",
  "intérprete de lengua de señas",
  "interprete de lengua de senas",
  "comunicación accesible",
  "comunicacion accesible",
  "implante coclear",
  "audífonos",
  "audifonos",
  "pérdida auditiva",
  "perdida auditiva",
  "cultura sorda",
  "educación bilingüe bicultural",
  "educacion bilingue bicultural",

  // Sordoceguera
  "sordoceguera",
  "sordo-ceguera",
  "sordo ceguera",
  "persona con sordoceguera",
  "personas con sordoceguera",
  "estudiantes con sordoceguera",

  // Neurodiversidad, TEA, TDAH y aprendizaje
  "neurodiversidad",
  "neurodivergencia",
  "neurodivergente",
  "autismo",
  "autista",
  "trastorno del espectro autista",
  "tea",
  "tdah",
  "trastorno por déficit de atención",
  "trastorno por deficit de atencion",
  "déficit de atención",
  "deficit de atencion",
  "hiperactividad",
  "dificultades de aprendizaje",
  "problemas de aprendizaje",
  "trastornos de aprendizaje",
  "dislexia",
  "discalculia",
  "disgrafía",
  "disgrafia",
  "trastorno específico del aprendizaje",
  "trastorno especifico del aprendizaje",
  "trastorno del lenguaje",
  "trastorno específico del lenguaje",
  "trastorno especifico del lenguaje",
  "altas capacidades",
  "doble excepcionalidad",

  // Discapacidad intelectual, física, múltiple y psicosocial
  "discapacidad intelectual",
  "discapacidad cognitiva",
  "síndrome de down",
  "sindrome de down",
  "discapacidad física",
  "discapacidad fisica",
  "discapacidad motora",
  "discapacidad motriz",
  "parálisis cerebral",
  "paralisis cerebral",
  "movilidad reducida",
  "discapacidad múltiple",
  "discapacidad multiple",
  "multidiscapacidad",
  "pluridiscapacidad",
  "discapacidad psicosocial",
  "salud mental",
  "trastorno mental",

  // Familia, docentes, participación y transición
  "familias",
  "familias con discapacidad",
  "docentes inclusivos",
  "docentes de educación especial",
  "docentes de educacion especial",
  "capacitación docente",
  "capacitacion docente",
  "formación docente",
  "formacion docente",
  "convivencia escolar",
  "participación educativa",
  "participacion educativa",
  "transición a la vida adulta",
  "transicion a la vida adulta",
  "vida independiente",
  "habilidades adaptativas",
  "autonomía",
  "autonomia",
  "inserción laboral",
  "insercion laboral",
  "formación ocupacional",
  "formacion ocupacional"
];

function limpiarHtml(texto = "") {
  return texto
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizar(texto = "") {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerEtiqueta(xml, etiqueta) {
  const expresion = new RegExp(`<${etiqueta}[^>]*>([\\s\\S]*?)<\\/${etiqueta}>`, "i");
  const coincidencia = xml.match(expresion);
  if (!coincidencia) return "";
  return limpiarHtml(coincidencia[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
}

function obtenerItems(xml) {
  const coincidencias = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return coincidencias;
}

function obtenerEnlace(item) {
  const linkTexto = obtenerEtiqueta(item, "link");
  if (linkTexto) return linkTexto;

  const href = item.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return href ? href[1] : "#";
}

function obtenerFecha(item) {
  const fecha = obtenerEtiqueta(item, "pubDate") || obtenerEtiqueta(item, "published") || obtenerEtiqueta(item, "updated");
  if (!fecha) return "Fecha pendiente";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Lima"
  });
}

function cumpleCriterio(publicacion) {
  const texto = normalizar(`${publicacion.titulo} ${publicacion.resumen} ${publicacion.categoria}`);
  return PALABRAS_CRITERIO.some((palabra) => texto.includes(normalizar(palabra)));
}

async function leerJson(ruta) {
  const contenido = await fs.readFile(ruta, "utf8");
  return JSON.parse(contenido);
}

async function obtenerNoticiasDeFuente(fuente) {
  const respuesta = await fetch(fuente.url, {
    headers: {
      "user-agent": "NotiInclusivosCREBE/1.0"
    }
  });

  if (!respuesta.ok) {
    throw new Error(`No se pudo leer ${fuente.nombre}`);
  }

  const xml = await respuesta.text();
  const items = obtenerItems(xml);

  return items.map((item) => {
    const titulo = obtenerEtiqueta(item, "title") || "Publicación sin título";
    const resumen = obtenerEtiqueta(item, "description") || obtenerEtiqueta(item, "summary") || obtenerEtiqueta(item, "content") || "Sin resumen disponible.";

    return {
      titulo,
      categoria: fuente.categoria || "Noticias RSS",
      fecha: obtenerFecha(item),
      fuente: fuente.nombre,
      resumen: resumen.length > 260 ? `${resumen.slice(0, 257)}...` : resumen,
      palabras: PALABRAS_CRITERIO.filter((palabra) => normalizar(`${titulo} ${resumen}`).includes(normalizar(palabra))).slice(0, 8),
      enlace: obtenerEnlace(item)
    };
  }).filter(cumpleCriterio);
}

async function main() {
  const fuentes = await leerJson("rss-feeds.json");
  const noticias = [];

  for (const fuente of fuentes) {
    try {
      const obtenidas = await obtenerNoticiasDeFuente(fuente);
      noticias.push(...obtenidas);
    } catch (error) {
      console.warn(error.message);
    }
  }

  const unicas = [];
  const enlaces = new Set();

  for (const noticia of noticias) {
    const clave = noticia.enlace || `${noticia.titulo}-${noticia.fuente}`;
    if (!enlaces.has(clave)) {
      enlaces.add(clave);
      unicas.push(noticia);
    }
  }

  await fs.writeFile("noticias-rss.json", `${JSON.stringify(unicas.slice(0, 30), null, 2)}\n`, "utf8");
  console.log(`Noticias RSS guardadas: ${unicas.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
