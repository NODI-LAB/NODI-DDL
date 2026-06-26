import { z } from "zod";

export const ccfSchema = z.union([
  z.literal("A"),
  z.literal("B"),
  z.literal("C"),
  z.literal("非 CCF")
]);

export const dateDisplaySchema = z.object({
  datetime: z.string().nullable(),
  display: z.string(),
  timezone: z.string().nullable(),
  mandatory: z.boolean().nullable()
});

export const conferenceDateSchema = z.object({
  start: z.string().nullable(),
  end: z.string().nullable(),
  display: z.string()
});

export const conferenceSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  website: z.string().url(),
  category: z.string().min(1),
  direction: z.string().min(1),
  ccf: ccfSchema,
  nodi_score: z.number().min(0).max(10),
  accepted_topics: z.array(z.string().min(1)).min(1),
  note: z.string(),
  enabled: z.boolean().default(true)
});

export const deadlineSchema = z.object({
  slug: z.string().min(1),
  year: z.number().int().nullable(),
  conference_date: conferenceDateSchema,
  abstract_deadline: dateDisplaySchema,
  paper_deadline: dateDisplaySchema,
  location: z.string(),
  source_url: z.string().nullable(),
  last_checked_at: z.string().nullable(),
  last_updated_at: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  internal_status: z.string(),
  notes: z.string()
});

export const mergedConferenceSchema = conferenceSchema.extend({
  year: z.number().int().nullable(),
  conference_date: conferenceDateSchema,
  abstract_deadline: dateDisplaySchema,
  paper_deadline: dateDisplaySchema,
  location: z.string(),
  source_url: z.string().nullable(),
  last_checked_at: z.string().nullable(),
  last_updated_at: z.string().nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  internal_status: z.string(),
  notes: z.string(),
  website_source: z.enum(["nodi", "ccfddl"]).default("nodi")
});

export const mergedConferenceListSchema = z.array(mergedConferenceSchema);

export type CcfRating = z.infer<typeof ccfSchema>;
export type DeadlineDate = z.infer<typeof dateDisplaySchema>;
export type ConferenceDate = z.infer<typeof conferenceDateSchema>;
export type Conference = z.infer<typeof conferenceSchema>;
export type Deadline = z.infer<typeof deadlineSchema>;
export type MergedConference = z.infer<typeof mergedConferenceSchema>;
