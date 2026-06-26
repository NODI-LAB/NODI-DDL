from __future__ import annotations

from datetime import datetime
from urllib.parse import urlparse

from common import DATA, GENERATED, read_json

try:
    from dateutil import parser as date_parser
except Exception:  # pragma: no cover
    date_parser = None


VALID_CCF = {"A", "B", "C", "非 CCF"}
FORBIDDEN_FIELDS = {"positioning", "nodi_level", "status", "source"}


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    if date_parser:
        return date_parser.parse(value)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def check_url(value: str | None) -> bool:
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def main() -> None:
    errors: list[str] = []
    conferences = read_json(DATA / "nodi_conferences.json", [])
    deadlines = read_json(DATA / "deadlines.json", [])
    merged = read_json(GENERATED / "merged_conferences.json", [])

    slugs = [item.get("slug") for item in conferences]
    for slug in sorted({slug for slug in slugs if slugs.count(slug) > 1}):
        errors.append(f"Duplicate slug: {slug}")

    deadline_slugs = {item.get("slug") for item in deadlines}
    for item in conferences:
        slug = item.get("slug", "<missing>")
        forbidden = FORBIDDEN_FIELDS.intersection(item.keys())
        if forbidden:
            errors.append(f"{slug}: forbidden fields in nodi_conferences.json: {sorted(forbidden)}")
        if not item.get("name"):
            errors.append(f"{slug}: name is required")
        if not check_url(item.get("website")):
            errors.append(f"{slug}: website must be a valid URL")
        if not item.get("category"):
            errors.append(f"{slug}: category is required")
        if not item.get("direction"):
            errors.append(f"{slug}: direction is required")
        if item.get("ccf") not in VALID_CCF:
            errors.append(f"{slug}: ccf must be A/B/C/非 CCF")
        score = item.get("nodi_score")
        if not isinstance(score, (int, float)) or score < 0 or score > 10:
            errors.append(f"{slug}: nodi_score must be between 0 and 10")
        if not item.get("accepted_topics"):
            errors.append(f"{slug}: accepted_topics must not be empty")
        if slug not in deadline_slugs:
            errors.append(f"{slug}: missing deadline entry")

    merged_by_slug = {item.get("slug"): item for item in merged}
    for slug in slugs:
        if slug not in merged_by_slug:
            errors.append(f"{slug}: missing merged conference entry")

    for item in deadlines:
        slug = item.get("slug", "<missing>")
        abstract_dt = paper_dt = conf_start = None
        try:
            abstract_dt = parse_dt(item.get("abstract_deadline", {}).get("datetime"))
            paper_dt = parse_dt(item.get("paper_deadline", {}).get("datetime"))
            conf_start = parse_dt(item.get("conference_date", {}).get("start"))
        except Exception as exc:
            errors.append(f"{slug}: invalid datetime: {exc}")
            continue

        if abstract_dt and paper_dt and paper_dt < abstract_dt:
            errors.append(f"{slug}: paper_deadline is earlier than abstract_deadline")
        if paper_dt and conf_start and conf_start < paper_dt:
            errors.append(f"{slug}: conference date is earlier than paper_deadline")

    for item in merged:
        slug = item.get("slug", "<missing>")
        if not check_url(item.get("website")):
            errors.append(f"{slug}: merged website must be a valid URL")

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"Validated {len(conferences)} conferences and {len(deadlines)} deadlines")


if __name__ == "__main__":
    main()
