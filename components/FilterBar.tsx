"use client";

import { Search } from "lucide-react";
import type { ConferenceFilters, ScoreRange, SortMode } from "@/lib/filters";
import type { DeadlineRange } from "@/lib/deadlines";

type FilterBarProps = {
  filters: ConferenceFilters;
  sortMode: SortMode;
  categories: string[];
  onFiltersChange: (filters: ConferenceFilters) => void;
  onSortModeChange: (sortMode: SortMode) => void;
};

const scoreOptions: Array<{ value: ScoreRange; label: string }> = [
  { value: "all", label: "全部评分" },
  { value: "flagship", label: "9.5-10.0" },
  { value: "representative", label: "9.0-9.4" },
  { value: "core", label: "8.0-8.9" },
  { value: "direction", label: "7.0-7.9" },
  { value: "supplement", label: "<7.0" }
];

const deadlineOptions: Array<{ value: DeadlineRange; label: string }> = [
  { value: "all", label: "全部" },
  { value: "upcoming", label: "未截止" },
  { value: "30", label: "30 天内" },
  { value: "60", label: "60 天内" },
  { value: "90", label: "90 天内" },
  { value: "past", label: "已截止" },
  { value: "tbd", label: "TBD" }
];

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "default", label: "默认排序" },
  { value: "score-desc", label: "NODI 评分" },
  { value: "deadline-asc", label: "全文截止" },
  { value: "name-asc", label: "会议名" },
  { value: "ccf-asc", label: "CCF 评级" }
];

export function FilterBar({
  filters,
  sortMode,
  categories,
  onFiltersChange,
  onSortModeChange
}: FilterBarProps) {
  const update = <K extends keyof ConferenceFilters>(key: K, value: ConferenceFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft" aria-label="会议筛选">
      <div className="grid gap-3 lg:grid-cols-[1.35fr_repeat(5,minmax(0,1fr))]">
        <label className="relative block">
          <span className="sr-only">关键词搜索</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
            placeholder="搜索会议、方向、领域、备注"
          />
        </label>

        <label className="block">
          <span className="sr-only">一级方向</span>
          <select
            value={filters.direction}
            onChange={(event) => update("direction", event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">全部方向</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">CCF 评级</span>
          <select
            value={filters.ccf}
            onChange={(event) => update("ccf", event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">全部 CCF</option>
            <option value="A">CCF A</option>
            <option value="B">CCF B</option>
            <option value="C">CCF C</option>
            <option value="非 CCF">非 CCF</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">NODI 评分区间</span>
          <select
            value={filters.scoreRange}
            onChange={(event) => update("scoreRange", event.target.value as ScoreRange)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
          >
            {scoreOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Deadline 时间范围</span>
          <select
            value={filters.deadlineRange}
            onChange={(event) => update("deadlineRange", event.target.value as DeadlineRange)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
          >
            {deadlineOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">排序</span>
          <select
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as SortMode)}
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-nodi-green focus:ring-2 focus:ring-emerald-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
