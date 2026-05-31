import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import * as UserService from "@services/UserService";
import ConnectionsView from "./ConnectionsView";
import { ConnectionDTO } from "@types";

jest.mock("next/navigation");
jest.mock("@hooks/useAuth");
jest.mock("@services/UserService");
jest.mock("use-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      title: "Connections",
      listTitle: "My connections",
      empty: "You have no connections yet.",
      emptyHint: "When you connect with someone, they'll show up here.",
      noMatches: "No connections match.",
      noMatchesHint: "Try adjusting your search or filters.",
      filterSort: "Filter & Sort",
      resetAll: "Reset all",
      searchPlaceholder: "Search by name or username",
      clearSearch: "Clear search",
      filterByLevel: "Filter by level",
      sortBy: "Sort by",
      removed: `Removed ${params?.name || "user"}.`,
      levelChanged: `${params?.name || "user"} is now ${params?.level || "level"}.`,
      removeAriaLabel: `Remove connection with ${params?.name || "user"}`,
      changeLevelAriaLabel: `Change connection level with ${params?.name || "user"}`,
      "error.UNKNOWN_ERROR": "Something went wrong. Please try again.",
    };
    return translations[key] ?? key;
  },
}));

const mockPush = jest.fn();
const mockUpdateUser = jest.fn();

const mockConnections: ConnectionDTO[] = [
  {
    id: 1,
    username: "user1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    age: 25,
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar1.jpg",
    bannerUrl: "https://example.com/banner1.jpg",
    connectionsCount: 5,
    password: "",
    level: "CONTACT",
  },
  {
    id: 2,
    username: "user2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    age: 26,
    bio: "Another bio",
    avatarUrl: "https://example.com/avatar2.jpg",
    bannerUrl: "https://example.com/banner2.jpg",
    connectionsCount: 3,
    password: "",
    level: "FRIEND",
  },
  {
    id: 3,
    username: "user3",
    firstName: "Bob",
    lastName: "Jones",
    email: "bob@example.com",
    age: 27,
    connectionsCount: 2,
    password: "",
    level: "BEST_FRIEND",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function openControls() {
  fireEvent.click(screen.getByRole("button", { name: /filter & sort/i }));
}

async function waitForConnections() {
  await waitFor(() => expect(screen.getByText("John Doe")).toBeInTheDocument());
}

// ─── setup ───────────────────────────────────────────────────────────────────

describe("ConnectionsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "currentUser" },
      isLoading: false,
      updateUser: mockUpdateUser,
    });
  });

  // ─── existing behaviour ───────────────────────────────────────────────────

  it("renders the page title", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitFor(() => expect(screen.getByText("Connections")).toBeInTheDocument());
  });

  it("displays all connections with their formatted levels", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Friend")).toBeInTheDocument();
      expect(screen.getByText("Best Friend")).toBeInTheDocument();
    });
  });

  it("shows the empty state when there are no connections", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue([]);
    render(<ConnectionsView />);
    await waitFor(() => expect(screen.getByText("You have no connections yet.")).toBeInTheDocument());
  });

  it("expands the level dropdown when the level button is clicked", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    const levelBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.getAttribute("aria-label")?.includes("Change connection level with user1"))!;
    fireEvent.click(levelBtn);

    await waitFor(() => {
      const dropdownBtns = screen.getAllByRole("button").filter((btn) => btn.className.includes("flex-1"));
      expect(dropdownBtns.length).toBeGreaterThan(0);
    });
  });

  it("collapses the level dropdown when clicking the level button again", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    const levelBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.getAttribute("aria-label")?.includes("Change connection level with user1"))!;

    fireEvent.click(levelBtn);
    await waitFor(() =>
      expect(screen.getAllByRole("button").some((btn) => btn.className.includes("flex-1"))).toBe(true),
    );

    fireEvent.click(levelBtn);
    await waitFor(() =>
      expect(screen.getAllByRole("button").filter((btn) => btn.className.includes("flex-1")).length).toBe(0),
    );
  });

  it("calls setConnectionLevelRequest with the correct arguments", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    (UserService.setConnectionLevelRequest as jest.Mock).mockResolvedValue(undefined);
    render(<ConnectionsView />);
    await waitForConnections();

    const levelBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.getAttribute("aria-label")?.includes("Change connection level with user1"))!;
    fireEvent.click(levelBtn);

    const friendBtn = await screen
      .findAllByRole("button")
      .then((btns) => btns.find((btn) => btn.textContent === "Friend" && btn.className.includes("flex-1")));
    fireEvent.click(friendBtn!);

    await waitFor(() => expect(UserService.setConnectionLevelRequest).toHaveBeenCalledWith("user1", "FRIEND"));
  });

  it("calls removeConnectionRequest with the correct username", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    (UserService.removeConnectionRequest as jest.Mock).mockResolvedValue(undefined);
    render(<ConnectionsView />);
    await waitForConnections();

    const removeBtn = screen.getByRole("button", { name: /remove connection with user1/i });
    fireEvent.click(removeBtn);

    await waitFor(() => expect(UserService.removeConnectionRequest).toHaveBeenCalledWith("user1"));
  });

  it("removes the connection from the list after removal", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    (UserService.removeConnectionRequest as jest.Mock).mockResolvedValue(undefined);
    render(<ConnectionsView />);
    await waitForConnections();

    fireEvent.click(screen.getByRole("button", { name: /remove connection with user1/i }));

    await waitFor(() => expect(screen.queryByText("John Doe")).not.toBeInTheDocument());
  });

  it("shows an error message when fetching connections fails", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockRejectedValue(new Error("Network error"));
    render(<ConnectionsView />);
    await waitFor(() => expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument());
  });

  it("updates the user connection count after fetch", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ connectionsCount: 3 }));
  });

  // ─── filter & sort controls visibility ───────────────────────────────────

  it("does not show the controls panel before it is toggled open", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    expect(screen.queryByPlaceholderText("Search by name or username")).not.toBeInTheDocument();
  });

  it("shows the controls panel after clicking 'Filter & Sort'", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    openControls();

    expect(screen.getByPlaceholderText("Search by name or username")).toBeInTheDocument();
  });

  it("hides the controls panel when toggled closed again", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    openControls();
    openControls();

    expect(screen.queryByPlaceholderText("Search by name or username")).not.toBeInTheDocument();
  });

  it("does not show the 'Filter & Sort' button when there are no connections", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue([]);
    render(<ConnectionsView />);
    await waitFor(() => expect(screen.getByText("You have no connections yet.")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /filter & sort/i })).not.toBeInTheDocument();
  });

  // ─── search filtering ────────────────────────────────────────────────────

  it("filters connections by first name", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "john" },
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("filters connections by username", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "user2" },
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("is case-insensitive when searching", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "JANE" },
    });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("shows the filtered empty state when search matches nothing", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "zzznomatch" },
    });

    expect(screen.getByText("No connections match.")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("clears the search when the inline clear button is clicked", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "john" },
    });
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  // ─── level filtering ──────────────────────────────────────────────────────

  it("filters by FRIEND level", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    // "Friend" pill inside the level group (aria-label = "Filter by level")
    const levelGroup = screen.getByRole("group", { name: /filter by level/i });
    fireEvent.click(screen.getByRole("button", { name: "Friend", hidden: false }));
    expect(levelGroup).toBeInTheDocument(); // group is rendered

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("filters by BEST_FRIEND level", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Best Friend" }));

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("restores all connections when 'All' level pill is selected", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  // ─── combined search + level filter ──────────────────────────────────────

  it("combines search and level filter", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));
    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "jane" },
    });

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("shows filtered empty state when combined filters match nothing", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));
    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "bob" },
    });

    expect(screen.getByText("No connections match.")).toBeInTheDocument();
  });

  // ─── sort ─────────────────────────────────────────────────────────────────

  it("sorts connections by name A–Z by default", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    const names = screen.getAllByText(/^(John Doe|Jane Smith|Bob Jones)$/);
    expect(names[0].textContent).toBe("Bob Jones");
    expect(names[1].textContent).toBe("Jane Smith");
    expect(names[2].textContent).toBe("John Doe");
  });

  it("reverses name order when Name sort is clicked a second time", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    // First click → already asc, second click → desc
    const nameBtn = screen.getByRole("button", { name: /^name/i });
    fireEvent.click(nameBtn); // toggle to desc

    const names = screen.getAllByText(/^(John Doe|Jane Smith|Bob Jones)$/);
    expect(names[0].textContent).toBe("John Doe");
    expect(names[1].textContent).toBe("Jane Smith");
    expect(names[2].textContent).toBe("Bob Jones");
  });

  // ─── active filter badge ──────────────────────────────────────────────────

  it("shows an active filter badge when a filter is applied", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    expect(screen.queryByText("1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows badge count 2 when both search and level filter are active", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));
    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "jane" },
    });

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // ─── reset ────────────────────────────────────────────────────────────────

  it("does not show 'Reset all' when no filters are active", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    expect(screen.queryByRole("button", { name: /reset all/i })).not.toBeInTheDocument();
  });

  it("shows 'Reset all' when a filter is active", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));

    expect(screen.getByRole("button", { name: /reset all/i })).toBeInTheDocument();
  });

  it("clears all filters and restores the full list when 'Reset all' is clicked", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));
    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "jane" },
    });
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset all/i }));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("clears all filters from the filtered empty state 'Reset all' button", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.change(screen.getByPlaceholderText("Search by name or username"), {
      target: { value: "zzznomatch" },
    });
    expect(screen.getByText("No connections match.")).toBeInTheDocument();

    // The reset button inside the empty state
    const resetBtns = screen.getAllByRole("button", { name: /reset all/i });
    fireEvent.click(resetBtns[resetBtns.length - 1]);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  // ─── result count hint ────────────────────────────────────────────────────

  it("shows a filtered count hint when a filter is active", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();
    openControls();

    fireEvent.click(screen.getByRole("button", { name: "Friend" }));

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("does not show a count hint when no filters are active", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    render(<ConnectionsView />);
    await waitForConnections();

    expect(screen.queryByText(/\/ 3/)).not.toBeInTheDocument();
  });
});
