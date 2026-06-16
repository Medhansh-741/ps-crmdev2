"use client";

import React, { useRef } from "react";
import { HeartPulse, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ZoneScore } from "./cm-types";

gsap.registerPlugin(useGSAP);

import { cn } from "@/src/lib/utils";

export interface DelhiHealthScoreBarProps {
  overall: number;
  trend: string;
  zones: ZoneScore[];
  className?: string;
}

export const DelhiHealthScoreBar: React.FC<DelhiHealthScoreBarProps> = ({
  overall,
  trend,
  zones,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".zone-score",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: "power1.out" }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col lg:flex-row lg:items-center gap-4 select-none",
        className
      )}
    >
      {/* Overall score */}
      <div className="flex items-center gap-3 shrink-0 lg:border-r lg:border-slate-100 lg:pr-5 dark:lg:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <HeartPulse size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Delhi Health Score
          </p>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-black leading-none text-slate-800 dark:text-white">
              {overall}
            </span>
            <span className="text-[10px] font-medium text-slate-400">/100</span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={12} /> {trend}
            </span>
          </div>
        </div>
      </div>

      {/* Per-zone scores */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-3 flex-1">
        {zones.map((zone) => (
          <div key={zone.name} className="zone-score opacity-0 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500 truncate leading-tight">
              {zone.name}
            </p>
            <p className="text-base font-black text-slate-800 dark:text-white mt-0.5 leading-none">
              {zone.score}
            </p>
            <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${zone.dotColor}`}></span>
          </div>
        ))}
      </div>
    </div>
  );
};
