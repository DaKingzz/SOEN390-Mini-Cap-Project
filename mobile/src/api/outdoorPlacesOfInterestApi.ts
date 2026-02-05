import Constants from "expo-constants";

const API_BASE_URL =
  (Constants.expoConfig?.extra as any)?.API_BASE_URL;

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
}

export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  placeType: string
): Promise<NearbyPlace[]> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/places/outdoor` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&placeType=${placeType}`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const json = await response.json();

  return (json.places ?? []).map((p: any, index: number) => ({
    id: index.toString(),
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    location: p.location,
    rating: p.rating,
  }));
}
