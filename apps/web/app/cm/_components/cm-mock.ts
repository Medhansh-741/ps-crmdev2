import {
  KPICardData,
  Intervention,
  ZoneSummary,
  WardSummary,
  ZoneScore,
  LocalityHealth,
  AIInsightItem,
  DepartmentPerf,
  CouncillorData,
  QuickAction,
} from "./cm-types";

// Reusable sparkline path strings
const SPARK_UP = "M0,15 L10,12 L20,18 L30,5 L40,10 L50,15 L60,8 L70,12 L80,5 L90,10 L100,2";
const SPARK_DOWN = "M0,18 L10,15 L20,16 L30,10 L40,12 L50,8 L60,10 L70,5 L80,8 L90,2 L100,5";
const SPARK_FLAT = "M0,15 L10,18 L20,12 L30,15 L40,8 L50,10 L60,5 L70,8 L80,12 L90,5 L100,8";

const dotForScore = (score: number): string =>
  score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-400" : "bg-red-600";

const dotForSeverity = (sev: "high" | "medium" | "low"): string =>
  sev === "high" ? "bg-red-600" : sev === "medium" ? "bg-amber-400" : "bg-emerald-500";

const sevLabel = (sev: "high" | "medium" | "low"): string =>
  sev === "high" ? "High" : sev === "medium" ? "Medium" : "Low";

/* =====================================================================
 * DELHI OVERVIEW (Image 1)
 * ===================================================================*/

export const delhiKpis: KPICardData[] = [
  { id: "active", label: "Active Complaints", value: 2341, change: "+12.4%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
  { id: "critical", label: "Critical Issues", value: 41, change: "+18.6%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_DOWN, color: "red", animatePulse: true },
  { id: "sla", label: "SLA Breached", value: 127, change: "+8.1%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_FLAT, color: "amber" },
  { id: "resolved", label: "Resolved Today", value: 682, change: "+15.3%", isPositive: true, comparison: "vs yesterday", sparklinePoints: SPARK_UP, color: "teal" },
  { id: "satisfaction", label: "Citizen Satisfaction", value: 87, change: "+3.2%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
  { id: "cctv", label: "CCTV Auto-Detected", value: 213, change: "+25.7%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
];

export const zones: ZoneSummary[] = [
  { id: "north", code: "01", name: "North", activeComplaints: 188, criticalIssues: 4, slaBreached: 9, slaCompliance: 88, healthScore: 91, severity: "low", dotColor: dotForScore(91) },
  { id: "north-east", code: "02", name: "North East", activeComplaints: 241, criticalIssues: 7, slaBreached: 14, slaCompliance: 74, healthScore: 74, severity: "medium", dotColor: dotForScore(74) },
  { id: "north-west", code: "03", name: "North West", activeComplaints: 203, criticalIssues: 5, slaBreached: 11, slaCompliance: 83, healthScore: 83, severity: "medium", dotColor: dotForScore(83) },
  { id: "central", code: "04", name: "Central", activeComplaints: 312, criticalIssues: 12, slaBreached: 18, slaCompliance: 72, healthScore: 68, severity: "high", dotColor: dotForScore(68) },
  { id: "east", code: "05", name: "East", activeComplaints: 197, criticalIssues: 6, slaBreached: 12, slaCompliance: 67, healthScore: 67, severity: "high", dotColor: dotForScore(67) },
  { id: "west", code: "06", name: "West", activeComplaints: 176, criticalIssues: 4, slaBreached: 8, slaCompliance: 81, healthScore: 81, severity: "medium", dotColor: dotForScore(81) },
  { id: "south-west", code: "07", name: "South West", activeComplaints: 142, criticalIssues: 8, slaBreached: 7, slaCompliance: 88, healthScore: 88, severity: "low", dotColor: dotForScore(88) },
  { id: "new-delhi", code: "08", name: "New Delhi", activeComplaints: 96, criticalIssues: 2, slaBreached: 4, slaCompliance: 93, healthScore: 93, severity: "low", dotColor: dotForScore(93) },
  { id: "south-east", code: "09", name: "South East", activeComplaints: 168, criticalIssues: 5, slaBreached: 10, slaCompliance: 73, healthScore: 73, severity: "medium", dotColor: dotForScore(73) },
  { id: "south", code: "10", name: "South", activeComplaints: 154, criticalIssues: 4, slaBreached: 9, slaCompliance: 79, healthScore: 79, severity: "medium", dotColor: dotForScore(79) },
  { id: "najafgarh", code: "11", name: "Najafgarh", activeComplaints: 142, criticalIssues: 8, slaBreached: 7, slaCompliance: 76, healthScore: 76, severity: "medium", dotColor: dotForScore(76) },
  { id: "shahdara", code: "12", name: "Shahdara", activeComplaints: 211, criticalIssues: 9, slaBreached: 13, slaCompliance: 61, healthScore: 61, severity: "high", dotColor: dotForScore(61) },
];

export const delhiZoneScores: ZoneScore[] = zones.map((z) => ({
  name: z.name,
  score: z.healthScore,
  dotColor: dotForScore(z.healthScore),
}));

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='48'%3E%3Crect width='80' height='48' fill='%23cbd5e1'/%3E%3C/svg%3E";

export const cmInterventions: Intervention[] = [
  { id: "cm-1", title: "Open Manhole on Road", locality: "Ward 91", ward: "Ward 91", zone: "Central Zone", severity: "critical", time: "2h 35m", departments: ["MCD"], description: "AI dashcam flagged an uncovered manhole in a busy thoroughfare. High accident risk for two-wheelers.", status: "pending", escalated: true, imageUrl: PLACEHOLDER_IMG },
  { id: "cm-2", title: "Sewage Overflow", locality: "Ward 144", ward: "Ward 144", zone: "Shahdara", severity: "critical", time: "3h 10m", departments: ["MCD", "DJB"], description: "Main sewer line backflow flooding the service road with contaminated water.", status: "pending", escalated: true, imageUrl: PLACEHOLDER_IMG },
  { id: "cm-3", title: "Garbage Not Collected", locality: "Ward 56", ward: "Ward 56", zone: "North East", severity: "high", time: "5h 45m", departments: ["MCD"], description: "Community dumpsters overflowing for 3 days, drawing strong odour complaints.", status: "pending", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-4", title: "Street Light Not Working", locality: "Ward 23", ward: "Ward 23", zone: "West", severity: "high", time: "8h 20m", departments: ["PWD"], description: "A stretch of streetlights blacked out, raising night-time safety concerns.", status: "monitoring", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-5", title: "Water Leakage", locality: "Ward 102", ward: "Ward 102", zone: "South West", severity: "medium", time: "1d 2h", departments: ["DJB"], description: "Persistent drinking-water main leak wasting thousands of litres daily.", status: "pending", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-6", title: "Pothole Cluster", locality: "Ward 78", ward: "Ward 78", zone: "South", severity: "critical", time: "4h 05m", departments: ["PWD"], description: "Multiple deep potholes on an arterial road detected by camera analytics.", status: "pending", escalated: true, imageUrl: PLACEHOLDER_IMG },
  { id: "cm-7", title: "Drain Clogging Alert", locality: "Ward 12", ward: "Ward 12", zone: "East", severity: "critical", time: "1h 50m", departments: ["MCD"], description: "Pre-monsoon drain blockage; flash-flood risk with incoming rainfall.", status: "pending", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-8", title: "Illegal Dumping", locality: "Ward 64", ward: "Ward 64", zone: "North West", severity: "high", time: "6h 30m", departments: ["MCD"], description: "Construction debris dumped on public land, blocking a footpath.", status: "monitoring", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-9", title: "Traffic Signal Outage", locality: "Ward 8", ward: "Ward 8", zone: "New Delhi", severity: "high", time: "2h 10m", departments: ["Delhi Police"], description: "Signal at a key intersection offline, causing congestion at peak hours.", status: "pending", imageUrl: PLACEHOLDER_IMG },
  { id: "cm-10", title: "Park Encroachment", locality: "Ward 39", ward: "Ward 39", zone: "South East", severity: "medium", time: "1d 5h", departments: ["MCD"], description: "Unauthorised structures reported encroaching a neighbourhood park.", status: "monitoring", imageUrl: PLACEHOLDER_IMG },
];

export const delhiQuickActions: QuickAction[] = []; // no action row on Delhi overview

/* =====================================================================
 * ZONE VIEW (Image 2 — Central Zone)
 * ===================================================================*/

export const zoneKpis: KPICardData[] = [
  { id: "active", label: "Active Complaints", value: 312, change: "+14.7%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
  { id: "critical", label: "Critical Issues", value: 12, change: "+20%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_DOWN, color: "red", animatePulse: true },
  { id: "sla", label: "SLA Breached", value: 18, change: "+12.5%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_FLAT, color: "amber" },
  { id: "resolved", label: "Resolved Today", value: 98, change: "+16.1%", isPositive: true, comparison: "vs yesterday", sparklinePoints: SPARK_UP, color: "teal" },
  { id: "satisfaction", label: "Citizen Satisfaction", value: 72, change: "-4.3%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_DOWN, color: "emerald" },
  { id: "cctv", label: "CCTV Auto-Detected", value: 48, change: "+18.6%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
];

export const centralWards: WardSummary[] = [
  { id: "w-91", number: 91, name: "Connaught Place", zoneId: "central", complaints: 54, severity: "high", color: dotForSeverity("high") },
  { id: "w-88", number: 88, name: "Karol Bagh", zoneId: "central", complaints: 48, severity: "high", color: dotForSeverity("high") },
  { id: "w-89", number: 89, name: "Daryaganj", zoneId: "central", complaints: 31, severity: "high", color: dotForSeverity("high") },
  { id: "w-92", number: 92, name: "Pragati Maidan", zoneId: "central", complaints: 21, severity: "medium", color: dotForSeverity("medium") },
  { id: "w-94", number: 94, name: "India Gate", zoneId: "central", complaints: 19, severity: "medium", color: dotForSeverity("medium") },
  { id: "w-93", number: 93, name: "Rajiv Chowk", zoneId: "central", complaints: 17, severity: "low", color: dotForSeverity("low") },
  { id: "w-95", number: 95, name: "Mandi House", zoneId: "central", complaints: 14, severity: "low", color: dotForSeverity("low") },
  { id: "w-90", number: 90, name: "Paharganj", zoneId: "central", complaints: 12, severity: "low", color: dotForSeverity("low") },
];

export const wardHealthRows: LocalityHealth[] = centralWards.map((w) => ({
  name: `Ward ${w.number}`,
  count: w.complaints,
  sev: sevLabel(w.severity),
  color: w.color,
}));

export const zoneCommissioner: CouncillorData = {
  name: "Arun Kumar, IAS",
  role: "Zone Commissioner",
  body: "MCD — Central Zone",
  electionYear: "Since 2021",
  party: "",
  partyColor: "",
  spouseName: "",
  profession: "",
  age: 0,
  voterCard: "",
  complaints: 312,
  resolutionTime: "4h 20m",
  satisfactionRate: "72%",
  wardHealth: 76,
};

export const zoneInsights: AIInsightItem[] = [
  { text: "38% of complaints originate from Ward 91.", type: "warning", badge: "Density Alert" },
  { text: "Garbage complaints increased 27% this week.", type: "info", badge: "Trend Alert" },
  { text: "6 manholes remain unresolved for >48 hrs.", type: "critical", badge: "SLA Threat" },
  { text: "SLA breaches concentrated near Connaught Place corridor.", type: "critical", badge: "Delay Warning" },
  { text: "Night shift workforce utilization only 62%.", type: "warning", badge: "Staffing Alert" },
];

export const zoneDepartments: DepartmentPerf[] = [
  { id: "mcd", name: "MCD", open: 182, slaMissed: 14, avgResponse: "5h 12m", color: "bg-red-600" },
  { id: "djb", name: "DJB", open: 61, slaMissed: 2, avgResponse: "2h 05m", color: "bg-blue-500" },
  { id: "pwd", name: "PWD", open: 34, slaMissed: 1, avgResponse: "1h 48m", color: "bg-slate-500" },
  { id: "electricity", name: "Electricity", open: 23, slaMissed: 0, avgResponse: "45m", color: "bg-amber-400" },
  { id: "police", name: "Delhi Police", open: 8, slaMissed: 0, avgResponse: "30m", color: "bg-emerald-500" },
];

export const zoneInterventions: Intervention[] = [
  { id: "zi-1", title: "Open Manhole on Road", locality: "Connaught Place", ward: "Ward 91", zone: "Connaught Place", severity: "critical", time: "2h 35m", departments: ["MCD"], description: "Uncovered manhole in heavy footfall area near the inner circle.", status: "pending", escalated: true },
  { id: "zi-2", title: "Sewage Overflow", locality: "Paharganj", ward: "Ward 91", zone: "Paharganj", severity: "critical", time: "3h 10m", departments: ["DJB"], description: "Sewer backflow flooding the market lane with foul water.", status: "pending", escalated: true },
  { id: "zi-3", title: "Garbage Not Collected", locality: "Karol Bagh", ward: "Ward 88", zone: "Karol Bagh", severity: "high", time: "5h 45m", departments: ["MCD"], description: "Market-area waste bins overflowing past collection SLA.", status: "pending" },
  { id: "zi-4", title: "Street Light Not Working", locality: "Daryaganj", ward: "Ward 89", zone: "Daryaganj", severity: "high", time: "8h 20m", departments: ["PWD"], description: "Blacked-out streetlights along a busy commercial stretch.", status: "monitoring" },
  { id: "zi-5", title: "Water Pipe Burst", locality: "Karol Bagh", ward: "Ward 88", zone: "Karol Bagh", severity: "critical", time: "1h 30m", departments: ["DJB"], description: "High-pressure main rupture flooding the road.", status: "pending", escalated: true },
  { id: "zi-6", title: "Illegal Parking Hotspot", locality: "Rajiv Chowk", ward: "Ward 93", zone: "Rajiv Chowk", severity: "medium", time: "6h 10m", departments: ["Delhi Police"], description: "Repeated congestion from unauthorised parking near the metro gate.", status: "monitoring" },
  { id: "zi-7", title: "Drain Clogging", locality: "Paharganj", ward: "Ward 90", zone: "Paharganj", severity: "high", time: "4h 50m", departments: ["MCD"], description: "Choked stormwater drain raising monsoon flood risk.", status: "pending" },
  { id: "zi-8", title: "Pothole Cluster", locality: "India Gate", ward: "Ward 94", zone: "India Gate", severity: "medium", time: "7h 15m", departments: ["PWD"], description: "Surface damage on a high-speed approach road.", status: "monitoring" },
  { id: "zi-9", title: "Tree Fall Hazard", locality: "Mandi House", ward: "Ward 95", zone: "Mandi House", severity: "high", time: "2h 40m", departments: ["MCD"], description: "Leaning tree threatening overhead power lines.", status: "pending" },
  { id: "zi-10", title: "CCTV Blindspot", locality: "Connaught Place", ward: "Ward 91", zone: "Connaught Place", severity: "medium", time: "9h 05m", departments: ["Delhi Police"], description: "Surveillance camera offline at a crowded junction.", status: "monitoring" },
];

export const zonePredictionData = [
  { name: "06:00", value: 28 },
  { name: "12:00", value: 41 },
  { name: "18:00", value: 55 },
  { name: "24:00", value: 60 },
  { name: "+06h", value: 68 },
  { name: "+12h", value: 74 },
  { name: "+18h", value: 82 },
  { name: "+24h", value: 90 },
];

export const zoneQuickActions: QuickAction[] = [
  { id: "assign_workforce", label: "Assign Additional Workforce", icon: "workforce", color: "emerald" },
  { id: "escalate_commissioner", label: "Escalate to Commissioner", icon: "escalate", color: "red" },
  { id: "schedule_review", label: "Schedule Emergency Review", icon: "calendar", color: "red" },
  { id: "call_zone_officer", label: "Call Zone Officer", icon: "phone", color: "emerald" },
  { id: "generate_report", label: "Generate Situation Report", icon: "report", color: "blue" },
];

/* =====================================================================
 * WARD VIEW (Image 3 — Ward 11, Najafgarh)
 * ===================================================================*/

export const wardKpis: KPICardData[] = [
  { id: "active", label: "Active Complaints", value: 142, change: "+18.7%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
  { id: "critical", label: "Critical Issues", value: 8, change: "+33.3%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_DOWN, color: "red", animatePulse: true },
  { id: "sla", label: "SLA Breached", value: 7, change: "+16.7%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_FLAT, color: "amber" },
  { id: "resolved", label: "Resolved Today", value: 41, change: "+21.1%", isPositive: true, comparison: "vs yesterday", sparklinePoints: SPARK_UP, color: "teal" },
  { id: "satisfaction", label: "Citizen Satisfaction", value: 76, change: "-2.1%", isPositive: false, comparison: "vs last 7d", sparklinePoints: SPARK_DOWN, color: "emerald" },
  { id: "cctv", label: "CCTV Auto-Detected", value: 29, change: "+23.4%", isPositive: true, comparison: "vs last 7d", sparklinePoints: SPARK_UP, color: "emerald" },
];

export const wardDepartments: DepartmentPerf[] = [
  { id: "mcd", name: "MCD", open: 68, slaMissed: 5, avgResponse: "5h 20m", color: "bg-emerald-500" },
  { id: "djb", name: "DJB", open: 32, slaMissed: 1, avgResponse: "2h 10m", color: "bg-blue-500" },
  { id: "pwd", name: "PWD", open: 18, slaMissed: 1, avgResponse: "1h 40m", color: "bg-slate-500" },
  { id: "electricity", name: "Electricity", open: 14, slaMissed: 0, avgResponse: "50m", color: "bg-amber-400" },
  { id: "police", name: "Delhi Police", open: 4, slaMissed: 0, avgResponse: "35m", color: "bg-red-600" },
];

export const wardInterventions: Intervention[] = [
  { id: "int-1", title: "Sewage Overflow", locality: "Near Panchsheel Park", severity: "critical", time: "2h 25m", departments: ["MCD", "DJB"], description: "Severe main sewer line leakage causing toxic flood and road blockage at Panchsheel road crossing. Residents complain of contamination threat.", status: "pending", escalated: true },
  { id: "int-2", title: "Garbage Not Collected", locality: "Block B, Hanuman Enclave", severity: "high", time: "4h 10m", departments: ["MCD"], description: "Overflowing community waste dumpsters not cleared for over 4 days. Strong odor and feral animal accumulation reported by local RWAs.", status: "pending" },
  { id: "int-3", title: "Water Leakage", locality: "Near Najafgarh Metro Station", severity: "medium", time: "6h 35m", departments: ["DJB"], description: "Clean drinking water main pipe rupture near metro pillar 128. Thousands of liters of water wasted on the service lane daily.", status: "pending" },
  { id: "int-4", title: "Pothole Risk Zone", locality: "Najafgarh Road, Ward 11", severity: "critical", time: "1h 15m", departments: ["PWD"], description: "Two massive potholes detected by AI dashcams in high-speed traffic lane. Immediate danger to two-wheeler riders.", status: "monitoring", escalated: true },
  { id: "int-5", title: "Streetlight Blackout", locality: "Gopal Nagar Lane 4", severity: "medium", time: "8h 40m", departments: ["Electricity"], description: "A continuous stretch of 8 streetlights are completely non-functional. Safety concerns raised by women commuters.", status: "monitoring" },
  { id: "int-6", title: "CCTV Blindspot Detected", locality: "Prem Nagar Main Crossing", severity: "high", time: "3h 05m", departments: ["Delhi Police"], description: "Important security surveillance camera offline due to fiber link failure. High-crime area vulnerable.", status: "pending" },
  { id: "int-7", title: "Drain Clogging Alert", locality: "Roshampura Market Area", severity: "critical", time: "30m", departments: ["MCD"], description: "Monsoon pre-drainage system blocked with plastic waste. Heavy rainfall warning suggests immediate threat of local flash flooding.", status: "pending", escalated: true },
];

export const wardInsights: AIInsightItem[] = [
  { text: "42% of complaints originate from Roshampura area.", type: "warning", badge: "Density Alert" },
  { text: "Water related complaints increased by 18% in Najafgarh block.", type: "info", badge: "Trend Alert" },
  { text: "Garbage collection SLA response dropped below target in Hanumangiri.", type: "critical", badge: "SLA Threat" },
  { text: "SLA breaches are concentrated near Najafgarh road junction.", type: "critical", badge: "Delay Warning" },
  { text: "Monsoon clogging risk detected in 3 low-lying colonies.", type: "warning", badge: "Prep alert" },
];

export const wardCouncillor: CouncillorData = {
  name: "Shashi Yadav",
  role: "Ward Councillor",
  body: "Delhi Municipal Corporation",
  electionYear: "Election 2022",
  party: "BJP",
  partyColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400",
  spouseName: "Om Prakash Yadav",
  profession: "Social Worker",
  age: 31,
  voterCard: "125-Chhawala (SW)",
  complaints: 142,
  resolutionTime: "3h 45m",
  satisfactionRate: "76%",
  wardHealth: 72,
};

export const wardLocalities: LocalityHealth[] = [
  { name: "Roshampura", count: 28, sev: "High", color: "bg-red-600" },
  { name: "Najafgarh Metro", count: 32, sev: "High", color: "bg-red-600" },
  { name: "Jharoda Kalan", count: 21, sev: "High", color: "bg-red-600" },
  { name: "Dharampura", count: 19, sev: "Medium", color: "bg-amber-400" },
  { name: "Kakrola", count: 13, sev: "Medium", color: "bg-amber-400" },
  { name: "Prem Nagar", count: 14, sev: "Medium", color: "bg-amber-400" },
  { name: "Mitraon", count: 7, sev: "Low", color: "bg-emerald-500" },
  { name: "Gopal Nagar", count: 8, sev: "Low", color: "bg-emerald-500" },
];

export const wardPredictionData = [
  { name: "06:00", value: 15 },
  { name: "12:00", value: 24 },
  { name: "18:00", value: 38 },
  { name: "24:00", value: 41 },
  { name: "+06h", value: 48 },
  { name: "+12h", value: 55 },
  { name: "+18h", value: 62 },
  { name: "+24h", value: 70 },
];

export const wardQuickActions: QuickAction[] = [
  { id: "call_councillor", label: "Call Councillor", icon: "phone", color: "emerald" },
  { id: "schedule_visit", label: "Schedule Ward Visit", icon: "calendar", color: "red" },
  { id: "escalate_commissioner", label: "Escalate to Commissioner", icon: "escalate", color: "red" },
  { id: "deploy_staff", label: "Deploy Additional Staff", icon: "deploy", color: "emerald" },
  { id: "generate_report", label: "Generate Ward Report", icon: "report", color: "blue" },
];
