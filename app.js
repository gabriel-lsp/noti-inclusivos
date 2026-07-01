// Actualización de control para forzar nuevo despliegue de GitHub Pages.
const contenedorPrincipalNoti = document.querySelector("#lista-noti");
const busquedaNoti = document.querySelector("#busqueda-noti");
const filtroCategoria = document.querySelector("#filtro-categoria");
const contadorNoti = document.querySelector("#contador-noti");
const estadoNoti = document.querySelector("#estado-noti");

const DIAS_RECIENTES = 90;
let publicaciones = [];
let listaNotiRecientes = null;
let listaNotiArchivo = null;
let contadorRecientes = null;
let contadorArchivo = null;

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerEnlace(publicacion) {
  return publicacion.url || publicacion.enlace || "#";
}

function limpiarResumen(resumen) {
  const textoLimpio = String(resumen || "")
    .replace(/&lt;[^&]*?&gt;/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!textoLimpio || textoLimpio.length < 20) {
    return "Noticia publicada por la fuente indicada.";
  }

  return textoLimpio;
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

function esNoticiaReciente(publicacion) {
  const tiempo = obtenerTiempoFecha(publicacion.fecha);

  if (!tiempo) {
    return false;
  }

  const limite = Date.now() - DIAS_RECIENTES * 24 * 60 * 60 * 1000;
  return tiempo >= limite;
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

function aplicarEstilosBase() {
  if (!contenedorPrincipalNoti) return;

  contenedorPrincipalNoti.style.display = "block";
  contenedorPrincipalNoti.style.overflow = "visible";

  const estilo = document.createElement("style");
  estilo.textContent = `
    .bloque-lista-noti{
      margin-top:34px;
      padding-top:26px;
      border-top:1px solid var(--borde);
    }

    .bloque-lista-noti h3{
      margin:0;
      color:var(--azul-900);
      font-size:1.35rem;
      line-height:1.25;
    }

    .texto-bloque-noti{
      max-width:820px;
      margin:8px 0 0;
      color:var(--texto-suave);
    }

    .grid-noti-interna{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:18px;
      margin-top:24px;
      overflow:hidden;
    }

    @media(max-width:980px){
      .grid-noti-interna{grid-template-columns:1fr;}
    }
  `;
  document.head.appendChild(estilo);
}

function crearBloqueNoticias(idTitulo, titulo, descripcion) {
  const bloque = document.createElement("section");
  bloque.className = "bloque-lista-noti";
  bloque.setAttribute("aria-labelledby", idTitulo);

  const encabezado = document.createElement("h3");
  encabezado.id = idTitulo;
  encabezado.textContent = titulo;

  const texto = document.createElement("p");
  texto.className = "texto-bloque-noti";
  texto.textContent = descripcion;

  const contador = document.createElement("p");
  contador.className = "contador";

  const lista = document.createElement("div");
  lista.className = "grid-noti-interna";
  lista.setAttribute("aria-label", titulo);

  bloque.appendChild(encabezado);
  bloque.appendChild(texto);
  bloque.appendChild(contador);
  bloque.appendChild(lista);

  return { bloque, contador, lista };
}

function prepararEstructuraNoticias() {
  aplicarEstilosBase();
  contenedorPrincipalNoti.innerHTML = "";

  const recientes = crearBloqueNoticias(
    "titulo-recientes",
    "Noticias recientes",
    `Publicaciones identificadas dentro de los últimos ${DIAS_RECIENTES} días, priorizando las noticias obtenidas desde fuentes RSS.`
  );

  const archivo = crearBloqueNoticias(
    "titulo-archivo",
    "Archivo de noticias",
    `Publicaciones anteriores a los últimos ${DIAS_RECIENTES} días, conservadas como referencia informativa.`
  );

  contenedorPrincipalNoti.appendChild(recientes.bloque);
  contenedorPrincipalNoti.appendChild(archivo.bloque);

  listaNotiRecientes = recientes.lista;
  listaNotiArchivo = archivo.lista;
  contadorRecientes = recientes.contador;
  contadorArchivo = archivo.contador;
}

function crearTarjeta(publicacion) {
  const articulo = document.createElement("article");
  articulo.className = "tarjeta-noti";

  const bloqueContenido = document.createElement("div");
  const categoria = publicacion.categoria || publicacion.tema || "General";

  bloqueContenido.appendChild(crearElementoTexto("span", "etiqueta-noti", categoria));
  bloqueContenido.appendChild(crearElementoTexto("h3", "", publicacion.titulo || "Publicación sin título"));
  bloqueContenido.appendChild(crearElementoTexto("p", "", limpiarResumen(publicacion.resumen)));

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

function mostrarLista(contenedor, lista, mensajeVacio) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "estado-vacio";
    vacio.textContent = mensajeVacio;
    contenedor.appendChild(vacio);
    return;
  }

  lista.forEach((publicacion) => {
    contenedor.appendChild(crearTarjeta(publicacion));
  });
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

  const recientes = resultados.filter(esNoticiaReciente);
  const archivo = resultados.filter((publicacion) => !esNoticiaReciente(publicacion));

  mostrarLista(
    listaNotiRecientes,
    recientes,
    `No hay noticias de los últimos ${DIAS_RECIENTES} días con esos criterios.`
  );

  mostrarLista(
    listaNotiArchivo,
    archivo,
    "No hay noticias en archivo con esos criterios."
  );

  contadorNoti.textContent = `${resultados.length} publicación(es) encontrada(s).`;
  contadorRecientes.textContent = `${recientes.length} noticia(s) reciente(s).`;
  contadorArchivo.textContent = `${archivo.length} noticia(s) en archivo.`;
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

function unirSinDuplicados(listaRss, listaManual) {
  const unicas = [];
  const claves = new Set();

  [...listaRss, ...listaManual].forEach((publicacion) => {
    const enlace = obtenerEnlace(publicacion);
    const clave = enlace && enlace !== "#"
      ? enlace
      : normalizar(`${publicacion.titulo}-${publicacion.fuente}`);

    if (!claves.has(clave)) {
      claves.add(clave);
      unicas.push(publicacion);
    }
  });

  return unicas;
}

async function iniciarNotiInclusivos() {
  try {
    prepararEstructuraNoticias();

    const [manuales, rss] = await Promise.all([
      cargarJson("data/noticias.json?v=" + Date.now()),
      cargarJson("data/noticias-rss.json?v=" + Date.now())
    ]);

    publicaciones = ordenarPorFechaDescendente(unirSinDuplicados(rss, manuales));
    cargarCategorias();
    mostrarPublicaciones();

    if (estadoNoti) {
      estadoNoti.textContent = `Noticias cargadas correctamente. Se muestran como recientes las publicaciones de los últimos ${DIAS_RECIENTES} días.`;
    }
  } catch (error) {
    contenedorPrincipalNoti.innerHTML = `
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
