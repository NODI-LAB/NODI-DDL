import { cn } from "@/lib/utils";

type ScoreBadgeProps = {
  score: number;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const tone = score >= 9.5
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : score >= 9
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : score >= 8
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : score >= 7
          ? "border-neutral-200 bg-neutral-50 text-neutral-700"
          : "border-red-200 bg-red-50 text-red-800";

  return (
    <span className={cn("inline-flex min-w-14 items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold", tone)}>
      {score.toFixed(1)}
    </span>
  );
}
