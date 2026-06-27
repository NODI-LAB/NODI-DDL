import { isValid, parseISO } from "date-fns";

export type CountdownTone = "muted" | "closed" | "danger" | "warning" | "notice" | "normal";

export type CountdownState = {
  label: string;
  days: number | null;
  tone: CountdownTone;
};

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

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

  const totalSeconds = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const label = `${pad(days)} days ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  if (days <= 7) {
    return { label, days, tone: "danger" };
  }

  if (days <= 30) {
    return { label, days, tone: "warning" };
  }

  if (days <= 60) {
    return { label, days, tone: "notice" };
  }

  return { label, days, tone: "normal" };
}
