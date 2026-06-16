"use client";

import React, { useState } from "react";

import { KPIStatsRow } from "../KPIStatsRow";
import { MapLayersPanel } from "../MapLayersPanel";
import { MapSection } from "../MapSection";
import { ActiveInterventionsPanel } from "../ActiveInterventionsPanel";
import { DelhiHealthScoreBar } from "../DelhiHealthScoreBar";
import { QuickActionsFooter } from "../QuickActionsFooter";
import { InterventionReviewModal } from "../InterventionReviewModal";

import { Intervention, InterventionTab } from "../cm-types";
import { delhiKpis, cmInterventions, delhiZoneScores } from "../cm-mock";
import type { ZoneFeature } from "../cm-geo";

export interface DelhiOverviewViewProps {
  /** 12 MCD zone polygons (unioned ward geometries). */
  zoneRegions: ZoneFeature[];
  /** zoneId -> complaint count, for choropleth fill. */
  zoneCounts: Record<string, number>;
  /** Click a zone polygon to drill into it. */
  onRegionClick: (zoneId: string) => void;
  triggerToast: (message: string) => void;
}

// All / Critical / Escalated tabs
const escalationTabs: InterventionTab[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical", match: (i) => i.severity === "critical" },
  { id: "escalated", label: "Escalated", match: (i) => !!i.escalated },
];

export const DelhiOverviewView: React.FC<DelhiOverviewViewProps> = ({
  zoneRegions,
  zoneCounts,
  onRegionClick,
  triggerToast,
}) => {
  const [activeLayer, setActiveLayer] = useState("density");
  const [searchQuery, setSearchQuery] = useState("");
  const [intensity, setIntensity] = useState(70);
  const [interventionFilter, setInterventionFilter] = useState("all");
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  return (
    <>
      <main className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        <KPIStatsRow kpis={delhiKpis} onCardClick={(id) => triggerToast(`Navigating to details for KPI card: ${id}`)} />

        <div className="flex flex-col xl:flex-row gap-3">
          <MapLayersPanel
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            intensity={intensity}
            onIntensityChange={setIntensity}
            className="xl:h-[560px]"
          />

          <div className="flex-1 flex flex-col min-h-[450px] xl:h-[560px]">
            <MapSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onShowIncidentsClick={() => triggerToast("Zone incident details refreshed")}
              wardTitle="Delhi Overview"
              wardSubtitle="12 Zones  •  250 Wards  •  Population: 2.1 Cr"
              searchPlaceholder="Search Zone / Ward..."
              regions={zoneRegions}
              regionCounts={zoneCounts}
              onRegionClick={onRegionClick}
              choropleth
              showComplaints={false}
              className="xl:h-full"
            />
          </div>

          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-3 xl:h-[560px]">
            <ActiveInterventionsPanel
              interventions={cmInterventions}
              activeFilter={interventionFilter}
              onFilterChange={setInterventionFilter}
              onReviewClick={setSelectedIntervention}
              title="CM INTERVENTION REQUIRED"
              tabs={escalationTabs}
              showThumbnails
              onViewAllClick={() => triggerToast("Opening full interventions queue...")}
            />
          </div>
        </div>

        <DelhiHealthScoreBar overall={84} trend="+3 pts" zones={delhiZoneScores} />
      </main>

      <QuickActionsFooter onFiltersClick={() => triggerToast("Filters panel coming soon")} />

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
