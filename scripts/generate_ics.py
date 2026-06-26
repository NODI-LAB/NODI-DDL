from __future__ import annotations

from datetime import datetime, timezone

from common import GENERATED, read_json


def escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def fmt(value: datetime) -> str:
    return value.strftime("%Y%m%dT%H%M%SZ")


def main() -> None:
    conferences = read_json(GENERATED / "merged_conferences.json", [])
    now = datetime.now(timezone.utc)
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//NODI-LAB//NODIDDL//ZH-CN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]

    event_count = 0
    for conference in conferences:
        deadline = parse_dt(conference.get("paper_deadline", {}).get("datetime"))
        if not deadline:
            continue
        event_count += 1
        slug = conference["slug"]
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{slug}-{fmt(deadline)}@nodiddl",
            f"DTSTAMP:{fmt(now)}",
            f"DTSTART:{fmt(deadline)}",
            f"SUMMARY:{escape(conference['name'])} paper deadline",
            f"DESCRIPTION:{escape(conference.get('note') or '')}",
            f"URL:{conference.get('website')}",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    GENERATED.mkdir(parents=True, exist_ok=True)
    (GENERATED / "nodiddl.ics").write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")
    print(f"Generated ICS with {event_count} events")


if __name__ == "__main__":
    main()
