import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

QUERIES = [
    # Inclusión educativa y educación especial
    "inclusión educativa Perú",
    "educación inclusiva Perú",
    "educación especial Perú",
    "educación básica especial Perú",
    "CEBE Perú discapacidad",
    "PRITE Perú discapacidad",
    "SAANEE educación inclusiva Perú",
    "CREBE educación inclusiva Perú",
    "CENAREBE educación inclusiva",
    "UGEL inclusión educativa discapacidad",
    "MINEDU educación inclusiva",
    "MINEDU educación especial discapacidad",

    # Accesibilidad, apoyos y ajustes
    "accesibilidad educativa Perú",
    "accesibilidad discapacidad educación Perú",
    "ajustes razonables educación Perú",
    "apoyos educativos discapacidad Perú",
    "adaptaciones curriculares educación inclusiva Perú",
    "diversificación curricular educación inclusiva Perú",
    "diversificación curricular discapacidad Perú",
    "diseño universal para el aprendizaje Perú",
    "DUA educación inclusiva Perú",
    "tecnología accesible educación Perú",
    "materiales accesibles educación Perú",
    "recursos educativos accesibles Perú",

    # Discapacidad visual
    "discapacidad visual educación Perú",
    "ceguera educación Perú",
    "ceguera educación inclusiva Perú",
    "baja visión educación Perú",
    "baja visión escuela Perú",
    "braille educación Perú",
    "sistema braille educación Perú",
    "lectoescritura braille Perú",
    "estudiantes con discapacidad visual Perú",

    # Discapacidad auditiva y comunicación
    "discapacidad auditiva educación Perú",
    "sordera educación Perú",
    "sordera educación inclusiva Perú",
    "sordera total educación Perú",
    "hipoacusia educación Perú",
    "estudiantes sordos educación Perú",
    "lengua de señas educación Perú",
    "lengua de señas peruana educación",
    "LSP educación Perú",
    "intérprete de lengua de señas educación Perú",
    "comunicación accesible estudiantes sordos Perú",

    # Sordoceguera
    "sordoceguera educación Perú",
    "sordoceguera educación inclusiva Perú",
    "personas con sordoceguera Perú",
    "estudiantes con sordoceguera Perú",

    # Neurodiversidad, TEA, TDAH y aprendizaje
    "neurodiversidad educación Perú",
    "neurodivergencia educación Perú",
    "autismo educación Perú",
    "autismo educación inclusiva Perú",
    "trastorno del espectro autista educación Perú",
    "TEA educación Perú",
    "TEA educación inclusiva Perú",
    "TDAH educación Perú",
    "trastorno por déficit de atención educación Perú",
    "dificultades de aprendizaje educación Perú",
    "dislexia educación Perú",

    # Discapacidad intelectual, física, múltiple y psicosocial
    "discapacidad intelectual educación Perú",
    "discapacidad cognitiva educación Perú",
    "discapacidad física educación Perú",
    "discapacidad motora educación Perú",
    "parálisis cerebral educación Perú",
    "discapacidad múltiple educación Perú",
    "multidiscapacidad educación Perú",
    "discapacidad psicosocial educación Perú",
    "salud mental educación inclusiva Perú",

    # Familia, docentes y participación
    "familias discapacidad educación Perú",
    "docentes educación inclusiva Perú",
    "capacitación docente inclusión educativa Perú",
    "convivencia escolar inclusión discapacidad Perú",
    "participación de estudiantes con discapacidad Perú",
]

MAX_PER_QUERY = 3
MAX_TOTAL = 60


def clean_html(text: str) -> str:
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def source_from_url(url: str) -> str:
    try:
        host = urllib.parse.urlparse(url).netloc.replace("www.", "")
        return host or "Fuente externa"
    except Exception:
        return "Fuente externa"


def parse_date(value: str) -> str:
    if not value:
        return ""
    try:
        return parsedate_to_datetime(value).date().isoformat()
    except Exception:
        return value[:10]


def fetch_query(query: str):
    rss = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
        "q": query,
        "hl": "es-419",
        "gl": "PE",
        "ceid": "PE:es-419",
    })
    req = urllib.request.Request(rss, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as response:
        data = response.read()
    root = ET.fromstring(data)
    items = []
    for item in root.findall(".//item")[:MAX_PER_QUERY]:
        title = clean_html(item.findtext("title") or "")
        link = item.findtext("link") or ""
        pub_date = item.findtext("pubDate") or ""
        desc = clean_html(item.findtext("description") or "")
        source_el = item.find("source")
        source = clean_html(source_el.text if source_el is not None and source_el.text else source_from_url(link))
        if not title or not link:
            continue
        items.append({
            "titulo": title,
            "fuente": source,
            "fecha": parse_date(pub_date),
            "tema": query,
            "resumen": desc[:240] if desc else "Noticia encontrada en Google News. Revisa el portal original para leer el contenido completo.",
            "url": link,
        })
    return items


def main():
    seen_titles = set()
    seen_urls = set()
    seen_domains = set()
    results = []

    for query in QUERIES:
        try:
            for item in fetch_query(query):
                title_key = norm(item["titulo"])
                url_key = item["url"].split("?")[0].lower()
                domain_key = source_from_url(item["url"]).lower()
                if title_key in seen_titles or url_key in seen_urls:
                    continue
                if domain_key in seen_domains and len(results) >= 18:
                    continue
                seen_titles.add(title_key)
                seen_urls.add(url_key)
                seen_domains.add(domain_key)
                results.append(item)
                if len(results) >= MAX_TOTAL:
                    break
        except Exception as exc:
            print(f"Error con consulta {query}: {exc}")
        if len(results) >= MAX_TOTAL:
            break

    if not results:
        results = [
            {
                "titulo": "Consulta sobre inclusión educativa en Google Noticias",
                "fuente": "Google News",
                "fecha": datetime.now(timezone.utc).date().isoformat(),
                "tema": "inclusión educativa",
                "resumen": "No se pudieron cargar noticias automáticamente. Usa este enlace para consultar noticias actuales sobre inclusión educativa.",
                "url": "https://news.google.com/search?q=inclusi%C3%B3n%20educativa%20Per%C3%BA",
            }
        ]

    output = {
        "actualizado": datetime.now(timezone.utc).isoformat(),
        "noticias": results,
    }
    Path("noticias.json").write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
