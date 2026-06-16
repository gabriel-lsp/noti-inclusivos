# Estructura del proyecto

Este documento propone una organización básica para el repositorio Noti Inclusivos.

La estructura puede modificarse según el avance del boletín, pero se recomienda mantener una separación clara entre archivos principales, datos, imágenes, documentos descargables y respaldo documental.

Estructura sugerida:

```text
noti-inclusivos/
│
├── index.html
├── estilos.css
├── app.js
├── README.md
├── LICENSE
│
├── datos/
│   └── publicaciones.json
│
├── imagenes/
│   ├── flyers/
│   ├── comunicados/
│   └── recursos/
│
├── documentos/
│   └── materiales-descargables/
│
└── docs/
    ├── alcance-comunicacional.md
    ├── fuentes-y-creditos.md
    ├── uso-permitido.md
    ├── respaldo-institucional.md
    ├── criterios-de-publicacion.md
    ├── estructura-del-proyecto.md
    └── bitacora-de-cambios.md
```

Descripción de archivos y carpetas:

`index.html` contiene la estructura principal del boletín digital.

`estilos.css` define la apariencia visual, distribución de secciones, colores, tipografías, espaciados y adaptación a dispositivos.

`app.js` contiene la lógica de carga, filtros, búsqueda, interacción y presentación dinámica de publicaciones, si corresponde.

`datos/` almacena información organizada sobre publicaciones, categorías, fechas, enlaces, responsables o recursos asociados.

`imagenes/` contiene flyers, comunicados visuales, recursos gráficos o imágenes de apoyo. Deben contar con fuente clara o autorización de uso.

`documentos/` puede contener materiales descargables, guías, orientaciones o archivos complementarios.

`docs/` reúne documentos de respaldo, criterios de publicación, uso permitido, créditos, estructura y bitácora.

Para mantener ordenado el repositorio, se recomienda usar nombres de archivo en minúsculas, sin tildes, sin espacios y con guiones medios. Por ejemplo: `capacitacion-dua-2026.png`, `orientaciones-familias.pdf`, `publicaciones.json`.

También se recomienda organizar las publicaciones por fecha, categoría y público objetivo para facilitar su búsqueda y actualización.