import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NODIDDL",
  description: "NODI Conference Deadline Dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="text-xl font-semibold tracking-normal text-ink">NODIDDL</span>
              <span className="hidden text-sm font-medium text-neutral-500 sm:inline">NODI Conference Deadline Dashboard</span>
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm font-medium text-neutral-600" aria-label="主导航">
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/">首页</Link>
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/standards">评分标准</Link>
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/about">关于</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
