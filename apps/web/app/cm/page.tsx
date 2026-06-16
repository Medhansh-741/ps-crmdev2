"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "@/components/ThemeProvider";

import { CMHeader, ViewLevel } from "./_components/CMHeader";
import { DelhiOverviewView } from "./_components/views/DelhiOverviewView";
import { ZoneView } from "./_components/views/ZoneView";
import { WardView } from "./_components/views/WardView";
import {
  useWardGeoJSON,
  useComplaintPoints,
  buildZoneRegions,
  wardRegionsForZone,
  wardByNo,
  countPointsInRegions,
} from "./_components/cm-geo";
import { ZONE_BY_ID, type ZoneId } from "./_components/ward-zone-map";

gsap.registerPlugin(useGSAP);

/** "FATEH NAGAR" -> "Fateh Nagar" */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CMCommandCenterPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [timeStr, setTimeStr] = useState("10:42 AM");
  const [dateStr, setDateStr] = useState("June 16, 2026");

  // Navigation state machine: Delhi -> Zone -> Ward
  const [view, setView] = useState<ViewLevel>("delhi");
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>(null);
  const [selectedWardNo, setSelectedWardNo] = useState<number | null>(null);

  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);

  // Real geographic data (ward polygons + complaint points)
  const { wards } = useWardGeoJSON();
  const { points } = useComplaintPoints();

  const zoneRegions = useMemo(() => buildZoneRegions(wards), [wards]);
  const zoneCounts = useMemo(
    () => countPointsInRegions(zoneRegions, points),
    [zoneRegions, points]
  );

  const zoneWardRegions = useMemo(
    () => (selectedZoneId ? wardRegionsForZone(wards, selectedZoneId) : []),
    [wards, selectedZoneId]
  );
  const wardCounts = useMemo(
    () => countPointsInRegions(zoneWardRegions, points),
    [zoneWardRegions, points]
  );

  const wardRegion = useMemo(
    () => (selectedWardNo != null ? wardByNo(wards, selectedWardNo) : undefined),
    [wards, selectedWardNo]
  );

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

  // Drill-down handlers — driven by the clicked map region's id
  const drillToZone = (zoneId: string) => {
    setSelectedZoneId(zoneId as ZoneId);
    setView("zone");
  };

  const drillToWard = (wardNo: string) => {
    setSelectedWardNo(Number(wardNo));
    setView("ward");
  };

  // Breadcrumb / location-button navigation
  const goToLevel = (target: ViewLevel) => {
    if (target === "delhi") {
      setSelectedZoneId(null);
      setSelectedWardNo(null);
    } else if (target === "zone") {
      setSelectedWardNo(null);
    }
    setView(target);
  };

  const zoneName = selectedZoneId ? ZONE_BY_ID[selectedZoneId]?.name ?? "Zone" : "Central";
  const wardNameRaw = wardRegion?.properties.wardname;
  const wardLabel =
    selectedWardNo != null
      ? `Ward ${selectedWardNo}${wardNameRaw ? ` - ${titleCase(wardNameRaw)}` : ""}`
      : "Ward";
  const wardPop = wardRegion?.properties.totalpop;

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
          <DelhiOverviewView
            zoneRegions={zoneRegions}
            zoneCounts={zoneCounts}
            onRegionClick={drillToZone}
            triggerToast={triggerToast}
          />
        )}
        {view === "zone" && (
          <ZoneView
            zoneName={zoneName}
            onBack={() => goToLevel("delhi")}
            wardRegions={zoneWardRegions}
            wardCounts={wardCounts}
            onRegionClick={drillToWard}
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
            wardSubtitle={`${zoneName} Zone${wardPop ? `  |  Population: ${wardPop.toLocaleString("en-IN")}` : ""}`}
            wardRegion={wardRegion}
          />
        )}
      </div>
    </div>
  );
}
