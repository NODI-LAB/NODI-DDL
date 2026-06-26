import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/assets";
import "./globals.css";

const siteTitle = "NODI Conference Deadlines";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`
  },
  description: siteTitle,
  icons: {
    icon: [
      {
        url: assetPath("/nodi-lab-icon.png"),
        type: "image/png"
      }
    ],
    apple: assetPath("/nodi-lab-icon.png")
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={assetPath("/nodi-lab-icon.png")}
                alt="NODI Lab"
                width={34}
                height={34}
                className="h-9 w-9 rounded-full object-contain"
                priority
              />
              <span className="text-xl font-semibold tracking-normal text-ink">{siteTitle}</span>
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm font-medium text-neutral-600" aria-label="主导航">
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/">首页</Link>
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/standards">评分标准</Link>
              <Link className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-nodi-green" href="/about">关于</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-3 py-6 sm:px-4 lg:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
