"use client";

import React from "react";
import { Landmark, MapPin, ChevronDown, ChevronRight, Calendar, Clock } from "lucide-react";

export type ViewLevel = "delhi" | "zone" | "ward";

export interface CMHeaderProps {
  level: ViewLevel;
  zoneName?: string;
  wardName?: string;
  dateStr: string;
  timeStr: string;
  /** Navigate to a higher level via the breadcrumb. */
  onCrumb: (level: ViewLevel) => void;
}

export const CMHeader: React.FC<CMHeaderProps> = ({
  level,
  zoneName,
  wardName,
  dateStr,
  timeStr,
  onCrumb,
}) => {
  const crumb = (label: string, target: ViewLevel, active: boolean) =>
    active ? (
      <span className="text-emerald-600 font-bold dark:text-emerald-400">{label}</span>
    ) : (
      <button
        onClick={() => onCrumb(target)}
        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        {label}
      </button>
    );

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
            <Landmark size={20} className="text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight sm:text-lg">JanSamadhan</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">CM Command Center</p>
          </div>
        </div>
        <div className="h-6 border-l border-slate-200 dark:border-zinc-800"></div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCrumb("delhi")}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>DELHI OVERVIEW</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <nav aria-label="Breadcrumb" className="flex items-center text-xs font-semibold text-slate-500 dark:text-zinc-400">
          {crumb("Delhi", "delhi", level === "delhi")}
          {level !== "delhi" && (
            <>
              <ChevronRight size={10} className="mx-2 text-slate-400" />
              {crumb(zoneName ? `${zoneName} Zone` : "Zone", "zone", level === "zone")}
            </>
          )}
          {level === "ward" && (
            <>
              <ChevronRight size={10} className="mx-2 text-slate-400" />
              {crumb(wardName ?? "Ward", "ward", true)}
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-zinc-300">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400 dark:text-zinc-500" />
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 dark:border-zinc-800">
          <Clock size={14} className="text-slate-400 dark:text-zinc-500" />
          <span className="tabular-nums">{timeStr}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-zinc-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
            CM
          </div>
          <span className="hidden sm:inline">CM Delhi</span>
        </div>
      </div>
    </header>
  );
};
