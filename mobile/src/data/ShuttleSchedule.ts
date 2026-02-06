export type CampusKey = "sgw" | "loyola";

export type DepartureComputed = {
  id: string;
  time: string;
  from: string;
  eta: string;
  countdownMin: number;
};

const SHUTTLE_TRIP_MINUTES = 30;
const NEXT_COUNT = 4;

function toMinutes24(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesTo24h(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function isFriday() {
  return new Date().getDay() === 5;
}
function isWeekend() {
  const d = new Date().getDay();
  return d === 0 || d === 6;
}

export function computeNextDepartures(
  campusKey: CampusKey,
  campusName: string,
  monThu: Record<CampusKey, string[]>,
  friday: Record<CampusKey, string[]>
): DepartureComputed[] {
  if (isWeekend()) return [];

  const todayTimes = isFriday()
    ? friday[campusKey] ?? []
    : monThu[campusKey] ?? [];

  const now = nowMinutes();

  return todayTimes
    .map((t) => ({ timeStr: t, depMin: toMinutes24(t) }))
    .filter((x) => x.depMin > now)
    .slice(0, NEXT_COUNT)
    .map((x, i) => ({
      id: `${campusKey}-${i}-${x.timeStr}`,
      time: x.timeStr,
      from: campusName,
      countdownMin: x.depMin - now,
      eta: `${minutesTo24h(x.depMin + SHUTTLE_TRIP_MINUTES)} ETA`,
    }));
}