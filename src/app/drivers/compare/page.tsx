"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, ArrowLeftRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverSelector } from "@/components/drivers/compare/driver-selector";
import { ComparisonStats } from "@/components/drivers/compare/comparison-stats";
import { HeadToHeadChart } from "@/components/drivers/compare/head-to-head-chart";
import type { Driver, DriverStanding } from "@/lib/types";

export default function DriverComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [driver1Id, setDriver1Id] = useState(searchParams.get("driver1") || "");
  const [driver2Id, setDriver2Id] = useState(searchParams.get("driver2") || "");

  useEffect(() => {
    async function fetchData() {
      try {
        const [driversRes, standingsRes] = await Promise.all([
          fetch("/api/drivers"),
          fetch("/api/standings"),
        ]);
        const driversData = await driversRes.json();
        const standingsData = await standingsRes.json();
        setDrivers(driversData);
        setStandings(standingsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (driver1Id) params.set("driver1", driver1Id);
    if (driver2Id) params.set("driver2", driver2Id);
    router.replace(`/drivers/compare?${params.toString()}`);
  }, [driver1Id, driver2Id, router]);

  const driver1 = drivers.find(d => d.driverId === driver1Id);
  const driver2 = drivers.find(d => d.driverId === driver2Id);
  const standing1 = standings.find(s => s.Driver.driverId === driver1Id);
  const standing2 = standings.find(s => s.Driver.driverId === driver2Id);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={ArrowLeftRight}
        title="Driver Comparison"
        subtitle="Compare two drivers head-to-head"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <DriverSelector
          label="Driver 1"
          drivers={drivers}
          standings={standings}
          selectedId={driver1Id}
          onSelect={setDriver1Id}
          loading={loading}
        />
        <DriverSelector
          label="Driver 2"
          drivers={drivers}
          standings={standings}
          selectedId={driver2Id}
          onSelect={setDriver2Id}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : driver1 && driver2 && standing1 && standing2 ? (
        <>
          <ComparisonStats
            driver1={driver1}
            driver2={driver2}
            standing1={standing1}
            standing2={standing2}
          />
          <HeadToHeadChart
            driver1={driver1}
            driver2={driver2}
            standing1={standing1}
            standing2={standing2}
          />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="Select two drivers"
          description="Choose two drivers from the selectors above to compare their statistics."
        />
      )}
    </div>
  );
}
