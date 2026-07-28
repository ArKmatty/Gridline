import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Gauge,
  Sparkles,
  Users,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { MoreHorizontal } from "lucide-react";

const links = [
  {
    href: "/calendar",
    title: "Calendar",
    desc: "Full season schedule",
    icon: CalendarDays,
  },
  {
    href: "/drivers",
    title: "Drivers",
    desc: "Grid profiles & form",
    icon: Users,
  },
  {
    href: "/teams",
    title: "Teams",
    desc: "Constructor standings",
    icon: Building2,
  },
  {
    href: "/telemetry",
    title: "Telemetry",
    desc: "Speed & pedal traces",
    icon: Gauge,
  },
  {
    href: "/curiosities",
    title: "Curiosities",
    desc: "Facts & season nuggets",
    icon: Sparkles,
  },
];

export const metadata = { title: "More" };

export default function MorePage() {
  return (
    <div>
      <SectionHeader
        icon={MoreHorizontal}
        title="More"
        subtitle="Everything else on Gridline."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card card-hover p-5">
            <span className="icon-tile mb-3">
              <l.icon className="h-4 w-4" />
            </span>
            <p className="font-semibold">{l.title}</p>
            <p className="mt-1 text-xs text-muted">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
