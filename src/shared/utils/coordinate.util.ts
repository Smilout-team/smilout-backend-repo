export function parseCoordinates(
  coordinate: string
): { lat: number; lng: number } | null {
  try {
    const pointMatch = coordinate.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (pointMatch) {
      return {
        lng: parseFloat(pointMatch[1]),
        lat: parseFloat(pointMatch[2]),
      };
    }

    const parts = coordinate.split(',');
    if (parts.length === 2) {
      return {
        lat: parseFloat(parts[0].trim()),
        lng: parseFloat(parts[1].trim()),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
