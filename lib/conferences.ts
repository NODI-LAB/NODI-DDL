import mergedConferences from "@/data/generated/merged_conferences.json";
import { mergedConferenceListSchema, type MergedConference } from "./schema";
import { daysUntil, isDeadlinePast } from "./deadlines";

export const conferences: MergedConference[] = mergedConferenceListSchema
  .parse(mergedConferences)
  .filter((conference) => conference.enabled);

export function getConferenceBySlug(slug: string): MergedConference | undefined {
  return conferences.find((conference) => conference.slug === slug);
}

export function getConferenceCategories(): string[] {
  return [...new Set(conferences.map((conference) => conference.category))].sort((a, b) => a.localeCompare(b));
}

export function getStats() {
  const now = new Date();
  return {
    total: conferences.length,
    ccfA: conferences.filter((conference) => conference.ccf === "A").length,
    highScore: conferences.filter((conference) => conference.nodi_score >= 9.5).length,
    upcoming60: conferences.filter((conference) => {
      const days = daysUntil(conference.paper_deadline.datetime, now);
      return days !== null && !isDeadlinePast(conference.paper_deadline.datetime, now) && days <= 60;
    }).length,
    tbd: conferences.filter((conference) => !conference.paper_deadline.datetime).length
  };
}
