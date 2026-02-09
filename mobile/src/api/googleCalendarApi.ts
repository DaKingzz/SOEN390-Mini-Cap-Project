import Constants from "expo-constants";

type CalendarSelectionPayload = {
  id: string;
  summary?: string;
  primary?: boolean;
};

const API_BASE_URL = (Constants.expoConfig?.extra as any)?.API_BASE_URL;

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is missing (check .env + app.config.ts)");
  }
  return API_BASE_URL;
}

function googleFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${requireApiBaseUrl()}${path}`, {
    ...(init ?? {}),
    credentials: "include",
  });
}

export function requestGoogleOAuthExchange(serverAuthCode: string): Promise<Response> {
  return googleFetch("/api/google/oauth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serverAuthCode }),
  });
}

export function requestGoogleState(includeCalendars = false): Promise<Response> {
  const path = `/api/google/state?days=7&timeZone=${encodeURIComponent("America/Montreal")}&includeCalendars=${includeCalendars}`;
  return googleFetch(path);
}

export function requestGoogleCalendars(): Promise<Response> {
  return googleFetch("/api/google/calendars");
}

export function requestSetGoogleSelectedCalendar(
  calendar: CalendarSelectionPayload
): Promise<Response> {
  return googleFetch("/api/google/selected-calendar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: calendar.id,
      summary: calendar.summary,
      primary: !!calendar.primary,
    }),
  });
}

export function requestGoogleLogout(): Promise<Response> {
  return googleFetch("/api/google/oauth/logout", { method: "POST" });
}
