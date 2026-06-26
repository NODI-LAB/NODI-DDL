from __future__ import annotations

import os
import re
from typing import Any

from common import DATA, append_pending, read_json, utc_now, write_json, GENERATED

try:
    import requests
    from bs4 import BeautifulSoup
except Exception:  # pragma: no cover
    requests = None
    BeautifulSoup = None


DATE_PATTERN = re.compile(
    r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})",
    re.IGNORECASE
)


def fetch_page(url: str) -> str | None:
    if not requests:
        return None
    try:
        response = requests.get(url, timeout=15, headers={"User-Agent": "NODIDDL official deadline crawler"})
        if response.status_code >= 400:
            return None
        return response.text
    except requests.RequestException:
        return None


def extract_candidates(html: str) -> list[dict[str, Any]]:
    if BeautifulSoup:
        text = BeautifulSoup(html, "html.parser").get_text("\n")
    else:
        text = re.sub(r"<[^>]+>", "\n", html)

    candidates: list[dict[str, Any]] = []
    for raw_line in text.splitlines():
        line = " ".join(raw_line.split())
        lowered = line.lower()
        if len(line) < 12 or len(line) > 260:
            continue
        if not any(token in lowered for token in ("deadline", "submission", "abstract", "paper", "important date", "conference")):
            continue
        matches = DATE_PATTERN.findall(line)
        if matches:
            candidates.append({"line": line, "dates": matches})
    return candidates[:20]


def main() -> None:
    sources = read_json(DATA / "sources.json", {}).get("official_sources", [])
    limit = int(os.environ.get("NODIDDL_CRAWL_LIMIT", "0") or "0")
    if limit > 0:
        sources = sources[:limit]

    reports = []
    for source in sources:
        slug = source.get("slug")
        url = source.get("url")
        if not slug or not url:
            continue
        html = fetch_page(url)
        if not html:
            reports.append({"slug": slug, "url": url, "status": "fetch_failed"})
            continue
        candidates = extract_candidates(html)
        reports.append({"slug": slug, "url": url, "status": "ok", "candidate_count": len(candidates)})
        if candidates:
            append_pending({
                "slug": slug,
                "type": "official_deadline_candidates",
                "field": "deadline",
                "candidate": candidates,
                "source": "official_crawler",
                "source_url": url,
                "confidence": 0.35,
                "checked_at": utc_now()
            })

    write_json(GENERATED / "official_crawl_report.json", reports)
    print(f"Crawled {len(sources)} official sources")


if __name__ == "__main__":
    main()
