import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Database, GitBranch, RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "关于"
};

const items = [
  {
    icon: Database,
    title: "数据边界",
    body: "NODI 手工维护会议白名单、方向、CCF 评级、NODI 评分、适合投稿领域和备注，自动脚本只补充 deadline、地点和官网链接候选。"
  },
  {
    icon: RefreshCcw,
    title: "自动同步",
    body: "同步脚本优先读取 mlciv AI Deadlines，缺失时再参考 ccfddl/ccf-deadlines 与会议官网；冲突更新会进入 pending_updates.json。"
  },
  {
    icon: GitBranch,
    title: "静态部署",
    body: "项目使用 Next.js 静态导出，可部署到 GitHub Pages 的 /NODI-DDL project site，也能在绑定自定义域名后清空 basePath。"
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">关于 NODI Conference Deadlines</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-neutral-700">
          NODI Conference Deadlines 是 NODI 实验室内部的会议投稿规划工具，用来集中查看认可会议、NODI 综合评分、
          CCF 评级、适合投稿领域、会议日期、投稿 deadline、倒计时和地点。
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <Icon className="h-5 w-5 text-nodi-green" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <BookOpen className="h-5 w-5 text-nodi-green" aria-hidden="true" />
          维护入口
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-700">
          新增会议或修改 NODI 评分时，请编辑 <code className="rounded bg-neutral-100 px-1.5 py-0.5">data/nodi_conferences.json</code>。
          维护 deadline 时，请编辑 <code className="rounded bg-neutral-100 px-1.5 py-0.5">data/deadlines.json</code> 或审阅自动脚本写入的
          <code className="rounded bg-neutral-100 px-1.5 py-0.5"> data/pending_updates.json</code>。
        </p>
        <Link href="/standards" className="mt-4 inline-flex rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-nodi-green hover:text-nodi-green">
          查看评分标准
        </Link>
      </section>
    </div>
  );
}
