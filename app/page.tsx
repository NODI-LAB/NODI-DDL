import Image from "next/image";
import { ConferenceTable } from "@/components/ConferenceTable";
import { StatCards } from "@/components/StatCards";
import { conferences, getConferenceCategories, getStats } from "@/lib/conferences";

export default function HomePage() {
  const stats = getStats();
  const categories = getConferenceCategories();

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex justify-center">
          <Image
            src="/nodi-lab-logo.jpg"
            alt="NODI Lab logo"
            width={220}
            height={214}
            className="h-32 w-auto rounded-full sm:h-40"
            priority
          />
        </div>
        <StatCards stats={stats} />
      </section>

      <ConferenceTable conferences={conferences} categories={categories} />
    </div>
  );
}
