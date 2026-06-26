import { CalendarClock, CircleDot, Medal, ShieldCheck, TimerReset } from "lucide-react";

type StatCardsProps = {
  stats: {
    total: number;
    ccfA: number;
    highScore: number;
    upcoming60: number;
    tbd: number;
  };
};

const cardConfig = [
  { key: "total", label: "收录会议数量", icon: CircleDot },
  { key: "ccfA", label: "CCF A 数量", icon: ShieldCheck },
  { key: "highScore", label: "NODI 9.5+ 数量", icon: Medal },
  { key: "upcoming60", label: "60 天内截止", icon: CalendarClock },
  { key: "tbd", label: "TBD deadline 数量", icon: TimerReset }
] as const;

export function StatCards({ stats }: StatCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="统计概览">
      {cardConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-neutral-600">{label}</p>
            <Icon className="h-4 w-4 shrink-0 text-nodi-green" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink">{stats[key]}</p>
        </div>
      ))}
    </section>
  );
}
