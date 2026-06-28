from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from common import DATA, GENERATED, append_pending, read_json, utc_now, write_json


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def merge_date_object(base: dict[str, Any], candidate: dict[str, Any] | None, prefer_candidate: bool = False) -> dict[str, Any]:
    if not candidate:
        return dict(base)

    merged = dict(base)
    if candidate.get("datetime") and (prefer_candidate or not merged.get("datetime")):
        merged["datetime"] = candidate.get("datetime")
        merged["display"] = candidate.get("display") or candidate.get("datetime") or "TBD"
        merged["timezone"] = candidate.get("timezone")
        merged["mandatory"] = candidate.get("mandatory")
    elif merged.get("display") in (None, "", "TBD") and candidate.get("display"):
        merged["display"] = candidate.get("display")
    return merged


def merge_conference_date(base: dict[str, Any], candidate: dict[str, Any] | None, prefer_candidate: bool = False) -> dict[str, Any]:
    if not candidate:
        return dict(base)

    merged = dict(base)
    for key in ("start", "end"):
        if candidate.get(key) and (prefer_candidate or not merged.get(key)):
            merged[key] = candidate.get(key)
    if candidate.get("display") and (prefer_candidate or merged.get("display") in (None, "", "TBD")):
        merged["display"] = candidate.get("display")
    return merged


def apply_update(
    row: dict[str, Any],
    conference: dict[str, Any],
    update: dict[str, Any],
    source: str,
    prefer_candidate: bool = False,
    apply_website: bool = True
) -> None:
    website = update.get("website")
    if website and apply_website:
        if website != conference.get("website"):
            append_pending({
                "slug": row["slug"],
                "type": "website_mismatch",
                "field": "website",
                "current": conference.get("website"),
                "candidate": website,
                "source": source,
                "source_url": update.get("source_url"),
                "confidence": update.get("confidence")
            })
        row["website"] = website
        row["website_source"] = source

    row["conference_date"] = merge_conference_date(
        row["conference_date"],
        update.get("conference_date"),
        prefer_candidate=prefer_candidate
    )
    row["abstract_deadline"] = merge_date_object(
        row["abstract_deadline"],
        update.get("abstract_deadline"),
        prefer_candidate=prefer_candidate
    )
    row["paper_deadline"] = merge_date_object(
        row["paper_deadline"],
        update.get("paper_deadline"),
        prefer_candidate=prefer_candidate
    )
    if update.get("location") and (prefer_candidate or row["location"] in ("", "TBD")):
        row["location"] = update.get("location")
    if update.get("year") and (prefer_candidate or not row.get("year")):
        row["year"] = update.get("year")
    row["source_url"] = update.get("source_url") or row["source_url"]
    row["last_checked_at"] = update.get("last_checked_at") or row["last_checked_at"]
    row["confidence"] = update.get("confidence") if update.get("confidence") is not None else row["confidence"]


def external_updates_locked(deadline: dict[str, Any]) -> bool:
    return deadline.get("internal_status") in {"manual_locked", "source_locked"}


def main() -> None:
    GENERATED.mkdir(parents=True, exist_ok=True)
    conferences = read_json(DATA / "nodi_conferences.json", [])
    deadlines = {item["slug"]: item for item in read_json(DATA / "deadlines.json", [])}
    ccf_updates = {item["slug"]: item for item in read_json(GENERATED / "ccfddl_updates.json", [])}
    mlciv_updates = {item["slug"]: item for item in read_json(GENERATED / "mlciv_updates.json", [])}

    merged: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc)

    for conference in conferences:
        slug = conference["slug"]
        deadline = deadlines.get(slug)
        if not deadline:
            deadline = {
                "slug": slug,
                "year": None,
                "conference_date": {"start": None, "end": None, "display": "TBD"},
                "abstract_deadline": {"datetime": None, "display": "TBD", "timezone": None, "mandatory": None},
                "paper_deadline": {"datetime": None, "display": "TBD", "timezone": None, "mandatory": None},
                "location": "TBD",
                "source_url": conference.get("website"),
                "last_checked_at": None,
                "last_updated_at": None,
                "confidence": None,
                "internal_status": "tbd",
                "notes": ""
            }

        row = {
            **conference,
            "year": deadline.get("year"),
            "conference_date": dict(deadline.get("conference_date", {})),
            "abstract_deadline": dict(deadline.get("abstract_deadline", {})),
            "paper_deadline": dict(deadline.get("paper_deadline", {})),
            "location": deadline.get("location") or "TBD",
            "source_url": deadline.get("source_url") or conference.get("website"),
            "last_checked_at": deadline.get("last_checked_at"),
            "last_updated_at": deadline.get("last_updated_at"),
            "confidence": deadline.get("confidence"),
            "internal_status": deadline.get("internal_status") or "tbd",
            "notes": deadline.get("notes") or "",
            "website_source": "nodi"
        }

        if not external_updates_locked(deadline):
            ccf_update = ccf_updates.get(slug)
            if ccf_update:
                apply_update(row, conference, ccf_update, "ccfddl")

            mlciv_update = mlciv_updates.get(slug)
            if mlciv_update:
                apply_update(row, conference, mlciv_update, "mlciv", prefer_candidate=True, apply_website=False)

        merged.append(row)

    def upcoming_key(item: dict[str, Any]) -> tuple[int, float, float, str]:
        dt = parse_dt(item.get("paper_deadline", {}).get("datetime"))
        if dt is None:
            return (1, float("inf"), -item.get("nodi_score", 0), item.get("name", ""))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if dt < now:
            return (2, dt.timestamp(), -item.get("nodi_score", 0), item.get("name", ""))
        return (0, dt.timestamp(), -item.get("nodi_score", 0), item.get("name", ""))

    merged.sort(key=upcoming_key)
    upcoming = [
        item for item in merged
        if (parse_dt(item.get("paper_deadline", {}).get("datetime")) is not None)
        and (parse_dt(item.get("paper_deadline", {}).get("datetime")) or now) >= now
    ]

    write_json(GENERATED / "merged_conferences.json", merged)
    write_json(GENERATED / "upcoming.json", upcoming)
    print(f"Merged {len(merged)} conferences at {utc_now()}")


if __name__ == "__main__":
    main()
