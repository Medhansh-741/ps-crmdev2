const fs = require('fs');
const path = require('path');
const union = require('@turf/union').default || require('@turf/union');
const { featureCollection } = require('@turf/helpers');

const AC_ZONE = {
  "CHANDNI CHOWK": "city-sp",
  "BALLIMARAN": "city-sp",
  "MATIA MAHAL": "city-sp",
  "SADAR BAZAR": "city-sp",

  "KAROL BAGH": "karol-bagh",
  "PATEL NAGAR": "karol-bagh",
  "RAJINDER NAGAR": "karol-bagh",
  "MOTI NAGAR": "karol-bagh",

  "TIMARPUR": "civil-lines",
  "ADARSH NAGAR": "civil-lines",
  "MODEL TOWN": "civil-lines",
  "BURARI": "civil-lines",

  "NARELA": "narela",
  "BAWANA": "narela",
  "MUNDKA": "narela",

  "ROHINI": "rohini",
  "RITHALA": "rohini",
  "BADLI": "rohini",
  "KIRARI": "rohini",
  "MANGOL PURI": "rohini",
  "SULTANPUR MAJRA": "rohini",

  "SHALIMAR BAGH": "keshav-puram",
  "SHAKUR BASTI": "keshav-puram",
  "WAZIRPUR": "keshav-puram",
  "TRI NAGAR": "keshav-puram",

  "NAJAFGARH": "najafgarh",
  "BIJWASAN": "najafgarh",
  "MATIALA": "najafgarh",
  "DWARKA": "najafgarh",
  "PALAM": "najafgarh",
  "NANGLOI JAT": "najafgarh",

  "HARI NAGAR": "west",
  "TILAK NAGAR": "west",
  "JANAKPURI": "west",
  "VIKASPURI": "west",
  "RAJOURI GARDEN": "west",
  "MADIPUR": "west",
  "UTTAM NAGAR": "west",

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

  "KASTURBA NAGAR": "central",
  "JANGPURA": "central",
  "OKHLA": "central",

  "KARAWAL NAGAR": "shahdara-north",
  "MUSTAFABAD": "shahdara-north",
  "GHONDA": "shahdara-north",
  "BABARPUR": "shahdara-north",
  "GOKALPUR": "shahdara-north",
  "SEELAMPUR": "shahdara-north",
  "SEEMA PURI": "shahdara-north",
  "ROHTAS NAGAR": "shahdara-north",

  "SHAHDARA": "shahdara-south",
  "VISHWAS NAGAR": "shahdara-south",
  "KRISHNA NAGAR": "shahdara-south",
  "GANDHI NAGAR": "shahdara-south",
  "LAXMI NAGAR": "shahdara-south",
  "PATPARGANJ": "shahdara-south",
  "TRILOKPURI": "shahdara-south",
  "KONDLI": "shahdara-south",
};

const ZONES = [
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

const ZONE_BY_ID = {};
ZONES.forEach(z => { ZONE_BY_ID[z.id] = z; });

function zoneIdForAc(acName) {
  if (!acName) return "unzoned";
  return AC_ZONE[acName.trim().toUpperCase()] || "unzoned";
}

function mergeToMultiPolygon(members) {
  const coordinates = [];
  for (const m of members) {
    const g = m.geometry;
    if (g.type === "Polygon") coordinates.push(g.coordinates);
    else if (g.type === "MultiPolygon") coordinates.push(...g.coordinates);
  }
  return { type: "MultiPolygon", coordinates };
}

function hasValidGeometry(geom) {
  if (!geom || typeof geom !== "object") return false;
  return (geom.type === "Polygon" || geom.type === "MultiPolygon") &&
         Array.isArray(geom.coordinates) && geom.coordinates.length > 0;
}

const wardsFile = path.join(__dirname, '../public/delhi_wards.geojson');
const wardsData = JSON.parse(fs.readFileSync(wardsFile, 'utf8'));

const groups = new Map();

for (const w of wardsData.features) {
  const acName = w.properties.AC_Name;
  const zoneId = zoneIdForAc(acName);
  if (zoneId === "unzoned" || !hasValidGeometry(w.geometry)) continue;
  
  if (!groups.has(zoneId)) {
    groups.set(zoneId, []);
  }
  groups.get(zoneId).push(w);
}

const zoneFeatures = [];

for (const [zoneId, members] of groups.entries()) {
  const def = ZONE_BY_ID[zoneId];
  let geometry;
  try {
    const u = members.length === 1 ? members[0] : union(featureCollection(members));
    geometry = u && hasValidGeometry(u.geometry) ? u.geometry : mergeToMultiPolygon(members);
  } catch (err) {
    console.warn(`Turf union failed for ${zoneId}, falling back to manual merge:`, err.message);
    geometry = mergeToMultiPolygon(members);
  }

  if (!hasValidGeometry(geometry)) continue;

  zoneFeatures.push({
    type: "Feature",
    id: zoneId,
    geometry,
    properties: {
      zoneId,
      name: def.name,
      color: def.color,
      wardCount: members.length
    }
  });
}

const outGeoJSON = {
  type: "FeatureCollection",
  features: zoneFeatures
};

const outFile = path.join(__dirname, '../public/delhi_zones.geojson');
fs.writeFileSync(outFile, JSON.stringify(outGeoJSON, null, 2), 'utf8');

console.log(`Successfully generated ${outFile} with ${zoneFeatures.length} zones.`);
