"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "@/components/ThemeProvider";

import { CMHeader, ViewLevel } from "./_components/CMHeader";
import { DelhiOverviewView } from "./_components/views/DelhiOverviewView";
import { ZoneView } from "./_components/views/ZoneView";
import { WardView } from "./_components/views/WardView";
import { ZoneSummary, WardSummary } from "./_components/cm-types";
import { zones, centralWards } from "./_components/cm-mock";

gsap.registerPlugin(useGSAP);

export default function CMCommandCenterPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [timeStr, setTimeStr] = useState("10:42 AM");
  const [dateStr, setDateStr] = useState("June 16, 2026");

  // Navigation state machine: Delhi -> Zone -> Ward
  const [view, setView] = useState<ViewLevel>("delhi");
  const [selectedZone, setSelectedZone] = useState<ZoneSummary | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardSummary | null>(null);

  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);

  // Animate the active view on every level change
  useGSAP(
    () => {
      gsap.fromTo(
        viewRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    },
    { dependencies: [view], scope: viewRef }
  );

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDateStr(now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (message: string) => {
    setActionSuccessToast(message);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  // Drill-down handlers (map buttons select a representative zone/ward for now)
  const drillToZone = () => {
    const central = zones.find((z) => z.id === "central") ?? zones[0];
    setSelectedZone(central);
    setView("zone");
  };

  const drillToWard = () => {
    const ward = centralWards.find((w) => w.number === 91) ?? centralWards[0];
    setSelectedWard(ward);
    setView("ward");
  };

  // Breadcrumb / location-button navigation
  const goToLevel = (target: ViewLevel) => {
    if (target === "delhi") {
      setSelectedZone(null);
      setSelectedWard(null);
    } else if (target === "zone") {
      setSelectedWard(null);
    }
    setView(target);
  };

  const zoneName = selectedZone?.name ?? "Central";
  const wardLabel = selectedWard ? `Ward ${selectedWard.number} - ${selectedWard.name}` : "Ward 91";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-800 antialiased dark:bg-[#121212] dark:text-slate-100 font-sans">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed bottom-16 right-6 z-[9999] flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
          <CheckCircle2 size={18} />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      <CMHeader
        level={view}
        zoneName={zoneName}
        wardName={wardLabel}
        dateStr={dateStr}
        timeStr={timeStr}
        onCrumb={goToLevel}
      />

      <div ref={viewRef} className="flex flex-1 flex-col min-h-0">
        {view === "delhi" && (
          <DelhiOverviewView onDrillToZone={drillToZone} triggerToast={triggerToast} />
        )}
        {view === "zone" && (
          <ZoneView
            zoneName={zoneName}
            onBack={() => goToLevel("delhi")}
            onDrillToWard={drillToWard}
            triggerToast={triggerToast}
            isDark={isDark}
          />
        )}
        {view === "ward" && (
          <WardView
            onBack={() => goToLevel("zone")}
            triggerToast={triggerToast}
            isDark={isDark}
            wardTitle={`${wardLabel} (Delhi)`}
            wardSubtitle={`${zoneName} Zone  |  Population: 2.13 Lakh  |  Households: 38,542`}
          />
        )}
      </div>
    </div>
  );
}
