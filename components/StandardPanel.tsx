export const standards = [
  {
    range: "9.5-10.0",
    meaning: "旗舰代表作",
    description: "实验室重点冲刺目标，可作为长期主线成果"
  },
  {
    range: "9.0-9.4",
    meaning: "代表作级",
    description: "高质量主线成果，适合作为博士或团队核心产出"
  },
  {
    range: "8.0-8.9",
    meaning: "核心成果",
    description: "方向匹配时认可度高，适合稳定产出"
  },
  {
    range: "7.0-7.9",
    meaning: "方向成果",
    description: "子方向认可，适合阶段性成果"
  },
  {
    range: "<7.0",
    meaning: "方向补充",
    description: "可投，但不建议作为重点目标"
  }
];

type StandardPanelProps = {
  compact?: boolean;
};

export function StandardPanel({ compact = false }: StandardPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="max-w-4xl">
        <h2 className="text-lg font-semibold text-ink">NODI 评分标准</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700">
          NODI 评分不等同于 CCF 评级。综合评分同时考虑 CCF 评级、国际声誉、领域旗舰地位、
          实验室方向匹配度、论文代表性、长期发展价值和国内评价体系。
        </p>
      </div>

      {!compact && (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-neutral-500">
                <th className="border-b border-line px-3 py-2 font-medium">分数区间</th>
                <th className="border-b border-line px-3 py-2 font-medium">内部含义</th>
                <th className="border-b border-line px-3 py-2 font-medium">解释</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((item) => (
                <tr key={item.range} className="border-b border-line">
                  <td className="border-b border-line px-3 py-3 font-semibold text-ink">{item.range}</td>
                  <td className="border-b border-line px-3 py-3 text-neutral-800">{item.meaning}</td>
                  <td className="border-b border-line px-3 py-3 text-neutral-700">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
