from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from html import unescape
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from common import DATA, GENERATED, load_alias_map, normalize_key, read_json, utc_now, write_json

try:
    import requests
except Exception:  # pragma: no cover
    requests = None


DEFAULT_SOURCE = {
    "name": "mlciv ai deadlines",
    "url": "https://mlciv.com/ai-deadlines/?sub=ML,CV,CG,NLP,RO,SP,DM,AP,KR,HCI,EDU"
}

SHORT_TITLE_ALIASES = {
    "mm": "acmmm",
    "thewebconf": "www",
    "webconf": "www"
}


def fetch_text(url: str) -> str | None:
    if requests:
        try:
            response = requests.get(url, timeout=30, headers={"User-Agent": "NODIDDL sync bot"})
            if response.status_code >= 400:
                return None
            return response.text
        except requests.RequestException:
            return None

    try:
        request = Request(url, headers={"User-Agent": "NODIDDL sync bot"})
        with urlopen(request, timeout=30) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(charset, errors="replace")
    except (OSError, URLError):
        return None


def extract_json_array(text: str, variable_name: str) -> list[dict[str, Any]]:
    marker = f"var {variable_name} ="
    marker_index = text.find(marker)
    if marker_index < 0:
        return []

    start = text.find("[", marker_index)
    if start < 0:
        return []

    depth = 0
    in_string = False
    escape = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                payload = text[start:index + 1]
                records = json.loads(payload)
                return [item for item in records if isinstance(item, dict)]

    return []


def timezone_info(value: str | None) -> tuple[timezone | ZoneInfo, str]:
    raw = (value or "UTC-12").strip()
    if raw in ("AoE", "UTC-12"):
        return timezone(timedelta(hours=-12)), "AoE"
    if raw in ("UTC", "GMT", "Z"):
        return timezone.utc, raw
    if raw == "CET":
        return timezone(timedelta(hours=1)), raw
    if raw == "CEST":
        return timezone(timedelta(hours=2)), raw

    match = re.fullmatch(r"UTC([+-])(\d{1,2})(?::?(\d{2}))?", raw)
    if match:
        sign = 1 if match.group(1) == "+" else -1
        hours = int(match.group(2))
        minutes = int(match.group(3) or "0")
        return timezone(sign * timedelta(hours=hours, minutes=minutes)), raw

    try:
        return ZoneInfo(raw), raw
    except ZoneInfoNotFoundError:
        return timezone.utc, raw


def parse_deadline(record: dict[str, Any]) -> tuple[datetime | None, str | None]:
    value = record.get("deadline")
    if not value:
        return None, None

    try:
        naive = datetime.fromisoformat(str(value))
    except ValueError:
        return None, None

    tzinfo, timezone_label = timezone_info(record.get("timezone"))
    if naive.tzinfo is None:
        deadline = naive.replace(tzinfo=tzinfo)
    else:
        deadline = naive.astimezone(tzinfo)
    return deadline, timezone_label


def clean_note(value: str | None) -> str:
    if not value:
        return ""
    without_tags = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\s+", " ", unescape(without_tags)).strip()


def title_candidates(record: dict[str, Any]) -> list[str]:
    title = str(record.get("title") or "")
    record_id = str(record.get("id") or "")
    full_name = str(record.get("full_name") or "")

    values = [title, full_name, record_id]
    if title:
        values.extend([
            re.sub(r"[-_\s]+\d+$", "", title),
            re.sub(r"\d+$", "", title),
            title.split("-", 1)[0]
        ])
    if record_id:
        values.extend([
            re.sub(r"\d+.*$", "", record_id),
            re.sub(r"[-_]\d+.*$", "", record_id)
        ])
    return [value for value in values if value]


def match_slug(record: dict[str, Any], alias_map: dict[str, str]) -> str | None:
    for candidate in title_candidates(record):
        key = normalize_key(candidate)
        key = SHORT_TITLE_ALIASES.get(key, key)
        if key in alias_map:
            return alias_map[key]
    return None


def normalize_conference_date(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "start": record.get("start"),
        "end": record.get("end"),
        "display": record.get("date") or "TBD"
    }


def convert_record(
    record: dict[str, Any],
    alias_map: dict[str, str],
    source_url: str,
    checked_at: str
) -> dict[str, Any] | None:
    slug = match_slug(record, alias_map)
    if not slug:
        return None

    deadline, timezone_label = parse_deadline(record)
    if not deadline:
        return None

    deadline_text = str(record.get("deadline"))
    note = clean_note(record.get("note"))
    confidence = 0.68 if "predicted" in note.lower() else 0.88

    update = {
        "slug": slug,
        "title": record.get("title"),
        "year": record.get("year"),
        "website": record.get("link"),
        "conference_date": normalize_conference_date(record),
        "paper_deadline": {
            "datetime": deadline.isoformat(),
            "display": f"{deadline_text} {timezone_label}",
            "timezone": timezone_label,
            "mandatory": None
        },
        "location": record.get("place"),
        "timezone": timezone_label,
        "source": "mlciv",
        "source_url": record.get("link") or source_url,
        "source_record_id": record.get("id"),
        "last_checked_at": checked_at,
        "confidence": confidence,
        "notes": note
    }
    return {key: value for key, value in update.items() if value not in (None, "", {}, [])}


def choose_record(current: dict[str, Any] | None, candidate: dict[str, Any]) -> dict[str, Any]:
    if not current:
        return candidate

    current_dt = datetime.fromisoformat(current["paper_deadline"]["datetime"])
    candidate_dt = datetime.fromisoformat(candidate["paper_deadline"]["datetime"])
    if candidate_dt < current_dt:
        return candidate
    if candidate_dt == current_dt and candidate.get("confidence", 0) > current.get("confidence", 0):
        return candidate
    return current


def main() -> None:
    sources = read_json(DATA / "sources.json", {}).get("mlciv_sources", [DEFAULT_SOURCE])
    alias_map = load_alias_map()
    checked_at = utc_now()
    now = datetime.now(timezone.utc)
    updates_by_slug: dict[str, dict[str, Any]] = {}
    attempted: list[str] = []
    records_seen = 0

    for source in sources:
        url = source.get("url")
        if not url:
            continue
        attempted.append(url)
        text = fetch_text(url)
        if not text:
            continue
        records = extract_json_array(text, "all_conferences_data")
        records_seen += len(records)

        for record in records:
            update = convert_record(record, alias_map, url, checked_at)
            if not update:
                continue
            deadline = datetime.fromisoformat(update["paper_deadline"]["datetime"])
            if deadline.astimezone(timezone.utc) < now:
                continue
            slug = update["slug"]
            updates_by_slug[slug] = choose_record(updates_by_slug.get(slug), update)

    updates = sorted(updates_by_slug.values(), key=lambda item: item["slug"])
    write_json(GENERATED / "mlciv_updates.json", updates)
    write_json(GENERATED / "mlciv_sync_meta.json", {
        "attempted_sources": attempted,
        "records_seen": records_seen,
        "matched_updates": len(updates),
        "last_checked_at": checked_at
    })
    print(f"mlciv sync matched {len(updates)} NODI conferences")


if __name__ == "__main__":
    main()
