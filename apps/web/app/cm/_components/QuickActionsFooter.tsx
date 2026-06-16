"use client";

import React, { useRef } from "react";
import {
  Phone,
  CalendarDays,
  UserCheck,
  UserPlus,
  FileText,
  Radio,
  Sliders,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { QuickAction } from "./cm-types";

gsap.registerPlugin(useGSAP);

import { cn } from "@/src/lib/utils";

export interface QuickActionsFooterProps {
  /** Configurable action buttons. When empty/omitted, only the ticker row renders (e.g. Delhi overview). */
  actions?: QuickAction[];
  onAction?: (id: string) => void;
  onFiltersClick: () => void;
  /** Marquee items. Falls back to a default ticker. */
  tickerItems?: React.ReactNode[];
  className?: string;
}

const actionIcons: Record<QuickAction["icon"], LucideIcon> = {
  phone: Phone,
  calendar: CalendarDays,
  escalate: UserCheck,
  deploy: UserPlus,
  report: FileText,
  workforce: UserPlus,
  review: ClipboardCheck,
};

const actionColors: Record<QuickAction["color"], string> = {
  emerald:
    "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-zinc-700/50",
  red:
    "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-zinc-700/50",
  blue:
    "border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-zinc-700/50",
};

const iconColors: Record<QuickAction["color"], string> = {
  emerald: "text-emerald-500",
  red: "text-red-500",
  blue: "text-blue-500",
};

const defaultTicker: React.ReactNode[] = [
  <span key="t1">
    • <strong className="text-slate-700 dark:text-zinc-200">142</strong> new complaints reported across zone today
  </span>,
  <span key="t2">
    • <strong className="text-slate-700 dark:text-zinc-200">Mobile Workforce:</strong> 1,254 Workers online • 71% active deployment
  </span>,
  <span key="t3">
    • <strong className="text-slate-700 dark:text-zinc-200">Departments:</strong> 24 key municipal areas under active surveillance
  </span>,
  <span key="t4">
    • <strong className="text-slate-700 dark:text-zinc-200">Avg Resolution:</strong> 4h 12m response time (<span className="text-emerald-500">-11% today</span>)
  </span>,
  <span key="t5">
    • <strong className="text-slate-700 dark:text-zinc-200">Queue backlog:</strong> reduced by 8.2% in last 24h
  </span>,
];

export const QuickActionsFooter: React.FC<QuickActionsFooterProps> = ({
  actions,
  onAction,
  onFiltersClick,
  tickerItems = defaultTicker,
  className,
}) => {
  const footerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        footerRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className={cn("opacity-0 bg-white border-t border-slate-200 mt-auto sticky bottom-0 z-50 shrink-0 dark:border-zinc-800 dark:bg-zinc-900 select-none", className)}
    >
      {/* Quick Actions Panel — only when actions are provided */}
      {actions && actions.length > 0 && (
        <div className="px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
              QUICK
              <br />
              ACTIONS
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = actionIcons[action.icon];
              return (
                <button
                  key={action.id}
                  onClick={() => onAction?.(action.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold dark:bg-zinc-800 shadow-sm transition-all active:scale-95",
                    actionColors[action.color]
                  )}
                >
                  <Icon size={13} className={iconColors[action.color]} /> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Ticker Marquee */}
      <div className="bg-slate-50 dark:bg-zinc-950 py-1.5 px-4 flex items-center justify-between gap-8 overflow-hidden text-xs">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-800 dark:text-zinc-200 font-bold">
          <Radio size={12} className="text-emerald-500 animate-pulse" />
          <span>LIVE FEED</span>
        </div>

        {/* Marquee Body */}
        <div className="flex-1 overflow-hidden relative h-5">
          <div className="absolute flex gap-16 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-zinc-400 animate-marquee">
            {tickerItems}
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 shrink-0 cursor-pointer hover:text-emerald-600 font-bold text-[10px] dark:hover:text-emerald-400 transition-colors"
          onClick={onFiltersClick}
        >
          <Sliders size={11} />
          <span>Filters</span>
        </div>
      </div>
    </footer>
  );
};
