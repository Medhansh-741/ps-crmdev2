"use client";

import React, { useRef } from "react";
import { Clock, Building2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Intervention, InterventionTab } from "./cm-types";

gsap.registerPlugin(useGSAP);

export interface ActiveInterventionsPanelProps {
  interventions: Intervention[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onReviewClick: (item: Intervention) => void;
  onViewAllClick?: () => void;
  /** Card header label. Defaults to "ACTIVE INTERVENTIONS". */
  title?: string;
  /** Configurable filter tabs. Defaults to severity tabs (All/Critical/High/Medium). */
  tabs?: InterventionTab[];
  /** Show a thumbnail image on each card when the intervention has an imageUrl. */
  showThumbnails?: boolean;
}

const severityColors: Record<Intervention["severity"], string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const defaultTabs: InterventionTab[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical", match: (i) => i.severity === "critical" },
  { id: "high", label: "High", match: (i) => i.severity === "high" },
  { id: "medium", label: "Medium", match: (i) => i.severity === "medium" },
];

export const ActiveInterventionsPanel: React.FC<ActiveInterventionsPanelProps> = ({
  interventions,
  activeFilter,
  onFilterChange,
  onReviewClick,
  onViewAllClick,
  title = "ACTIVE INTERVENTIONS",
  tabs = defaultTabs,
  showThumbnails = false,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeFilter) ?? tabs[0];
  const visibleItems = interventions.filter((item) =>
    activeTab?.match ? activeTab.match(item) : true
  );

  // Trigger animations whenever interventions are updated or filtered
  useGSAP(
    () => {
      gsap.fromTo(
        ".intervention-item",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power1.out" }
      );
    },
    { dependencies: [interventions, activeFilter], scope: listRef }
  );

  return (
    <div
      ref={listRef}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex-1 flex flex-col min-h-0 select-none"
    >
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
          {title}
        </h3>
        {onViewAllClick && (
          <a
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onViewAllClick();
            }}
          >
            View All
          </a>
        )}
      </div>

      {/* Sub-tabs for filtering */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-zinc-800 shrink-0">
        {tabs.map((tab) => {
          const count = tab.match
            ? interventions.filter(tab.match).length
            : interventions.length;

          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                activeFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List of Interventions */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2.5">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="intervention-item opacity-0 flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
            onClick={() => onReviewClick(item)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase leading-none ${
                    severityColors[item.severity]
                  }`}
                >
                  {item.severity}
                </span>
                {item.escalated && (
                  <span className="text-[9px] font-bold text-red-500">• Escalated</span>
                )}
                {item.status === "monitoring" && (
                  <span className="text-[9px] font-bold text-slate-400">• Monitoring</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 leading-tight">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                {item.ward ? `${item.ward}` : item.locality}
                {item.zone ? ` • ${item.zone}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {item.departments.map((dept, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] text-slate-400 flex items-center gap-0.5 font-bold"
                  >
                    <Building2 size={10} /> {dept}
                  </span>
                ))}
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                  <Clock size={10} /> {item.time}
                </span>
              </div>
            </div>

            {showThumbnails && (
              <div className="flex flex-col items-end justify-between w-20 shrink-0 gap-1.5">
                <div className="h-12 w-20 overflow-hidden rounded-md bg-slate-200 dark:bg-zinc-700">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <button
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded shadow-sm w-full leading-none transition-all active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewClick(item);
                  }}
                >
                  Review
                </button>
              </div>
            )}

            {!showThumbnails && (
              <div className="text-right flex flex-col items-end justify-end w-16 shrink-0">
                <button
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded shadow-sm w-full leading-none transition-all active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewClick(item);
                  }}
                >
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
