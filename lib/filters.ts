import Fuse from "fuse.js";
import type { MergedConference } from "./schema";
import { deadlineSortValue, matchesDeadlineRange, type DeadlineRange } from "./deadlines";

export type ScoreRange = "all" | "flagship" | "representative" | "core" | "direction" | "supplement";
export type SortMode = "default" | "score-desc" | "deadline-asc" | "name-asc" | "ccf-asc";

export type ConferenceFilters = {
  direction: string;
  ccf: string;
  scoreRange: ScoreRange;
  deadlineRange: DeadlineRange;
  query: string;
};

const ccfRank = new Map([
  ["A", 0],
  ["B", 1],
  ["C", 2],
  ["非 CCF", 3]
]);

export function matchesScoreRange(score: number, range: ScoreRange): boolean {
  if (range === "all") {
    return true;
  }

  if (range === "flagship") {
    return score >= 9.5;
  }

  if (range === "representative") {
    return score >= 9.0 && score < 9.5;
  }

  if (range === "core") {
    return score >= 8.0 && score < 9.0;
  }

  if (range === "direction") {
    return score >= 7.0 && score < 8.0;
  }

  return score < 7.0;
}

export function filterConferences(conferences: MergedConference[], filters: ConferenceFilters): MergedConference[] {
  const normalizedQuery = filters.query.trim();
  let base = conferences.filter((conference) => {
    const directionOk = filters.direction === "all" || conference.category === filters.direction;
    const ccfOk = filters.ccf === "all" || conference.ccf === filters.ccf;
    const scoreOk = matchesScoreRange(conference.nodi_score, filters.scoreRange);
    const deadlineOk = matchesDeadlineRange(conference.paper_deadline.datetime, filters.deadlineRange);
    return directionOk && ccfOk && scoreOk && deadlineOk;
  });

  if (!normalizedQuery) {
    return base;
  }

  const fuse = new Fuse(base, {
    threshold: 0.34,
    ignoreLocation: true,
    keys: [
      { name: "name", weight: 0.4 },
      { name: "direction", weight: 0.2 },
      { name: "category", weight: 0.15 },
      { name: "accepted_topics", weight: 0.15 },
      { name: "note", weight: 0.1 }
    ]
  });

  base = fuse.search(normalizedQuery).map((result) => result.item);
  return base;
}

export function sortConferences(conferences: MergedConference[], mode: SortMode): MergedConference[] {
  const now = new Date();
  const sorted = [...conferences];

  sorted.sort((a, b) => {
    if (mode === "score-desc") {
      return b.nodi_score - a.nodi_score || defaultConferenceCompare(a, b, now);
    }

    if (mode === "deadline-asc") {
      return deadlineSortValue(a.paper_deadline.datetime, now) - deadlineSortValue(b.paper_deadline.datetime, now)
        || b.nodi_score - a.nodi_score
        || a.name.localeCompare(b.name);
    }

    if (mode === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (mode === "ccf-asc") {
      return (ccfRank.get(a.ccf) ?? 9) - (ccfRank.get(b.ccf) ?? 9)
        || b.nodi_score - a.nodi_score
        || a.name.localeCompare(b.name);
    }

    return defaultConferenceCompare(a, b, now);
  });

  return sorted;
}

function defaultConferenceCompare(a: MergedConference, b: MergedConference, now: Date): number {
  const aValue = deadlineSortValue(a.paper_deadline.datetime, now);
  const bValue = deadlineSortValue(b.paper_deadline.datetime, now);

  return aValue - bValue
    || b.nodi_score - a.nodi_score
    || (ccfRank.get(a.ccf) ?? 9) - (ccfRank.get(b.ccf) ?? 9)
    || a.name.localeCompare(b.name);
}
