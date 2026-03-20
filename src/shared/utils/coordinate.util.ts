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
      const first = parseFloat(parts[0].trim());
      const second = parseFloat(parts[1].trim());

      if (Number.isNaN(first) || Number.isNaN(second)) {
        return null;
      }

      if (Math.abs(first) <= 90 && Math.abs(second) <= 180) {
        return {
          lat: first,
          lng: second,
        };
      }

      if (Math.abs(second) <= 90 && Math.abs(first) <= 180) {
        return {
          lat: second,
          lng: first,
        };
      }

      return {
        lat: first,
        lng: second,
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
