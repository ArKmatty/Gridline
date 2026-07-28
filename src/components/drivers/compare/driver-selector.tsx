"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { Driver, DriverStanding } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";
import { cn } from "@/lib/utils";

interface DriverSelectorProps {
  label: string;
  drivers: Driver[];
  standings: DriverStanding[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function DriverSelector({
  label,
  drivers,
  standings,
  selectedId,
  onSelect,
  loading,
}: DriverSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedDriver = drivers.find(d => d.driverId === selectedId);
  const selectedStanding = standings.find(s => s.Driver.driverId === selectedId);
  const selectedTeam = selectedStanding?.Constructors[0];
  
  const filteredDrivers = drivers.filter(d =>
    `${d.givenName} ${d.familyName}`.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card p-4">
      <label className="mb-2 block text-sm font-medium text-muted">{label}</label>
      
      {selectedDriver ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-1 rounded-full"
              style={{ backgroundColor: getTeamColor(selectedTeam?.constructorId || "") }}
            />
            <div>
              <p className="font-semibold">
                {selectedDriver.givenName} {selectedDriver.familyName}
              </p>
              {selectedTeam && (
                <p className="text-xs text-muted">{selectedTeam.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onSelect("")}
            className="text-xs text-muted hover:text-foreground"
          >
            Cambia
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-accent",
              isOpen && "border-accent"
            )}
          >
            <Search className="h-4 w-4 text-muted" />
            <span className="text-muted">Cerca un pilota...</span>
          </button>

          {isOpen && (
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-card shadow-lg">
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome o codice..."
                  className="w-full rounded bg-background px-2 py-1 text-sm outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted">Caricamento...</div>
                ) : filteredDrivers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted">Nessun pilota trovato</div>
                ) : (
                  filteredDrivers.map((driver) => {
                    const standing = standings.find(s => s.Driver.driverId === driver.driverId);
                    const team = standing?.Constructors[0];
                    return (
                      <button
                        key={driver.driverId}
                        onClick={() => {
                          onSelect(driver.driverId);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-accent/10"
                      >
                        <div
                          className="h-8 w-1 rounded-full"
                          style={{ backgroundColor: getTeamColor(team?.constructorId || "") }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {driver.givenName} {driver.familyName}
                          </p>
                          {team && (
                            <p className="text-xs text-muted">{team.name}</p>
                          )}
                        </div>
                        {driver.code && (
                          <span className="font-mono text-xs text-muted">{driver.code}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
