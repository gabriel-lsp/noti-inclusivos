const fs = require("fs/promises");

const PALABRAS_CRITERIO = [
  "inclusión",
  "inclusion",
  "inclusiva",
  "inclusivo",
  "discapacidad",
  "accesibilidad",
  "accesible",
  "educación especial",
  "educacion especial",
  "educación inclusiva",
  "educacion inclusiva",
  "tea",
  "autismo",
  "tdah",
  "braille",
  "lengua de señas",
  "lengua de senas",
  "señas",
  "senas",
  "ajustes razonables",
  "apoyos educativos",
  "diversidad",
  "necesidades educativas"
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
