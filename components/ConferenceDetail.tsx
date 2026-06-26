import type { ComponentType, ReactNode } from "react";
import { CalendarDays, ExternalLink, MapPin, NotebookText, Tags } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { MergedConference } from "@/lib/schema";

type ConferenceDetailProps = {
  conference: MergedConference;
};

export function ConferenceDetail({ conference }: ConferenceDetailProps) {
  return (
    <article className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold text-nodi-green">{conference.category}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">{conference.name}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-700">{conference.note}</p>
            <a
              href={conference.website}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-nodi-green hover:text-nodi-green"
            >
              会议官网
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
            <ScoreBadge score={conference.nodi_score} />
            <span className="inline-flex min-w-16 items-center justify-center rounded-md border border-line bg-neutral-50 px-2 py-1 text-sm font-semibold text-neutral-800">
              CCF {conference.ccf}
            </span>
            <DeadlineBadge datetime={conference.paper_deadline.datetime} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DetailBlock icon={NotebookText} title="投稿信息">
          <dl className="grid gap-3 text-sm">
            <Row label="一级方向" value={conference.category} />
            <Row label="方向" value={conference.direction} />
            <Row label="NODI 评分" value={conference.nodi_score.toFixed(1)} />
            <Row label="CCF 评级" value={conference.ccf} />
          </dl>
        </DetailBlock>

        <DetailBlock icon={CalendarDays} title="日期与地点">
          <dl className="grid gap-3 text-sm">
            <Row label="会议日期" value={conference.conference_date.display || "TBD"} />
            <Row label="摘要截止" value={conference.abstract_deadline.display || "TBD"} />
            <Row label="全文截止" value={conference.paper_deadline.display || "TBD"} />
            <Row label="地点" value={conference.location || "TBD"} />
          </dl>
        </DetailBlock>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <DetailBlock icon={Tags} title="适合投稿领域">
          <div className="flex flex-wrap gap-2">
            {conference.accepted_topics.map((topic) => (
              <span key={topic} className="rounded-md border border-line bg-neutral-50 px-2.5 py-1.5 text-sm text-neutral-700">
                {topic}
              </span>
            ))}
          </div>
        </DetailBlock>

        <DetailBlock icon={MapPin} title="维护信息">
          <dl className="grid gap-3 text-sm">
            <Row label="年份" value={conference.year ? String(conference.year) : "TBD"} />
            <Row label="最后检查" value={conference.last_checked_at || "TBD"} />
            <Row label="最后更新" value={conference.last_updated_at || "TBD"} />
          </dl>
        </DetailBlock>
      </section>
    </article>
  );
}

type DetailBlockProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: ReactNode;
};

function DetailBlock({ icon: Icon, title, children }: DetailBlockProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
        <Icon className="h-5 w-5 text-nodi-green" aria-hidden={true} />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-800">{value}</dd>
    </div>
  );
}
