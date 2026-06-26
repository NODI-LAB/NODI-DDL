import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ConferenceDetail } from "@/components/ConferenceDetail";
import { conferences, getConferenceBySlug } from "@/lib/conferences";

export const dynamicParams = false;

type ConferencePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return conferences.map((conference) => ({
    slug: conference.slug
  }));
}

export async function generateMetadata({ params }: ConferencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const conference = getConferenceBySlug(slug);

  return {
    title: conference ? conference.name : "Conference",
    description: conference?.note ?? "NODI conference detail"
  };
}

export default async function ConferencePage({ params }: ConferencePageProps) {
  const { slug } = await params;
  const conference = getConferenceBySlug(slug);

  if (!conference) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-nodi-green">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        返回首页
      </Link>
      <ConferenceDetail conference={conference} />
    </div>
  );
}
