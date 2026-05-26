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
      "title": "Connections",
      "listTitle": "My connections",
      "empty": "You have no connections yet.",
      "removeAriaLabel": `Remove connection with ${params?.name || "user"}`,
      "changeLevelAriaLabel": `Change connection level with ${params?.name || "user"}`,
      "error.UNKNOWN_ERROR": "Something went wrong. Please try again."
    };
    return translations[key] || key;
  }
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
    level: "CONTACT"
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
    level: "FRIEND"
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
    level: "BEST_FRIEND"
  }
];

describe("ConnectionsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: "currentUser" },
      isLoading: false,
      updateUser: mockUpdateUser
    });
  });

  it("renders connections title", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Connections")).toBeInTheDocument();
    });
  });

  it("displays all connections with their levels", async () => {
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

  it("displays empty state when no connections", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue([]);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("You have no connections yet.")).toBeInTheDocument();
    });
  });

  it("expands level dropdown when level button is clicked", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    const levelButtons = screen.getAllByRole("button").filter(btn =>
      btn.textContent?.includes("Contact") ||
      btn.textContent?.includes("Friend") ||
      btn.textContent?.includes("Best Friend")
    );

    fireEvent.click(levelButtons[0]);

    await waitFor(() => {
      const contactButton = screen.getAllByRole("button").find(btn => btn.textContent === "Contact" && btn.className.includes("flex-1"));
      expect(contactButton).toBeInTheDocument();
    });
  });

  it("collapses level dropdown when clicking again", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    const levelButtons = screen.getAllByRole("button").filter(btn =>
      btn.textContent?.includes("Contact")
    );

    fireEvent.click(levelButtons[0]);

    await waitFor(() => {
      const dropdownButtons = screen.getAllByRole("button").filter(btn =>
        btn.className.includes("flex-1")
      );
      expect(dropdownButtons.length).toBeGreaterThan(0);
    });

    fireEvent.click(levelButtons[0]);

    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("updates connection level when new level is selected", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    (UserService.setConnectionLevelRequest as jest.Mock).mockResolvedValue(undefined);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    const levelButtons = screen.getAllByRole("button").filter(btn =>
      btn.textContent?.includes("Contact")
    );

    fireEvent.click(levelButtons[0]);

    await waitFor(() => {
      const friendButton = screen.getAllByRole("button").find(btn => btn.textContent === "Friend" && btn.className.includes("flex-1"));
      expect(friendButton).toBeInTheDocument();
      fireEvent.click(friendButton!);
    });

    await waitFor(() => {
      expect(UserService.setConnectionLevelRequest).toHaveBeenCalledWith("user1", "FRIEND");
    });
  });

  it("displays formatted level names correctly", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Friend")).toBeInTheDocument();
      expect(screen.getByText("Best Friend")).toBeInTheDocument();
    });
  });

  it("removes connection when remove button is clicked", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);
    (UserService.removeConnectionRequest as jest.Mock).mockResolvedValue(undefined);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole("button").filter(btn =>
      btn.getAttribute("aria-label")?.includes("Remove connection")
    );

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(UserService.removeConnectionRequest).toHaveBeenCalledWith("user1");
    });
  });

  it("handles errors gracefully", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });
  });

  it("updates user connection count when fetched", async () => {
    (UserService.getConnectionsRequest as jest.Mock).mockResolvedValue(mockConnections);

    render(<ConnectionsView />);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ connectionsCount: 3 });
    });
  });

  // Authentication redirect is now handled by AuthGuard at the page level
  // (app/[locale]/connections/page.tsx), not inside ConnectionsView.
});
