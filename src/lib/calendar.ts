import type { Race } from "@/lib/types";

export function generateICS(races: Race[]): string {
  const events = races.map((race) => {
    const startDate = new Date(`${race.date}T${race.time || "14:00:00Z"}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 ore

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const escapeICS = (text: string) => {
      return text.replace(/[,;\n]/g, (match) => {
        if (match === "\n") return "\\n";
        return `\\${match}`;
      });
    };

    return `BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${escapeICS(race.raceName)}
DESCRIPTION:${escapeICS(race.Circuit.circuitName)}
LOCATION:${escapeICS(`${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`)}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gridline//F1 Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:F1 Calendar
X-WR-TIMEZONE:UTC
${events.join("\n")}
END:VCALENDAR`;
}

export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
