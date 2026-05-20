import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StatsView from "./StatsView";
import { getStatsRequest } from "@services/UserService";
import { useTranslations } from "use-intl";
import "@testing-library/jest-dom";

jest.mock("@services/UserService");
jest.mock("use-intl", () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(() => "en"),
}));

describe("StatsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const t: Record<string, string> = {
        connections: "Connections",
        timeActive: "Time Active",
        dataShared: "Data Shared",
        refresh: "Refresh",
        emptyTitle: "No activity yet",
        emptySubtitle: "Start connecting to see your stats here.",
        exploreConnections: "Explore connections",
        loadError: "Failed to load stats.",
      };
      return t[key] ?? key;
    });
  });

  it("renders all three stat metrics with data from the backend", async () => {
    (getStatsRequest as jest.Mock).mockResolvedValue({ connections: 5, timeActive: 90, dataShared: 3 });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Connections")).toBeInTheDocument();
      expect(screen.getByText("Data Shared")).toBeInTheDocument();
    });
  });

  it("formats timeActive as hours and minutes", async () => {
    (getStatsRequest as jest.Mock).mockResolvedValue({ connections: 1, timeActive: 125, dataShared: 2 });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("2h 5m")).toBeInTheDocument();
    });
  });

  it("formats timeActive as minutes only when under one hour", async () => {
    (getStatsRequest as jest.Mock).mockResolvedValue({ connections: 1, timeActive: 45, dataShared: 2 });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("45m")).toBeInTheDocument();
    });
  });

  it("shows empty state when backend returns null", async () => {
    (getStatsRequest as jest.Mock).mockResolvedValue(null);

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("No activity yet")).toBeInTheDocument();
      expect(screen.getByText("Explore connections")).toBeInTheDocument();
    });
  });

  it("re-fetches stats when the refresh button is clicked", async () => {
    (getStatsRequest as jest.Mock).mockResolvedValue({ connections: 5, timeActive: 90, dataShared: 3 });

    render(<StatsView />);

    await waitFor(() => expect(screen.getByText("Refresh")).toBeInTheDocument());

    (getStatsRequest as jest.Mock).mockResolvedValue({ connections: 6, timeActive: 120, dataShared: 4 });
    fireEvent.click(screen.getByText("Refresh"));

    await waitFor(() => {
      expect(getStatsRequest).toHaveBeenCalledTimes(2);
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  it("shows an error message when the request fails", async () => {
    (getStatsRequest as jest.Mock).mockRejectedValue(new Error("NETWORK_ERROR"));

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load stats.")).toBeInTheDocument();
    });
  });
});
