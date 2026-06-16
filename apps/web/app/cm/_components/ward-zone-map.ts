// Curated ward -> MCD zone mapping for the CM dashboard map.
//
// The database (`ward_geojson` / `ward_features` views) has 251 ward polygons but
// NO zone geometry and NO ward->zone column. The only grouping field on a ward is
// `ac_name` (Assembly Constituency). Delhi's unified MCD has 12 administrative
// zones, so we map each AC -> one zone here and every ward inherits its zone from
// its `ac_name`. Zone polygons are then built by unioning member-ward geometries
// (see cm-geo.ts `buildZoneRegions`).
//
// NOTE: This AC->zone mapping is a best-effort approximation of real MCD zone
// boundaries (which don't align perfectly with assembly constituencies). It is the
// single place to correct assignments, or to later migrate to a server-side
// `zone_geojson` view (ST_Union grouped by zone). Any AC not listed (e.g. the one
// ward with a blank ac_name) falls back to UNZONED and renders neutral/non-clickable.

export type ZoneId =
  | "city-sp"
  | "karol-bagh"
  | "civil-lines"
  | "narela"
  | "rohini"
  | "keshav-puram"
  | "najafgarh"
  | "west"
  | "south"
  | "central"
  | "shahdara-north"
  | "shahdara-south"
  | "unzoned";

export interface ZoneDef {
  id: ZoneId;
  /** Display name shown in the header / breadcrumb. */
  name: string;
  /** Identity color (hex) for the zone outline / legend. */
  color: string;
}

export const ZONES: ZoneDef[] = [
  { id: "city-sp", name: "City-SP", color: "#ef4444" },
  { id: "karol-bagh", name: "Karol Bagh", color: "#f97316" },
  { id: "civil-lines", name: "Civil Lines", color: "#f59e0b" },
  { id: "narela", name: "Narela", color: "#84cc16" },
  { id: "rohini", name: "Rohini", color: "#22c55e" },
  { id: "keshav-puram", name: "Keshav Puram", color: "#10b981" },
  { id: "najafgarh", name: "Najafgarh", color: "#14b8a6" },
  { id: "west", name: "West", color: "#06b6d4" },
  { id: "south", name: "South", color: "#3b82f6" },
  { id: "central", name: "Central", color: "#6366f1" },
  { id: "shahdara-north", name: "Shahdara North", color: "#a855f7" },
  { id: "shahdara-south", name: "Shahdara South", color: "#ec4899" },
];

export const UNZONED: ZoneDef = { id: "unzoned", name: "Unzoned", color: "#94a3b8" };

export const ZONE_BY_ID: Record<string, ZoneDef> = Object.fromEntries(
  [...ZONES, UNZONED].map((z) => [z.id, z])
);

/**
 * Assembly Constituency (ac_name, upper-cased) -> MCD zone.
 * Covers all 68 named ACs across the 251 wards.
 */
export const AC_ZONE: Record<string, ZoneId> = {
  // --- City-SP (old Delhi core) ---
  "CHANDNI CHOWK": "city-sp",
  "BALLIMARAN": "city-sp",
  "MATIA MAHAL": "city-sp",
  "SADAR BAZAR": "city-sp",

  // --- Karol Bagh ---
  "KAROL BAGH": "karol-bagh",
  "PATEL NAGAR": "karol-bagh",
  "RAJINDER NAGAR": "karol-bagh",
  "MOTI NAGAR": "karol-bagh",

  // --- Civil Lines (north-central) ---
  "TIMARPUR": "civil-lines",
  "ADARSH NAGAR": "civil-lines",
  "MODEL TOWN": "civil-lines",
  "BURARI": "civil-lines",

  // --- Narela (far north-west) ---
  "NARELA": "narela",
  "BAWANA": "narela",
  "MUNDKA": "narela",

  // --- Rohini ---
  "ROHINI": "rohini",
  "RITHALA": "rohini",
  "BADLI": "rohini",
  "KIRARI": "rohini",
  "MANGOL PURI": "rohini",
  "SULTANPUR MAJRA": "rohini",

  // --- Keshav Puram ---
  "SHALIMAR BAGH": "keshav-puram",
  "SHAKUR BASTI": "keshav-puram",
  "WAZIRPUR": "keshav-puram",
  "TRI NAGAR": "keshav-puram",

  // --- Najafgarh (south-west) ---
  "NAJAFGARH": "najafgarh",
  "BIJWASAN": "najafgarh",
  "MATIALA": "najafgarh",
  "DWARKA": "najafgarh",
  "PALAM": "najafgarh",
  "NANGLOI JAT": "najafgarh",

  // --- West ---
  "HARI NAGAR": "west",
  "TILAK NAGAR": "west",
  "JANAKPURI": "west",
  "VIKASPURI": "west",
  "RAJOURI GARDEN": "west",
  "MADIPUR": "west",
  "UTTAM NAGAR": "west",

  // --- South ---
  "MEHRAULI": "south",
  "CHHATARPUR": "south",
  "MALVIYA NAGAR": "south",
  "R K PURAM": "south",
  "GREATER KAILASH": "south",
  "KALKAJI": "south",
  "DEOLI": "south",
  "AMBEDKAR NAGAR": "south",
  "SANGAM VIHAR": "south",
  "BADARPUR": "south",
  "TUGHLAKABAD": "south",

  // --- Central (south-central / trans-Yamuna-adjacent) ---
  "KASTURBA NAGAR": "central",
  "JANGPURA": "central",
  "OKHLA": "central",

  // --- Shahdara North (north trans-Yamuna) ---
  "KARAWAL NAGAR": "shahdara-north",
  "MUSTAFABAD": "shahdara-north",
  "GHONDA": "shahdara-north",
  "BABARPUR": "shahdara-north",
  "GOKALPUR": "shahdara-north",
  "SEELAMPUR": "shahdara-north",
  "SEEMA PURI": "shahdara-north",
  "ROHTAS NAGAR": "shahdara-north",

  // --- Shahdara South (south trans-Yamuna) ---
  "SHAHDARA": "shahdara-south",
  "VISHWAS NAGAR": "shahdara-south",
  "KRISHNA NAGAR": "shahdara-south",
  "GANDHI NAGAR": "shahdara-south",
  "LAXMI NAGAR": "shahdara-south",
  "PATPARGANJ": "shahdara-south",
  "TRILOKPURI": "shahdara-south",
  "KONDLI": "shahdara-south",
};

/** Resolve a ward's zone from its ac_name. Unknown/blank -> "unzoned". */
export function zoneIdForAc(acName: string | null | undefined): ZoneId {
  if (!acName) return "unzoned";
  return AC_ZONE[acName.trim().toUpperCase()] ?? "unzoned";
}
