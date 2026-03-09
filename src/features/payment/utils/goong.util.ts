import { BadRequestError } from '@/core/apiError.js';
import { config } from '@/config/index.js';
import { PAYMENT_MESSAGES } from '../payment.messages.js';

export async function reverseGeocodeWithGoong(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const mapKey = config.goong.mapKey;
  if (!mapKey) {
    return null;
  }

  const url = `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${mapKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      results?: Array<{ formatted_address?: string }>;
    };

    return data.results?.[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}

export async function searchAddressWithGoong(
  keyword: string,
  latitude: number,
  longitude: number
): Promise<
  Array<{
    placeId: string;
    name: string;
    address: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  }>
> {
  const mapKey = config.goong.mapKey;
  if (!mapKey) {
    throw new BadRequestError(PAYMENT_MESSAGES.DELIVERY_ADDRESS_LOOKUP_FAILED);
  }

  const url =
    `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(keyword)}` +
    `&location=${latitude},${longitude}&api_key=${mapKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestError(
        PAYMENT_MESSAGES.DELIVERY_ADDRESS_LOOKUP_FAILED
      );
    }

    const data = (await response.json()) as {
      predictions?: Array<{
        place_id?: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
        description?: string;
      }>;
    };

    const predictions = data.predictions ?? [];

    const detailedLocations = await Promise.all(
      predictions.slice(0, 6).map(async (prediction) => {
        const placeId =
          prediction.place_id ?? prediction.description ?? 'unknown';
        const location = await getPlaceDetailWithGoong(placeId, mapKey);

        return {
          placeId,
          name: prediction.structured_formatting?.main_text ?? 'Địa chỉ',
          address:
            prediction.structured_formatting?.secondary_text ??
            prediction.description ??
            'Không có mô tả',
          fullAddress:
            prediction.description ??
            [
              prediction.structured_formatting?.main_text,
              prediction.structured_formatting?.secondary_text,
            ]
              .filter(Boolean)
              .join(', '),
          latitude: location?.lat,
          longitude: location?.lng,
        };
      })
    );

    return detailedLocations;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    throw new BadRequestError(PAYMENT_MESSAGES.DELIVERY_ADDRESS_LOOKUP_FAILED);
  }
}

async function getPlaceDetailWithGoong(
  placeId: string,
  mapKey: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://rsapi.goong.io/Place/Detail?place_id=${encodeURIComponent(placeId)}&api_key=${mapKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      result?: {
        geometry?: {
          location?: {
            lat?: number;
            lng?: number;
          };
        };
      };
    };

    const lat = data.result?.geometry?.location?.lat;
    const lng = data.result?.geometry?.location?.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    return { lat, lng };
  } catch {
    return null;
  }
}
