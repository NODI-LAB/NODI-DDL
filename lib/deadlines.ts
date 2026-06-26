import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

export type DeadlineRange = "all" | "upcoming" | "30" | "60" | "90" | "past" | "tbd";

export function parseDeadlineDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return parsed;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function daysUntil(value: string | null, now = new Date()): number | null {
  const deadline = parseDeadlineDate(value);
  if (!deadline) {
    return null;
  }

  return differenceInCalendarDays(deadline, now);
}

export function isDeadlinePast(value: string | null, now = new Date()): boolean {
  const deadline = parseDeadlineDate(value);
  return Boolean(deadline && now.getTime() > deadline.getTime());
}

export function matchesDeadlineRange(value: string | null, range: DeadlineRange, now = new Date()): boolean {
  const days = daysUntil(value, now);

  if (range === "all") {
    return true;
  }

  if (range === "tbd") {
    return days === null;
  }

  if (range === "past") {
    return days !== null && isDeadlinePast(value, now);
  }

  if (range === "upcoming") {
    return days !== null && !isDeadlinePast(value, now);
  }

  const maxDays = Number(range);
  return days !== null && !isDeadlinePast(value, now) && days <= maxDays;
}

export function deadlineSortValue(value: string | null, now = new Date()): number {
  const deadline = parseDeadlineDate(value);
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER - 1;
  }

  if (now.getTime() > deadline.getTime()) {
    return Number.MAX_SAFE_INTEGER;
  }

  return deadline.getTime();
}
