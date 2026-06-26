import { ConferenceTable } from "@/components/ConferenceTable";
import { StandardPanel } from "@/components/StandardPanel";
import { StatCards } from "@/components/StatCards";
import { conferences, getConferenceCategories, getStats } from "@/lib/conferences";

export default function HomePage() {
  const stats = getStats();
  const categories = getConferenceCategories();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-normal text-ink">NODIDDL</h1>
          <p className="mt-1 text-lg font-medium text-neutral-700">NODI Conference Deadline Dashboard</p>
          <p className="mt-3 max-w-4xl text-base leading-7 text-neutral-700">
            展示 NODI 实验室认可的高水平会议，提供 CCF 评级、NODI 综合评分、适合投稿领域、
            会议日期、投稿截止、倒计时和地点信息。
          </p>
        </div>
        <StatCards stats={stats} />
      </section>

      <StandardPanel compact />

      <ConferenceTable conferences={conferences} categories={categories} />
    </div>
  );
}
