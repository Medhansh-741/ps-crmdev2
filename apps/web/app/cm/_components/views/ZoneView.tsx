"use client";

import React, { useState, useMemo } from "react";

import { KPIStatsRow } from "../KPIStatsRow";
import { MapLayersPanel } from "../MapLayersPanel";
import { MapSection } from "../MapSection";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { DepartmentPerformanceTable } from "../DepartmentPerformanceTable";
import { CouncillorInfoCard } from "../CouncillorInfoCard";
import { ActiveInterventionsPanel } from "../ActiveInterventionsPanel";
import { LocalityHealthTable } from "../LocalityHealthTable";
import { PredictiveOutlookCard } from "../PredictiveOutlookCard";
import { QuickActionsFooter } from "../QuickActionsFooter";
import { InterventionReviewModal } from "../InterventionReviewModal";

import { DepartmentPerf, Intervention, InterventionTab } from "../cm-types";
import type { WardFeature } from "../cm-geo";
import {
  zoneKpis,
  zoneDepartments,
  zoneInterventions,
  zoneInsights,
  zoneCommissioner,
  wardHealthRows,
  zonePredictionData,
  zoneQuickActions,
} from "../cm-mock";

export interface ZoneViewProps {
  zoneName: string;
  onBack: () => void;
  /** Ward polygons belonging to this zone. */
  wardRegions: WardFeature[];
  /** ward_no -> complaint count, for choropleth fill. */
  wardCounts: Record<string, number>;
  /** Click a ward polygon to drill into it. */
  onRegionClick: (wardNo: string) => void;
  triggerToast: (message: string) => void;
  isDark: boolean;
}

// All / Critical / Escalated tabs (zone + delhi level)
const escalationTabs: InterventionTab[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical", match: (i) => i.severity === "critical" },
  { id: "escalated", label: "Escalated", match: (i) => !!i.escalated },
];

export const ZoneView: React.FC<ZoneViewProps> = ({
  zoneName,
  onBack,
  wardRegions,
  wardCounts,
  onRegionClick,
  triggerToast,
  isDark,
}) => {
  const [activeLayer, setActiveLayer] = useState("density");
  const [searchQuery, setSearchQuery] = useState("");
  const [intensity, setIntensity] = useState(70);
  const [sortField, setSortField] = useState<keyof DepartmentPerf>("open");
  const [sortAsc, setSortAsc] = useState(false);
  const [interventionFilter, setInterventionFilter] = useState("all");
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  const handleSort = (field: keyof DepartmentPerf) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedDepartments = useMemo(() => {
    return [...zoneDepartments].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [sortField, sortAsc]);

  return (
    <>
      <main className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        <KPIStatsRow kpis={zoneKpis} onCardClick={(id) => triggerToast(`Navigating to details for KPI card: ${id}`)} />

        <div className="flex flex-col xl:flex-row gap-3">
          <MapLayersPanel
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            intensity={intensity}
            onIntensityChange={setIntensity}
            className="xl:h-[760px]"
          />

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row gap-3 xl:h-[450px] shrink-0">
              <MapSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onShowIncidentsClick={() => triggerToast("Incident details refreshed")}
                wardTitle={`${zoneName} Zone`}
                wardSubtitle={`${wardRegions.length} Wards  •  Click a ward to drill in`}
                searchPlaceholder="Search Ward / Location..."
                onBack={onBack}
                regions={wardRegions}
                regionCounts={wardCounts}
                onRegionClick={onRegionClick}
                choropleth
                showComplaints={false}
                className="xl:h-full"
              />
              <div className="w-full xl:w-80 shrink-0 flex flex-col gap-3 xl:h-full">
                <AIInsightsPanel insights={zoneInsights} />
                <DepartmentPerformanceTable
                  departments={sortedDepartments}
                  sortField={sortField}
                  sortAsc={sortAsc}
                  onSort={handleSort}
                  onViewAllClick={() => triggerToast("Opening comprehensive department log...")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
              <LocalityHealthTable
                localities={wardHealthRows}
                title="WARD HEALTH SUMMARY"
                rowLabel="Ward"
                actionLabel="View Ward Analytics"
                onViewAnalyticsClick={() => triggerToast("Opening ward analytics breakdown...")}
                className="xl:h-full"
              />
              <PredictiveOutlookCard
                data={zonePredictionData}
                expectedGrowth="+14%"
                estimatedSlaMisses={11}
                highRiskHotspots={["Connaught Place", "Karol Bagh", "Paharganj"]}
                isDark={isDark}
              />
            </div>
          </div>

          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-3 xl:h-[760px]">
            <CouncillorInfoCard
              councillor={zoneCommissioner}
              title={`${zoneName.toUpperCase()} ZONE COMMAND CENTER`}
              showAbout={false}
              showParty={false}
              onCall={() => triggerToast("Connecting to Zone Commissioner...")}
              metrics={[
                { label: "Zone Health", value: "76", suffix: "/100", highlight: true },
                { label: "Budget Used", value: "68%" },
                { label: "Field Staff", value: "428" },
                { label: "Escalations", value: "5" },
              ]}
            />
            <ActiveInterventionsPanel
              interventions={zoneInterventions}
              activeFilter={interventionFilter}
              onFilterChange={setInterventionFilter}
              onReviewClick={setSelectedIntervention}
              tabs={escalationTabs}
              onViewAllClick={() => triggerToast("Opening interventions portal...")}
            />
          </div>
        </div>
      </main>

      <QuickActionsFooter
        actions={zoneQuickActions}
        onAction={(id) => triggerToast(`Action triggered: ${id.replace(/_/g, " ")}`)}
        onFiltersClick={() => triggerToast("Filters panel coming soon")}
      />

      <InterventionReviewModal
        intervention={selectedIntervention}
        onClose={() => setSelectedIntervention(null)}
        onMarkReviewed={(item) => {
          setSelectedIntervention(null);
          triggerToast(`Intervention "${item.title}" marked as Reviewed.`);
        }}
      />
    </>
  );
};
