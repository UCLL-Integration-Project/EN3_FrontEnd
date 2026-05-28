import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StatsView from "./StatsView";
import * as UserService from "@services/UserService";
import { useTranslations } from "use-intl";

jest.mock("use-intl", () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(() => "en"),
}));

jest.mock("@services/UserService");

describe("StatsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const translations: { [key: string]: string } = {
        connections: "Connections",
        timeActive: "Time Active",
        dataShared: "Data Shared",
        refresh: "Refresh",
        emptyTitle: "No activity yet",
        emptySubtitle: "Start connecting to see your stats here.",
        exploreConnections: "Explore connections",
        loadError: "Failed to load stats.",
      };
      return translations[key] || key;
    });
  });

  test("shows loading skeleton while fetching", () => {
    (UserService.getStatsRequest as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { getByTestId } = render(<StatsView />);
    expect(getByTestId("stats-loading")).toBeInTheDocument();
  });

  test("renders stat values when data is returned", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue({
      connections: 5,
      timeActive: 90,
      dataShared: 3,
    });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("1h 30m")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  test("renders empty state when 204 is returned", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue(null);

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByTestId("stats-empty")).toBeInTheDocument();
      expect(screen.getByText("No activity yet")).toBeInTheDocument();
    });
  });

  test("calls getStatsRequest again when refresh button is clicked", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue({
      connections: 5,
      timeActive: 90,
      dataShared: 3,
    });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTestId("stats-refresh");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(UserService.getStatsRequest).toHaveBeenCalledTimes(2);
    });
  });

  test("renders error message on fetch failure", async () => {
    (UserService.getStatsRequest as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load stats.")).toBeInTheDocument();
    });
  });

  test("formats time active correctly", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue({
      connections: 1,
      timeActive: 45,
      dataShared: 1,
    });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("45m")).toBeInTheDocument();
    });
  });

  test("formats time active with hours and minutes", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue({
      connections: 1,
      timeActive: 125,
      dataShared: 1,
    });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("2h 5m")).toBeInTheDocument();
    });
  });

  test("formats time active with just hours", async () => {
    (UserService.getStatsRequest as jest.Mock).mockResolvedValue({
      connections: 1,
      timeActive: 120,
      dataShared: 1,
    });

    render(<StatsView />);

    await waitFor(() => {
      expect(screen.getByText("2h")).toBeInTheDocument();
    });
  });
});
