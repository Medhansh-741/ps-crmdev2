// Pure (SSR-safe) helpers to turn a complaint `location` value — PostGIS EWKB
// hex, WKT POINT, GeoJSON, or {lat,lng} — into a {lat, lng} pair. Kept free of
// any Leaflet/browser imports so it can be used on the server and shared by both
// MapComponent and the CM geo layer.

export function parseEwkbHexPoint(hex: string): { lat: number; lng: number } | null {
  const normalized = hex.trim();
  if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length < 42) {
    return null;
  }

  try {
    const bytes = new Uint8Array(normalized.length / 2);
    for (let i = 0; i < normalized.length; i += 2) {
      bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
    }

    const view = new DataView(bytes.buffer);
    const littleEndian = view.getUint8(0) === 1;
    const typeWithFlags = view.getUint32(1, littleEndian);
    const hasSrid = (typeWithFlags & 0x20000000) !== 0;
    const geomType = typeWithFlags & 0x000000ff;

    if (geomType !== 1) {
      return null;
    }

    const coordOffset = hasSrid ? 9 : 5;
    if (bytes.byteLength < coordOffset + 16) {
      return null;
    }

    const lng = view.getFloat64(coordOffset, littleEndian);
    const lat = view.getFloat64(coordOffset + 8, littleEndian);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return { lat, lng };
  } catch {
    return null;
  }
}

export function parseLocationToLatLng(location: unknown): { lat: number; lng: number } | null {
  if (!location) return null;

  if (typeof location === "object") {
    const maybeObj = location as Record<string, unknown>;

    const coordinates = maybeObj.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const lng = Number(coordinates[0]);
      const lat = Number(coordinates[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }

    const latVal = maybeObj.lat ?? maybeObj.latitude;
    const lngVal = maybeObj.lng ?? maybeObj.lon ?? maybeObj.longitude;
    if (latVal !== undefined && lngVal !== undefined) {
      const lat = Number(latVal);
      const lng = Number(lngVal);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }

    const xVal = maybeObj.x;
    const yVal = maybeObj.y;
    if (xVal !== undefined && yVal !== undefined) {
      const lng = Number(xVal);
      const lat = Number(yVal);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  }

  if (typeof location === "string") {
    const ewkb = parseEwkbHexPoint(location);
    if (ewkb) {
      return ewkb;
    }

    const pointMatch = location.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (pointMatch) {
      const lng = Number(pointMatch[1]);
      const lat = Number(pointMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }

    const sridPointMatch = location.match(/SRID=\d+;\s*POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (sridPointMatch) {
      const lng = Number(sridPointMatch[1]);
      const lat = Number(sridPointMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }

    const tupleMatch = location.match(/^\s*\(?\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)?\s*$/);
    if (tupleMatch) {
      const first = Number(tupleMatch[1]);
      const second = Number(tupleMatch[2]);
      if (Number.isFinite(first) && Number.isFinite(second)) {
        const looksLikeLatLng = Math.abs(first) <= 90 && Math.abs(second) <= 180;
        const lat = looksLikeLatLng ? first : second;
        const lng = looksLikeLatLng ? second : first;
        return { lat, lng };
      }
    }

    try {
      const parsed = JSON.parse(location);
      return parseLocationToLatLng(parsed);
    } catch {
      return null;
    }
  }

  return null;
}
