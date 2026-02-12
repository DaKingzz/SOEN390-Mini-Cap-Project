import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import ShuttleScreen from "../screens/ShuttleScreen";
import * as cache from "../services/shuttleScheduleCache";
import type { DeparturesByDay } from "../services/shuttleScheduleCache";

jest.mock("../services/shuttleScheduleCache");

const mockSchedule: DeparturesByDay = {
  monThu: {
    sgw: ["09:30", "10:00", "14:00", "15:00", "18:00"],
    loyola: ["09:15", "10:15", "14:15", "15:15", "18:15"],
  },
  friday: {
    sgw: ["09:45", "10:15", "14:00"],
    loyola: ["09:15", "10:45", "14:30"],
  },
};

const mockOnDirections = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ShuttleScreen", () => {
  it("shows loading state initially", () => {
    (cache.getSchedule as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    render(<ShuttleScreen onDirections={mockOnDirections} />);

    expect(screen.getByText(/loading shuttle schedule/i)).toBeTruthy();
  });

  it("shows error state when fetch fails", async () => {
    (cache.getSchedule as jest.Mock).mockRejectedValue(new Error("fail"));

    render(<ShuttleScreen onDirections={mockOnDirections} />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load shuttle schedule/i)).toBeTruthy();
    });
  });

  it("renders schedule after successful fetch", async () => {
    (cache.getSchedule as jest.Mock).mockResolvedValue(mockSchedule);

    render(<ShuttleScreen onDirections={mockOnDirections} />);

    await waitFor(() => {
      expect(screen.getByText("Shuttle Schedule")).toBeTruthy();
    });
  });

  it("shows SGW departures by default", async () => {
    (cache.getSchedule as jest.Mock).mockResolvedValue(mockSchedule);

    render(<ShuttleScreen onDirections={mockOnDirections} />);

    await waitFor(() => {
      expect(screen.getByText("S.G.W Departures")).toBeTruthy();
      expect(screen.getByText("1455 Blvd. De Maisonneuve Ouest")).toBeTruthy();
    });
  });

  it("shows View Full Schedule button", async () => {
    (cache.getSchedule as jest.Mock).mockResolvedValue(mockSchedule);

    render(<ShuttleScreen onDirections={mockOnDirections} />);

    await waitFor(() => {
      expect(screen.getByText("View Full Schedule")).toBeTruthy();
    });
  });
});
