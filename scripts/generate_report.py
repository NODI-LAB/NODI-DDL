from __future__ import annotations

from common import DATA, GENERATED, read_json, utc_now


def main() -> None:
    conferences = read_json(DATA / "nodi_conferences.json", [])
    deadlines = read_json(DATA / "deadlines.json", [])
    pending = read_json(DATA / "pending_updates.json", [])
    ccf_meta = read_json(GENERATED / "ccfddl_sync_meta.json", {})
    crawl_report = read_json(GENERATED / "official_crawl_report.json", [])
    rollover = read_json(GENERATED / "rollover_candidates.json", [])

    tbd = sum(1 for item in deadlines if not item.get("paper_deadline", {}).get("datetime"))
    lines = [
        "# NODIDDL Sync Report",
        "",
        f"- Generated at: {utc_now()}",
        f"- Conferences: {len(conferences)}",
        f"- Deadlines: {len(deadlines)}",
        f"- TBD paper deadlines: {tbd}",
        f"- Pending updates: {len(pending)}",
        f"- ccfddl matched updates: {ccf_meta.get('matched_updates', 0)}",
        f"- Official crawl reports: {len(crawl_report)}",
        f"- Rollover candidates: {len(rollover)}",
        ""
    ]

    if pending:
        lines.extend(["## Pending Update Types", ""])
        counts: dict[str, int] = {}
        for item in pending:
            counts[item.get("type", "unknown")] = counts.get(item.get("type", "unknown"), 0) + 1
        for key, count in sorted(counts.items()):
            lines.append(f"- {key}: {count}")
        lines.append("")

    GENERATED.mkdir(parents=True, exist_ok=True)
    (GENERATED / "sync_report.md").write_text("\n".join(lines), encoding="utf-8")
    print("Generated sync report")


if __name__ == "__main__":
    main()
