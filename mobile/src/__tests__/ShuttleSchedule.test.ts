import { computeNextDepartures, CampusKey } from "../data/ShuttleSchedule";

const monThu: Record<CampusKey, string[]> = {
  sgw: ["09:30", "10:00", "14:00", "15:00", "18:00"],
  loyola: ["09:15", "10:15", "14:15", "15:15", "18:15"],
};

const friday: Record<CampusKey, string[]> = {
  sgw: ["09:45", "10:15", "14:00"],
  loyola: ["09:15", "10:45", "14:30"],
};

// Helper to mock Date for deterministic tests
function withMockedDate(dateStr: string, fn: () => void) {
  const real = Date;
  const fixed = new real(dateStr);
  jest.useFakeTimers();
  jest.setSystemTime(fixed);
  try {
    fn();
  } finally {
    jest.useRealTimers();
  }
}

describe("computeNextDepartures", () => {
  it("returns upcoming departures after current time", () => {
    // Wednesday at 13:00
    withMockedDate("2026-02-11T13:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((d) => d.countdownMin > 0)).toBe(true);
    });
  });

  it("returns at most 4 departures", () => {
    // Wednesday at 08:00 — all 5 times are in the future
    withMockedDate("2026-02-11T08:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      expect(result.length).toBeLessThanOrEqual(4);
    });
  });

  it("returns empty array on weekends", () => {
    // Saturday
    withMockedDate("2026-02-14T10:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      expect(result).toEqual([]);
    });
  });

  it("uses friday schedule on fridays", () => {
    // Friday at 09:00
    withMockedDate("2026-02-13T09:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      // Friday SGW has 09:45 as first time, should appear
      expect(result[0].time).toBe("09:45");
    });
  });

  it("uses weekday schedule on mon-thu", () => {
    // Wednesday at 09:00
    withMockedDate("2026-02-11T09:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      expect(result[0].time).toBe("09:30");
    });
  });

  it("includes correct fields in each departure", () => {
    withMockedDate("2026-02-11T09:00:00", () => {
      const result = computeNextDepartures("loyola", "Loyola Chapel", monThu, friday);
      const d = result[0];
      expect(d).toHaveProperty("id");
      expect(d).toHaveProperty("time");
      expect(d).toHaveProperty("from", "Loyola Chapel");
      expect(d).toHaveProperty("eta");
      expect(d).toHaveProperty("countdownMin");
    });
  });

  it("returns empty when all departures have passed", () => {
    // Wednesday at 23:00
    withMockedDate("2026-02-11T23:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      expect(result).toEqual([]);
    });
  });

  it("calculates ETA as departure + 30 minutes", () => {
    withMockedDate("2026-02-11T09:00:00", () => {
      const result = computeNextDepartures("sgw", "Henry F. Hall", monThu, friday);
      // First departure is 09:30, ETA should be 10:00
      expect(result[0].eta).toBe("10:00 ETA");
    });
  });
});
