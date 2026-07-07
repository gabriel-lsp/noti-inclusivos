import json
from datetime import datetime, timezone
from pathlib import Path

# Noticias seleccionadas manualmente para el módulo NI.
# Criterio: una noticia actual y el resto de semanas anteriores, evitando repetir
# los títulos que venían apareciendo en la carga automática anterior.

NOTICIAS = [
    {
        "titulo": "Elche pone en marcha su primera Escuela de Verano Inclusiva para niños de 5 a 12 años",
        "fuente": "Cadena SER",
        "fecha": "2026-07-06",
        "categoria": "Inclusión y neurodiversidad",
        "resumen": "Elche inauguró una escuela de verano inclusiva con actividades deportivas, artísticas y apoyos para niños con necesidades específicas y personas neurodivergentes. La experiencia se desarrolla hasta el 31 de julio y se plantea como piloto para futuras ediciones.",
        "url": "https://cadenaser.com/comunitat-valenciana/2026/07/06/elche-pone-en-marcha-su-primera-escuela-de-verano-inclusiva-para-ninos-de-5-a-12-anos-radio-elche/",
        "palabras": ["inclusión", "neurodiversidad", "actividades adaptadas", "participación"],
    },
    {
        "titulo": "Personas con discapacidad de América Latina y el Caribe reclaman ser protagonistas del cambio",
        "fuente": "El País - América Futura",
        "fecha": "2026-06-10",
        "categoria": "Derechos y participación",
        "resumen": "La publicación resalta el enfoque de derechos de las personas con discapacidad y la necesidad de que participen en las decisiones que afectan su vida. El tema se vincula con accesibilidad, autonomía, educación, justicia y cambio cultural.",
        "url": "https://elpais.com/america-futura/2026-06-10/las-personas-con-discapacidad-de-america-latina-y-el-caribe-reclaman-ser-protagonistas-del-cambio.html",
        "palabras": ["discapacidad", "derechos", "participación", "América Latina"],
    },
    {
        "titulo": "Huesca Más Inclusiva cumple diez años como proyecto de referencia en inclusión",
        "fuente": "Cadena SER",
        "fecha": "2026-06-08",
        "categoria": "Accesibilidad e inclusión comunitaria",
        "resumen": "El proyecto Huesca Más Inclusiva celebra diez años de trabajo colaborativo en accesibilidad, empleo, cultura, educación y sensibilización. La experiencia muestra cómo las alianzas entre instituciones y comunidad pueden sostener iniciativas inclusivas.",
        "url": "https://cadenaser.com/aragon/2026/06/08/huesca-mas-inclusiva-cumple-diez-anos-consolidado-como-un-proyecto-de-referencia-en-la-provincia-y-con-proyeccion-de-futuro-radio-huesca/",
        "palabras": ["accesibilidad", "inclusión social", "educación", "sensibilización"],
    },
    {
        "titulo": "La Conferencia Iberoamericana de Educación acuerda una agenda común sobre IA y Formación Profesional",
        "fuente": "El País",
        "fecha": "2026-05-28",
        "categoria": "Educación inclusiva y políticas públicas",
        "resumen": "La XXIX Conferencia Iberoamericana de Educación aprobó una agenda común que incluye el uso ético de la inteligencia artificial, la formación profesional y la continuidad educativa. El acuerdo reafirma el compromiso regional con una educación inclusiva, equitativa y de calidad.",
        "url": "https://elpais.com/espana/catalunya/2026-05-28/la-ministra-de-educacion-pide-en-barcelona-una-estrategia-conjunta-iberoamericana-para-los-desafios-en-ensenanza.html",
        "palabras": ["educación inclusiva", "Iberoamérica", "políticas educativas", "IA"],
    },
    {
        "titulo": "Dos docentes de Huesca son finalistas en un programa nacional por liderazgo e inclusión educativa",
        "fuente": "Cadena SER",
        "fecha": "2026-05-18",
        "categoria": "Docencia e inclusión",
        "resumen": "La primera edición del programa Docentes Referentes seleccionó a profesionales destacados por su liderazgo educativo y trabajo en educación inclusiva. La iniciativa busca visibilizar prácticas docentes con impacto positivo en el sistema educativo.",
        "url": "https://cadenaser.com/aragon/2026/05/18/beatriz-serrano-del-ceip-montecorona-sabinanigo-y-nathalie-clavero-del-ceip-pirineos-pyrenees-huesca-finalistas-de-docentes-referentes-impulsado-por-fundacion-ibercaja-radio-huesca/",
        "palabras": ["docentes", "educación inclusiva", "liderazgo educativo", "buenas prácticas"],
    },
    {
        "titulo": "Dénia inicia la construcción del nuevo centro de educación especial Raquel Payà",
        "fuente": "Cadena SER",
        "fecha": "2026-04-29",
        "categoria": "Educación especial y accesibilidad",
        "resumen": "La colocación de la primera piedra del nuevo Centro de Educación Especial Raquel Payà marca el inicio de una infraestructura adaptada y accesible. El proyecto busca responder a necesidades históricas de estudiantes, familias y profesionales.",
        "url": "https://cadenaser.com/comunitat-valenciana/2026/04/29/denia-coloca-la-primera-piedra-del-nuevo-raquel-paya-una-deuda-historica-con-la-educacion-especial-empieza-a-saldarse-radio-denia/",
        "palabras": ["educación especial", "accesibilidad", "infraestructura educativa", "familias"],
    },
]


def main():
    output = {
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "noticias": NOTICIAS,
    }
    Path("noticias.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
