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

function obtenerEnlace(publicacion) {
  return publicacion.url || publicacion.enlace || "#";
}

function obtenerTiempoFecha(fecha) {
  const textoFecha = String(fecha || "").trim();

  if (!textoFecha) {
    return 0;
  }

  const fechaIso = new Date(textoFecha);

  if (!Number.isNaN(fechaIso.getTime())) {
    return fechaIso.getTime();
  }

  const meses = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    setiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11
  };

  const coincidencia = normalizar(textoFecha).match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);

  if (!coincidencia) {
    return 0;
  }

  const dia = Number(coincidencia[1]);
  const mes = meses[coincidencia[2]];
  const anio = Number(coincidencia[3]);

  if (!dia || mes === undefined || !anio) {
    return 0;
  }

  return new Date(anio, mes, dia).getTime();
}

function ordenarPorFechaDescendente(lista) {
  return [...lista].sort((a, b) => obtenerTiempoFecha(b.fecha) - obtenerTiempoFecha(a.fecha));
}

function crearElementoTexto(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  elemento.textContent = texto;
  return elemento;
}

function crearTarjeta(publicacion) {
  const articulo = document.createElement("article");
  articulo.className = "tarjeta-noti";

  const bloqueContenido = document.createElement("div");
  const categoria = publicacion.categoria || publicacion.tema || "General";

  bloqueContenido.appendChild(crearElementoTexto("span", "etiqueta-noti", categoria));
  bloqueContenido.appendChild(crearElementoTexto("h3", "", publicacion.titulo || "Publicación sin título"));
  bloqueContenido.appendChild(crearElementoTexto("p", "", publicacion.resumen || "Sin resumen disponible."));

  const bloqueMeta = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "meta-noti";
  meta.appendChild(crearElementoTexto("p", "fecha-noti", publicacion.fecha || "Fecha pendiente"));
  meta.appendChild(crearElementoTexto("p", "fuente-noti", publicacion.fuente || "Fuente institucional"));
  bloqueMeta.appendChild(meta);

  const enlace = obtenerEnlace(publicacion);

  if (enlace && enlace !== "#") {
    const enlaceNoti = document.createElement("a");
    enlaceNoti.className = "enlace-noti";
    enlaceNoti.href = enlace;
    enlaceNoti.target = "_blank";
    enlaceNoti.rel = "noopener noreferrer";
    enlaceNoti.textContent = "Leer noticia completa";
    bloqueMeta.appendChild(enlaceNoti);
  }

  articulo.appendChild(bloqueContenido);
  articulo.appendChild(bloqueMeta);

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

    publicaciones = ordenarPorFechaDescendente(unirSinDuplicados(manuales, rss));
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