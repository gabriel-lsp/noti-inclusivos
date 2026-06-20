import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

QUERIES = [
    "inclusión educativa Perú",
    "MINEDU educación inclusiva",
    "UGEL inclusión educativa discapacidad",
    "CENAREBE educación inclusiva",
    "TEA educación Perú",
    "braille educación Perú",
    "accesibilidad discapacidad educación Perú",
]

MAX_PER_QUERY = 6
MAX_TOTAL = 24


def clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
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
        title = item.findtext("title") or ""
        link = item.findtext("link") or ""
        pub_date = item.findtext("pubDate") or ""
        desc = clean_html(item.findtext("description") or "")
        source_el = item.find("source")
        source = source_el.text if source_el is not None and source_el.text else source_from_url(link)
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
                if domain_key in seen_domains and len(results) >= 9:
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
