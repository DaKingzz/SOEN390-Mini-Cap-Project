import Constants from "expo-constants";

const API_BASE_URL =
  (Constants.expoConfig?.extra as any)?.API_BASE_URL;

export interface ShuttleSchedule {
  campus: string;
  dayType: string;
  departureTimes: string[];
}

export interface ShuttleScheduleResponse {
  schedules: ShuttleSchedule[];
  version: number;
}

export async function getShuttleSchedule(): Promise<ShuttleScheduleResponse> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const response = await fetch(`${API_BASE_URL}/api/shuttle/schedule`);

  if (!response.ok) {
    throw new Error(`Shuttle schedule API error: ${response.status}`);
  }

  return response.json();
}

export async function getShuttleVersion(): Promise<number> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const response = await fetch(`${API_BASE_URL}/api/shuttle/version`);

  if (!response.ok) {
    throw new Error(`Shuttle version API error: ${response.status}`);
  }

  const json = await response.json();
  return json.version;
}
