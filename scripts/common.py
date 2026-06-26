from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
GENERATED = DATA / "generated"


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_key(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def load_alias_map() -> dict[str, str]:
    aliases = read_json(DATA / "aliases.json", {"aliases": []})
    alias_map: dict[str, str] = {}
    for item in aliases.get("aliases", []):
        alias = normalize_key(item.get("alias"))
        slug = item.get("slug")
        if alias and slug:
            alias_map[alias] = slug
    return alias_map


def append_pending(update: dict[str, Any]) -> bool:
    path = DATA / "pending_updates.json"
    pending = read_json(path, [])
    key = json.dumps(
        {
            "slug": update.get("slug"),
            "type": update.get("type"),
            "field": update.get("field"),
            "candidate": update.get("candidate"),
            "source_url": update.get("source_url")
        },
        sort_keys=True,
        ensure_ascii=False
    )

    for existing in pending:
        existing_key = json.dumps(
            {
                "slug": existing.get("slug"),
                "type": existing.get("type"),
                "field": existing.get("field"),
                "candidate": existing.get("candidate"),
                "source_url": existing.get("source_url")
            },
            sort_keys=True,
            ensure_ascii=False
        )
        if existing_key == key:
            return False

    update.setdefault("created_at", utc_now())
    pending.append(update)
    write_json(path, pending)
    return True


def date_display(datetime_value: str | None, display: str | None = None, timezone_value: str | None = None, mandatory: bool | None = None) -> dict[str, Any]:
    return {
        "datetime": datetime_value,
        "display": display or datetime_value or "TBD",
        "timezone": timezone_value,
        "mandatory": mandatory
    }
