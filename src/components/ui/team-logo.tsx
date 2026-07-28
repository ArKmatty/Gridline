import Image from "next/image";
import { getTeamColor } from "@/lib/team-colors";
import { getTeamLogo, getTeamShortName } from "@/lib/team-logos";

interface TeamLogoProps {
  teamName: string;
  teamId: string;
  size?: "sm" | "md" | "lg";
}

export function TeamLogo({ teamName, teamId, size = "md" }: TeamLogoProps) {
  const color = getTeamColor(teamId);
  const logoUrl = getTeamLogo(teamId);
  const shortName = getTeamShortName(teamName);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizeClasses = {
    sm: "text-[8px]",
    md: "text-xs",
    lg: "text-sm",
  };

  if (logoUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center relative overflow-hidden bg-white`}
        style={{
          border: `2px solid ${color}`,
        }}
      >
        <Image
          src={logoUrl}
          alt={`${teamName} logo`}
          width={size === "lg" ? 56 : size === "md" ? 40 : 24}
          height={size === "lg" ? 56 : size === "md" ? 40 : 24}
          className="object-contain p-1"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${textSizeClasses[size]} rounded-lg flex items-center justify-center font-bold relative overflow-hidden`}
      style={{
        backgroundColor: `${color}20`,
        border: `2px solid ${color}`,
        color: color,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, transparent 50%)`,
        }}
      />
      <span className="relative z-10">{shortName}</span>
    </div>
  );
}
