import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

export type CountdownTone = "muted" | "closed" | "danger" | "warning" | "notice" | "normal";

export type CountdownState = {
  label: string;
  days: number | null;
  tone: CountdownTone;
};

export function getCountdownState(datetime: string | null, now = new Date()): CountdownState {
  if (!datetime) {
    return { label: "TBD", days: null, tone: "muted" };
  }

  const parsed = parseISO(datetime);
  const deadline = isValid(parsed) ? parsed : new Date(datetime);
  if (Number.isNaN(deadline.getTime())) {
    return { label: "TBD", days: null, tone: "muted" };
  }

  if (now.getTime() > deadline.getTime()) {
    return { label: "Closed", days: null, tone: "closed" };
  }

  const days = Math.max(0, differenceInCalendarDays(deadline, now));
  if (days <= 7) {
    return { label: `D-${days}`, days, tone: "danger" };
  }

  if (days <= 30) {
    return { label: `D-${days}`, days, tone: "warning" };
  }

  if (days <= 60) {
    return { label: `D-${days}`, days, tone: "notice" };
  }

  return { label: `D-${days}`, days, tone: "normal" };
}
