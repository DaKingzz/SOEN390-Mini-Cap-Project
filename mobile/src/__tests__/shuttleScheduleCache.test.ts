import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSchedule } from "../services/shuttleScheduleCache";
import * as api from "../api/shuttleScheduleApi";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("../api/shuttleScheduleApi");

const mockScheduleResponse: api.ShuttleScheduleResponse = {
  schedules: [
    { campus: "SGW", dayType: "weekday", departureTimes: ["09:30", "10:00"] },
    { campus: "LOY", dayType: "weekday", departureTimes: ["09:15", "10:15"] },
    { campus: "SGW", dayType: "friday", departureTimes: ["09:45"] },
    { campus: "LOY", dayType: "friday", departureTimes: ["09:15"] },
  ],
  version: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("shuttleScheduleCache", () => {
  it("fetches from API when no cache exists", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (api.getShuttleSchedule as jest.Mock).mockResolvedValue(mockScheduleResponse);

    const result = await getSchedule();

    expect(api.getShuttleSchedule).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(result.monThu.sgw).toEqual(["09:30", "10:00"]);
    expect(result.monThu.loyola).toEqual(["09:15", "10:15"]);
    expect(result.friday.sgw).toEqual(["09:45"]);
    expect(result.friday.loyola).toEqual(["09:15"]);
  });

  it("returns cached data when cache is fresh", async () => {
    const cached = {
      data: mockScheduleResponse,
      fetchedAt: Date.now() - 1000, // 1 second ago
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cached));

    const result = await getSchedule();

    expect(api.getShuttleSchedule).not.toHaveBeenCalled();
    expect(api.getShuttleVersion).not.toHaveBeenCalled();
    expect(result.monThu.sgw).toEqual(["09:30", "10:00"]);
  });

  it("checks version when cache is stale and returns cached if same version", async () => {
    const cached = {
      data: mockScheduleResponse,
      fetchedAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cached));
    (api.getShuttleVersion as jest.Mock).mockResolvedValue(1);

    const result = await getSchedule();

    expect(api.getShuttleVersion).toHaveBeenCalled();
    expect(api.getShuttleSchedule).not.toHaveBeenCalled();
    expect(result.monThu.sgw).toEqual(["09:30", "10:00"]);
    // Should refresh timestamp
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("fetches full schedule when version differs", async () => {
    const cached = {
      data: mockScheduleResponse,
      fetchedAt: Date.now() - 5 * 60 * 60 * 1000,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cached));
    (api.getShuttleVersion as jest.Mock).mockResolvedValue(2); // different version

    const updatedResponse = {
      ...mockScheduleResponse,
      version: 2,
      schedules: [
        ...mockScheduleResponse.schedules.map((s) =>
          s.campus === "SGW" && s.dayType === "weekday"
            ? { ...s, departureTimes: ["08:00", "09:00"] }
            : s
        ),
      ],
    };
    (api.getShuttleSchedule as jest.Mock).mockResolvedValue(updatedResponse);

    const result = await getSchedule();

    expect(api.getShuttleSchedule).toHaveBeenCalled();
    expect(result.monThu.sgw).toEqual(["08:00", "09:00"]);
  });

  it("falls back to full fetch when version check fails", async () => {
    const cached = {
      data: mockScheduleResponse,
      fetchedAt: Date.now() - 5 * 60 * 60 * 1000,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cached));
    (api.getShuttleVersion as jest.Mock).mockRejectedValue(new Error("network error"));
    (api.getShuttleSchedule as jest.Mock).mockResolvedValue(mockScheduleResponse);

    const result = await getSchedule();

    expect(api.getShuttleSchedule).toHaveBeenCalled();
    expect(result.monThu.sgw).toEqual(["09:30", "10:00"]);
  });
});
