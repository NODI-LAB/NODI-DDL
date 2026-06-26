from __future__ import annotations

import json
from typing import Any

from common import DATA, GENERATED, load_alias_map, normalize_key, read_json, utc_now, write_json

try:
    import requests
except Exception:  # pragma: no cover
    requests = None

try:
    import yaml
except Exception:  # pragma: no cover
    yaml = None

try:
    from rapidfuzz import process
except Exception:  # pragma: no cover
    process = None


WEBSITE_FIELDS = ("link", "website", "url", "site", "homepage", "home")
LOCATION_FIELDS = ("place", "location", "venue")
CONFERENCE_DATE_FIELDS = ("date", "conference_date", "conferenceDate", "when")
PAPER_FIELDS = ("deadline", "paper_deadline", "paperDeadline", "submission_deadline", "submissionDeadline")
ABSTRACT_FIELDS = ("abstract_deadline", "abstractDeadline", "abstract", "abstract_due")


def fetch_text(url: str) -> str | None:
    if not requests:
        return None
    try:
        response = requests.get(url, timeout=20, headers={"User-Agent": "NODIDDL sync bot"})
        if response.status_code >= 400:
            return None
        return response.text
    except requests.RequestException:
        return None


def parse_payload(text: str, fmt: str | None) -> Any:
    if fmt == "json":
        return json.loads(text)
    if yaml:
        return yaml.safe_load(text)
    return json.loads(text)


def iter_records(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if isinstance(payload, dict):
        for key in ("conferences", "items", "data", "deadlines"):
            if isinstance(payload.get(key), list):
                return [item for item in payload[key] if isinstance(item, dict)]

        records: list[dict[str, Any]] = []
        for value in payload.values():
            if isinstance(value, dict):
                records.append(value)
            elif isinstance(value, list):
                records.extend(item for item in value if isinstance(item, dict))
        return records

    return []


def first_value(record: dict[str, Any], fields: tuple[str, ...]) -> Any:
    for field in fields:
        value = record.get(field)
        if value not in (None, ""):
            return value
    return None


def normalize_date_object(value: Any, timezone_value: str | None = None) -> dict[str, Any] | None:
    if not value:
        return None
    if isinstance(value, dict):
        datetime_value = value.get("datetime") or value.get("time") or value.get("date")
        display = value.get("display") or value.get("text") or datetime_value
        return {
            "datetime": datetime_value,
            "display": display or "TBD",
            "timezone": value.get("timezone") or timezone_value,
            "mandatory": value.get("mandatory")
        }
    return {
        "datetime": str(value) if "T" in str(value) else None,
        "display": str(value),
        "timezone": timezone_value,
        "mandatory": None
    }


def normalize_conference_date(value: Any) -> dict[str, Any] | None:
    if not value:
        return None
    if isinstance(value, dict):
        return {
            "start": value.get("start"),
            "end": value.get("end"),
            "display": value.get("display") or value.get("date") or "TBD"
        }
    return {"start": None, "end": None, "display": str(value)}


def extract_from_timeline(record: dict[str, Any], timezone_value: str | None) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    timeline = record.get("timeline") or record.get("dates") or []
    if not isinstance(timeline, list):
        return None, None

    abstract = None
    paper = None
    for item in timeline:
        if not isinstance(item, dict):
            continue
        label = normalize_key(str(item.get("name") or item.get("type") or item.get("title") or ""))
        value = item.get("deadline") or item.get("datetime") or item.get("date") or item.get("time")
        date_obj = normalize_date_object(value, item.get("timezone") or timezone_value)
        if not date_obj:
            continue
        if "abstract" in label:
            abstract = abstract or date_obj
        if any(token in label for token in ("paper", "full", "submission", "deadline")):
            paper = paper or date_obj
    return abstract, paper


def match_slug(record: dict[str, Any], alias_map: dict[str, str]) -> str | None:
    candidates = [
        record.get("slug"),
        record.get("id"),
        record.get("name"),
        record.get("title"),
        record.get("conference"),
        record.get("short")
    ]
    for candidate in candidates:
        key = normalize_key(str(candidate)) if candidate else ""
        if key in alias_map:
            return alias_map[key]

    if process:
        name = normalize_key(str(record.get("name") or record.get("title") or ""))
        if name:
            match = process.extractOne(name, list(alias_map.keys()), score_cutoff=92)
            if match:
                return alias_map[match[0]]
    return None


def convert_record(record: dict[str, Any], alias_map: dict[str, str], source_url: str) -> dict[str, Any] | None:
    slug = match_slug(record, alias_map)
    if not slug:
        return None

    timezone_value = record.get("timezone") or record.get("tz")
    abstract_from_timeline, paper_from_timeline = extract_from_timeline(record, timezone_value)
    website = first_value(record, WEBSITE_FIELDS)
    location = first_value(record, LOCATION_FIELDS)

    update = {
        "slug": slug,
        "website": website,
        "conference_date": normalize_conference_date(first_value(record, CONFERENCE_DATE_FIELDS)),
        "abstract_deadline": normalize_date_object(first_value(record, ABSTRACT_FIELDS), timezone_value) or abstract_from_timeline,
        "paper_deadline": normalize_date_object(first_value(record, PAPER_FIELDS), timezone_value) or paper_from_timeline,
        "location": location,
        "year": record.get("year"),
        "timezone": timezone_value,
        "source": "ccfddl",
        "source_url": source_url,
        "last_checked_at": utc_now(),
        "confidence": 0.75
    }
    return {key: value for key, value in update.items() if value not in (None, "", {}, [])}


def main() -> None:
    sources = read_json(DATA / "sources.json", {}).get("ccfddl_sources", [])
    alias_map = load_alias_map()
    updates_by_slug: dict[str, dict[str, Any]] = {}
    attempted: list[str] = []

    for source in sources:
        url = source.get("url")
        if not url:
            continue
        attempted.append(url)
        text = fetch_text(url)
        if not text:
            continue
        try:
            payload = parse_payload(text, source.get("format"))
        except Exception:
            continue

        for record in iter_records(payload):
            update = convert_record(record, alias_map, url)
            if update:
                updates_by_slug[update["slug"]] = {**updates_by_slug.get(update["slug"], {}), **update}

    updates = sorted(updates_by_slug.values(), key=lambda item: item["slug"])
    write_json(GENERATED / "ccfddl_updates.json", updates)
    write_json(GENERATED / "ccfddl_sync_meta.json", {
        "attempted_sources": attempted,
        "matched_updates": len(updates),
        "last_checked_at": utc_now()
    })
    print(f"ccfddl sync matched {len(updates)} NODI conferences")


if __name__ == "__main__":
    main()
