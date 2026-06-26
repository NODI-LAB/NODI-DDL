import type { Metadata } from "next";
import { StandardPanel } from "@/components/StandardPanel";

export const metadata: Metadata = {
  title: "NODI 评分标准 | NODIDDL"
};

export default function StandardsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">NODI 评分标准</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-neutral-700">
          NODI 评分用于实验室内部投稿规划，不机械等同于 CCF 评级。它把国际声誉、方向旗舰地位、
          与实验室研究主线的匹配度、长期成果价值等因素放在同一个评价框架中。
        </p>
      </section>

      <StandardPanel />

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">说明</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-700">
          NODI 评分不机械等同于 CCF 评级。例如，ASIACRYPT 是 CCF B，但因其属于密码学三大会议之一，
          NODI 评分为 9.7；PETS 是 CCF C，但在隐私方向具有很高认可度，NODI 评分为 8.8。
        </p>
      </section>
    </div>
  );
}
