"use client";

import React, { useRef } from "react";
import { User, Phone, FileText } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CouncillorData } from "./cm-types";

gsap.registerPlugin(useGSAP);

/** A single metric chip in the 4-column stat grid. */
export interface ProfileMetric {
  label: string;
  value: string;
  /** Render the value in emerald (e.g. health scores). */
  highlight?: boolean;
  /** Small muted suffix appended to the value (e.g. "/100"). */
  suffix?: string;
}

export interface CouncillorInfoCardProps {
  councillor?: CouncillorData | null;
  /** Card header label. Defaults to "WARD INFORMATION". */
  title?: string;
  /** Override the 4-metric grid (e.g. for a Zone Commissioner). */
  metrics?: ProfileMetric[];
  /** Show the About section (councillor-only). Defaults to true. */
  showAbout?: boolean;
  /** Show the party badge. Defaults to true. */
  showParty?: boolean;
  /** When provided, renders a "Call" button in the header. */
  onCall?: () => void;
  loading?: boolean;
}

export const CouncillorInfoCard: React.FC<CouncillorInfoCardProps> = ({
  councillor,
  title = "WARD INFORMATION",
  metrics,
  showAbout = true,
  showParty = true,
  onCall,
  loading = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!loading && councillor) {
        // Zoom-in/fade-in entry animation when data loaded
        gsap.fromTo(
          cardRef.current,
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    },
    { dependencies: [loading, councillor], scope: cardRef }
  );

  // If loading or councillor details are not yet available, render the pulsing skeleton loader
  if (loading || !councillor) {
    return (
      <div
        ref={cardRef}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex-1 lg:max-w-md select-none flex flex-col gap-3.5 animate-pulse"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-3 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Profile Area */}
        <div className="flex items-start gap-4">
          <div className="h-28 w-24 rounded-lg bg-slate-200 dark:bg-zinc-800 shrink-0"></div>
          <div className="flex-1 space-y-3 mt-2">
            <div className="h-2 w-12 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-2.5 w-40 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full mt-1"></div>
          </div>
        </div>

        {/* Details Section */}
        {showAbout && (
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/10 rounded-lg border border-slate-100 dark:border-zinc-800/40 space-y-3">
            <div className="h-2.5 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="h-1.5 w-12 bg-slate-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-2.5 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-32 bg-slate-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-2.5 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-20 bg-slate-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-2.5 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-16 bg-slate-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-2.5 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-2 w-10 bg-slate-200 dark:bg-zinc-800 rounded mx-auto"></div>
              <div className="h-3 w-8 bg-slate-200 dark:bg-zinc-800 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cleanName = councillor.name.replace(/^(SH\.|MS\.|MR\.|MRS\.)\s+/i, "");
  const cleanWardName = councillor.voterCard && councillor.voterCard.includes("-")
    ? councillor.voterCard.split("-")[1]
    : councillor.voterCard;

  return (
    <div
      ref={cardRef}
      className="opacity-0 bg-white rounded-xl border border-slate-200 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex-1 lg:max-w-md select-none flex flex-col gap-3.5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
          <FileText size={12} className="text-slate-400 dark:text-zinc-500" />
          {title}
        </h3>
        {onCall && (
          <button
            onClick={onCall}
            className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            <Phone size={11} /> Call
          </button>
        )}
      </div>

      {/* Header Profile Area */}
      <div className="flex items-start gap-4">
        {/* Left Side Portrait Container */}
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-center border border-slate-200 dark:border-zinc-800">
          <User size={48} className="text-slate-300 dark:text-zinc-600" />
          <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-500 border border-white dark:border-zinc-950 text-[8px] text-white font-black">
            {cleanName.charAt(0)}
          </div>
        </div>

        {/* Right Side Info */}
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block leading-none">
            Councillor
          </span>
          <h4 className="text-lg font-black text-slate-800 dark:text-white mt-1 leading-tight truncate">
            {cleanName}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2 leading-tight font-semibold">
            {councillor.role === "Ward Councillor"
              ? `Ward ${councillor.voterCard.split("-")[0]} - ${cleanWardName}`
              : councillor.body}
          </p>
          {showParty && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Party:</span>
              <span className={`px-2 py-0.5 text-[8px] font-black rounded leading-none ${councillor.partyColor}`}>
                {councillor.party}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed About Section */}
      {showAbout && (
        <div className="p-3 bg-slate-50 rounded-lg dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800/60">
          <h5 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-2 uppercase tracking-wider">
            About Councillor
          </h5>
          <div className="space-y-2 text-[10px] text-slate-600 dark:text-zinc-300 font-semibold">
            {councillor.age ? (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Age:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.age}</p>
              </div>
            ) : null}
            {councillor.voterCard && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Name Enrolled as Voter in:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">
                  {cleanWardName} constituency, at Serial no {councillor.voterSerial ?? 0} in Part no {councillor.voterPart ?? 0}
                </p>
              </div>
            )}
            {councillor.education && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Education:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.education}</p>
              </div>
            )}
            {councillor.criminalCases !== undefined && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Criminal Cases:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.criminalCases}</p>
              </div>
            )}
            {councillor.assets && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Assets:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.assets}</p>
              </div>
            )}
            {councillor.liabilities && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Liabilities:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.liabilities}</p>
              </div>
            )}
            {councillor.phone && (
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[8px] uppercase leading-none mb-0.5">
                  Mobile:
                </p>
                <p className="text-slate-800 dark:text-white leading-tight">{councillor.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Main Stats */}
      <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
        {(metrics ?? [
          { label: "Complaints", value: String(councillor.complaints) },
          { label: "Resolution", value: councillor.resolutionTime },
          { label: "Satisfaction", value: councillor.satisfactionRate },
          { label: "Ward Health", value: String(councillor.wardHealth), suffix: "/100", highlight: true },
        ]).map((metric, idx) => (
          <div
            key={metric.label}
            className={`text-center ${idx > 0 ? "border-l border-slate-100 dark:border-zinc-800 pl-1" : ""}`}
          >
            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">{metric.label}</p>
            <p
              className={`font-black text-sm mt-0.5 flex items-center justify-center gap-0.5 ${
                metric.highlight ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-white"
              }`}
            >
              {metric.value}
              {metric.suffix && <span className="text-[9px] font-medium text-slate-400">{metric.suffix}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
