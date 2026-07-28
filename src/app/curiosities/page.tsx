import { Sparkles } from "lucide-react";
import { CuriositiesBrowser } from "@/components/curiosities/browser";
import { SectionHeader } from "@/components/ui/section-header";
import curiosities from "@/data/curiosities.json";
import {
  getConstructorStandings,
  getDriverStandings,
  getSeasonSchedule,
} from "@/lib/jolpica";
import type { Curiosity } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

export const metadata = {
  title: "Curiosities",
};

export const revalidate = 3600;

export default async function CuriositiesPage() {
  const [drivers, constructors, schedule] = await Promise.all([
    getDriverStandings().catch(() => []),
    getConstructorStandings().catch(() => []),
    getSeasonSchedule().catch(() => []),
  ]);

  const derived: Curiosity[] = [];

  if (drivers[0]) {
    const leader = drivers[0];
    const second = drivers[1];
    const gap =
      second != null
        ? (parseFloat(leader.points) || 0) - (parseFloat(second.points) || 0)
        : 0;
    derived.push({
      id: "derived-leader",
      title: `${leader.Driver.givenName} ${leader.Driver.familyName} leads the championship`,
      body: second
        ? `Currently P1 on ${formatPoints(leader.points)} points, ${formatPoints(gap)} ahead of ${second.Driver.familyName}.`
        : `Currently leads the drivers' championship on ${formatPoints(leader.points)} points.`,
      category: "This season",
    });
  }

  if (constructors[0]) {
    derived.push({
      id: "derived-constructor",
      title: `${constructors[0].Constructor.name} tops the constructors'`,
      body: `The team sits on ${formatPoints(constructors[0].points)} points with ${constructors[0].wins} race win(s) so far this season.`,
      category: "This season",
    });
  }

  if (schedule.length) {
    const sprintWeekends = schedule.filter((r) => r.Sprint).length;
    derived.push({
      id: "derived-calendar",
      title: `${schedule.length} Grands Prix on the calendar`,
      body:
        sprintWeekends > 0
          ? `This season features ${schedule.length} rounds, including ${sprintWeekends} sprint weekend(s).`
          : `This season features ${schedule.length} championship rounds.`,
      category: "This season",
    });
  }

  const mostWins = [...drivers].sort(
    (a, b) => (parseInt(b.wins) || 0) - (parseInt(a.wins) || 0),
  )[0];
  if (mostWins && (parseInt(mostWins.wins) || 0) > 0) {
    derived.push({
      id: "derived-wins",
      title: `Most wins right now: ${mostWins.Driver.familyName}`,
      body: `${mostWins.Driver.givenName} ${mostWins.Driver.familyName} has ${mostWins.wins} victory(ies) this season.`,
      category: "This season",
    });
  }

  return (
    <div>
      <SectionHeader
        icon={Sparkles}
        title="Curiosities"
        subtitle="Fun facts, rule explainers, and live season nuggets pulled from the championship data."
      />
      <CuriositiesBrowser
        items={curiosities as Curiosity[]}
        derived={derived}
      />
    </div>
  );
}
