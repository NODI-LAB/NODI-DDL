from __future__ import annotations

from datetime import datetime

from common import DATA, GENERATED, append_pending, read_json, utc_now, write_json

try:
    import requests
except Exception:  # pragma: no cover
    requests = None


def page_mentions_year(url: str, year: int) -> bool:
    if not requests:
        return False
    try:
        response = requests.get(url, timeout=12, headers={"User-Agent": "NODIDDL rollover detector"})
        if response.status_code >= 400:
            return False
        return str(year) in response.text
    except requests.RequestException:
        return False


def main() -> None:
    next_year = datetime.utcnow().year + 1
    deadlines = {item["slug"]: item for item in read_json(DATA / "deadlines.json", [])}
    sources = read_json(DATA / "sources.json", {}).get("official_sources", [])
    candidates = []

    for source in sources:
        slug = source.get("slug")
        deadline = deadlines.get(slug, {})
        paper_deadline = deadline.get("paper_deadline", {}).get("datetime")
        year = deadline.get("year")
        if paper_deadline and year and year >= next_year:
            continue
        url = source.get("url")
        if not url:
            continue
        if page_mentions_year(url, next_year):
            candidate = {
                "slug": slug,
                "type": "year_rollover_candidate",
                "field": "year",
                "current": year,
                "candidate": next_year,
                "source": "official_rollover_detector",
                "source_url": url,
                "confidence": 0.3,
                "checked_at": utc_now()
            }
            candidates.append(candidate)
            append_pending(candidate)

    write_json(GENERATED / "rollover_candidates.json", candidates)
    print(f"Detected {len(candidates)} rollover candidates for {next_year}")


if __name__ == "__main__":
    main()
