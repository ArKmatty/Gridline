import { Gauge } from "lucide-react";
import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getYearsWithData } from "@/lib/openf1";

const TelemetryExplorer = dynamic(
  () => import("@/components/telemetry/explorer").then((mod) => mod.TelemetryExplorer),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    ),
  }
);

export const revalidate = 3600;

export const metadata = {
  title: "Telemetry",
};

export default async function TelemetryPage() {
  const years = await getYearsWithData();

  return (
    <div>
      <SectionHeader
        icon={Gauge}
        title="Telemetry lab"
        subtitle="Three easy steps: pick a race weekend, choose a session, then a driver and lap. Charts and track map load automatically. Share via URL."
      />
      <TelemetryExplorer years={years} />
    </div>
  );
}
