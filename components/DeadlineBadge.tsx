"use client";

import { useEffect, useState } from "react";
import { getCountdownState } from "@/lib/countdown";
import { cn } from "@/lib/utils";

type DeadlineBadgeProps = {
  datetime: string | null;
};

export function DeadlineBadge({ datetime }: DeadlineBadgeProps) {
  const [now, setNow] = useState<Date | null>(null);
  const countdown = now
    ? getCountdownState(datetime, now)
    : datetime
      ? { label: "-- days --h --m --s", days: null, tone: "muted" as const }
      : getCountdownState(datetime);
  const tone = {
    muted: "border-neutral-200 bg-neutral-50 text-neutral-500",
    closed: "border-neutral-300 bg-neutral-100 text-neutral-700",
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    notice: "border-sky-200 bg-sky-50 text-sky-800",
    normal: "border-emerald-200 bg-emerald-50 text-emerald-800"
  }[countdown.tone];

  useEffect(() => {
    if (!datetime) {
      setNow(null);
      return undefined;
    }

    setNow(new Date());
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [datetime]);

  return (
    <span className={cn("inline-flex min-w-44 items-center justify-center rounded-md border px-2 py-1 font-mono text-xs font-semibold tabular-nums", tone)}>
      {countdown.label}
    </span>
  );
}
