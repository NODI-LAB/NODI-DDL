import Image from "next/image";
import { ConferenceTable } from "@/components/ConferenceTable";
import { StatCards } from "@/components/StatCards";
import { assetPath } from "@/lib/assets";
import { conferences, getConferenceCategories, getStats } from "@/lib/conferences";

export default function HomePage() {
  const stats = getStats();
  const categories = getConferenceCategories();

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex justify-center">
          <Image
            src={assetPath("/nodi-lab-logo.jpg")}
            alt="NODI Lab logo"
            width={220}
            height={220}
            className="h-32 w-32 rounded-full object-contain sm:h-40 sm:w-40"
            priority
          />
        </div>
        <StatCards stats={stats} />
      </section>

      <ConferenceTable conferences={conferences} categories={categories} />
    </div>
  );
}
