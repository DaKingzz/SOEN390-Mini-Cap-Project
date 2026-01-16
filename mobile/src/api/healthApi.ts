import Constants from "expo-constants";

const API_BASE_URL =
  (Constants.expoConfig?.extra as any)?.API_BASE_URL;

/**
 * Simple backend connectivity test
 */
export async function getHealth(): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.text();
}
