const listaNoti = document.querySelector("#lista-noti");
const busquedaNoti = document.querySelector("#busqueda-noti");
const filtroCategoria = document.querySelector("#filtro-categoria");
const contadorNoti = document.querySelector("#contador-noti");
const estadoNoti = document.querySelector("#estado-noti");

let publicaciones = [];

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escaparHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerEnlace(publicacion) {
  return publicacion.url || publicacion.enlace || "#";
}

function crearTarjeta(publicacion) {
  const articulo = document.createElement("article");
  articulo.className = "tarjeta-noti";

  const enlace = obtenerEnlace(publicacion);
  const enlaceValido = enlace && enlace !== "#";
  const titulo = escaparHtml(publicacion.titulo || "Publicación sin título");
  const categoria = escaparHtml(publicacion.categoria || publicacion.tema || "General");
  const resumen = escaparHtml(publicacion.resumen || "Sin resumen disponible.");
  const fecha = escaparHtml(publicacion.fecha || "Fecha pendiente");
  const fuente = escaparHtml(publicacion.fuente || "Fuente institucional");
  const enlaceSeguro = escaparHtml(enlace);

  articulo.innerHTML = `
    <div>
      <span class="etiqueta-noti">${categoria}</span>
      <h3>${titulo}</h3>
      <p>${resumen}</p>
    </div>
    <div>
      <div class="meta-noti">
        <p class="fecha-noti">${fecha}</p>
        <p class="fuente-noti">${fuente}</p>
      </div>
      ${enlaceValido ? `<a class="enlace-noti" href="${enlaceSeguro}" target="_blank" rel="noopener noreferrer">Leer noticia completa</a>` : ""}
    </div>
  `;

  return articulo;
}

function mostrarPublicaciones() {
  const textoBusqueda = normalizar(busquedaNoti.value.trim());
  const categoriaSeleccionada = filtroCategoria.value;

  const resultados = publicaciones.filter((publicacion) => {
    const categoria = publicacion.categoria || publicacion.tema || "General";
    const coincideCategoria = categoriaSeleccionada === "todas" || categoria === categoriaSeleccionada;
    const palabras = Array.isArray(publicacion.palabras) ? publicacion.palabras.join(" ") : "";
    const contenido = normalizar(`${publicacion.titulo} ${categoria} ${publicacion.resumen} ${publicacion.fuente || ""} ${obtenerEnlace(publicacion)} ${palabras}`);
    const coincideBusqueda = contenido.includes(textoBusqueda);

    return coincideCategoria && coincideBusqueda;
  });

  listaNoti.innerHTML = "";

  if (resultados.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "estado-vacio";
    vacio.textContent = "No se encontraron publicaciones con esos criterios.";
    listaNoti.appendChild(vacio);
  } else {
    resultados.forEach((publicacion) => {
      listaNoti.appendChild(crearTarjeta(publicacion));
    });
  }

  contadorNoti.textContent = `${resultados.length} publicación(es) encontrada(s).`;
}

function cargarCategorias() {
  filtroCategoria.innerHTML = '<option value="todas">Todas</option>';

  const categorias = [...new Set(publicaciones.map((publicacion) => publicacion.categoria || publicacion.tema || "General"))].sort((a, b) => {
    return a.localeCompare(b, "es");
  });

  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    filtroCategoria.appendChild(opcion);
  });
}

async function cargarJson(ruta) {
  const respuesta = await fetch(ruta);

  if (!respuesta.ok) {
    return [];
  }

  const data = await respuesta.json();
  return Array.isArray(data) ? data : (Array.isArray(data.noticias) ? data.noticias : []);
}

function unirSinDuplicados(listaManual, listaRss) {
  const unicas = [];
  const claves = new Set();

  [...listaManual, ...listaRss].forEach((publicacion) => {
    const enlace = obtenerEnlace(publicacion);
    const clave = enlace && enlace !== "#"
      ? enlace
      : `${publicacion.titulo}-${publicacion.fuente}`;

    if (!claves.has(clave)) {
      claves.add(clave);
      unicas.push(publicacion);
    }
  });

  return unicas;
}

async function iniciarNotiInclusivos() {
  try {
    const [manuales, rss] = await Promise.all([
      cargarJson("data/noticias.json?v=" + Date.now()),
      cargarJson("data/noticias-rss.json?v=" + Date.now())
    ]);

    publicaciones = unirSinDuplicados(manuales, rss);
    cargarCategorias();
    mostrarPublicaciones();

    if (estadoNoti) {
      estadoNoti.textContent = "Noticias cargadas correctamente.";
    }
  } catch (error) {
    listaNoti.innerHTML = `
      <p class="estado-vacio">
        No se pudieron cargar las publicaciones. Inténtalo nuevamente más tarde.
      </p>
    `;
    contadorNoti.textContent = "";

    if (estadoNoti) {
      estadoNoti.textContent = "No se pudieron cargar las noticias.";
    }
  }
}

busquedaNoti.addEventListener("input", mostrarPublicaciones);
filtroCategoria.addEventListener("change", mostrarPublicaciones);

iniciarNotiInclusivos();