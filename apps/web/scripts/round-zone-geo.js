const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../public/delhi_zones.geojson');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function roundCoords(coords) {
  if (typeof coords === 'number') {
    return Math.round(coords * 100000) / 100000;
  }
  if (Array.isArray(coords)) {
    return coords.map(roundCoords);
  }
  return coords;
}

for (const f of data.features) {
  f.geometry.coordinates = roundCoords(f.geometry.coordinates);
}

const roundedFile = path.join(__dirname, '../public/delhi_zones.geojson');
fs.writeFileSync(roundedFile, JSON.stringify(data), 'utf8');

console.log('Rounded coordinates successfully.');
