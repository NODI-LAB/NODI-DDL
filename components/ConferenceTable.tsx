"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ExternalLink, FileText } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { FilterBar } from "@/components/FilterBar";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { MergedConference } from "@/lib/schema";
import {
  filterConferences,
  sortConferences,
  type ConferenceFilters,
  type SortMode
} from "@/lib/filters";
import { cn, formatTopics } from "@/lib/utils";

type ConferenceTableProps = {
  conferences: MergedConference[];
  categories: string[];
};

const columnHelper = createColumnHelper<MergedConference>();

function CompactText({ value, strong = false }: { value: string | null | undefined; strong?: boolean }) {
  const display = value || "TBD";

  return (
    <span
      className={cn(
        "block break-words text-sm leading-5 text-neutral-700",
        strong && "font-medium text-neutral-800"
      )}
      title={display}
    >
      {display}
    </span>
  );
}

export function ConferenceTable({ conferences, categories }: ConferenceTableProps) {
  const [filters, setFilters] = useState<ConferenceFilters>({
    direction: "all",
    ccf: "all",
    scoreRange: "all",
    deadlineRange: "all",
    query: ""
  });
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const visibleConferences = useMemo(() => {
    return sortConferences(filterConferences(conferences, filters), sortMode);
  }, [conferences, filters, sortMode]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "会议名",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={row.original.website}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline decoration-neutral-300 underline-offset-4 transition hover:text-nodi-green hover:decoration-nodi-green"
            >
              {row.original.name}
            </a>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
          </div>
          <Link
            href={`/conference/${row.original.slug}`}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-nodi-green"
            aria-label={`${row.original.name} 详情页`}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            详情
          </Link>
        </div>
      )
    }),
    columnHelper.accessor("direction", {
      header: "方向",
      cell: ({ getValue, row }) => (
        <div className="min-w-0">
          <p className="break-words font-medium leading-6 text-neutral-800">{getValue()}</p>
          <p className="mt-1 text-xs text-neutral-500">{row.original.category}</p>
        </div>
      )
    }),
    columnHelper.accessor("ccf", {
      header: "CCF",
      cell: ({ getValue }) => (
        <span className={cn(
          "inline-flex min-w-14 justify-center rounded-md border px-2 py-1 text-sm font-semibold",
          getValue() === "A" && "border-emerald-200 bg-emerald-50 text-emerald-800",
          getValue() === "B" && "border-sky-200 bg-sky-50 text-sky-800",
          getValue() === "C" && "border-amber-200 bg-amber-50 text-amber-800",
          getValue() === "非 CCF" && "border-neutral-200 bg-neutral-50 text-neutral-700"
        )}>
          {getValue()}
        </span>
      )
    }),
    columnHelper.accessor("nodi_score", {
      header: "NODI 评分",
      cell: ({ getValue }) => <ScoreBadge score={getValue()} />
    }),
    columnHelper.accessor("accepted_topics", {
      header: "适合投稿领域",
      cell: ({ getValue }) => (
        <span className="block break-words text-sm leading-6 text-neutral-700" title={getValue().join("、")}>
          {formatTopics(getValue(), 5)}
        </span>
      )
    }),
    columnHelper.accessor("conference_date.display", {
      header: "会议日期",
      cell: ({ getValue }) => <CompactText value={getValue()} />
    }),
    columnHelper.accessor("abstract_deadline.display", {
      header: "摘要截止",
      cell: ({ getValue }) => <CompactText value={getValue()} />
    }),
    columnHelper.accessor("paper_deadline.display", {
      header: "全文截止",
      cell: ({ getValue }) => <CompactText value={getValue()} strong />
    }),
    columnHelper.accessor("paper_deadline.datetime", {
      header: "倒计时",
      cell: ({ getValue }) => <DeadlineBadge datetime={getValue()} />
    }),
    columnHelper.accessor("location", {
      header: "地点",
      cell: ({ getValue }) => <CompactText value={getValue()} />
    })
  ], []);

  const table = useReactTable({
    data: visibleConferences,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <section className="space-y-4">
      <FilterBar
        filters={filters}
        sortMode={sortMode}
        categories={categories}
        onFiltersChange={setFilters}
        onSortModeChange={setSortMode}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-neutral-600">
        <p>
          显示 <span className="font-semibold text-ink">{visibleConferences.length}</span> / {conferences.length} 个会议
        </p>
        <p>默认优先显示未截止、deadline 更近、NODI 评分更高的会议</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] table-fixed border-separate border-spacing-0 text-left">
            <colgroup>
              <col style={{ width: "145px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "215px" }} />
              <col style={{ width: "135px" }} />
              <col style={{ width: "125px" }} />
              <col style={{ width: "125px" }} />
              <col style={{ width: "105px" }} />
              <col style={{ width: "160px" }} />
            </colgroup>
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b border-line px-3 py-3 text-xs font-semibold uppercase leading-4 tracking-normal text-neutral-500 first:pl-4 last:pr-4"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-emerald-50/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border-b border-line px-3 py-4 align-top first:pl-4 last:pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleConferences.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-neutral-600">
            没有匹配当前筛选条件的会议。
          </div>
        )}
      </div>
    </section>
  );
}
