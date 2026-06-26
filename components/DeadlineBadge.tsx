import { getCountdownState } from "@/lib/countdown";
import { cn } from "@/lib/utils";

type DeadlineBadgeProps = {
  datetime: string | null;
};

export function DeadlineBadge({ datetime }: DeadlineBadgeProps) {
  const countdown = getCountdownState(datetime);
  const tone = {
    muted: "border-neutral-200 bg-neutral-50 text-neutral-500",
    closed: "border-neutral-300 bg-neutral-100 text-neutral-700",
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    notice: "border-sky-200 bg-sky-50 text-sky-800",
    normal: "border-emerald-200 bg-emerald-50 text-emerald-800"
  }[countdown.tone];

  return (
    <span className={cn("inline-flex min-w-20 items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold", tone)}>
      {countdown.label}
    </span>
  );
}
