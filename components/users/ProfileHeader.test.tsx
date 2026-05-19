import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileHeader from "./ProfileHeader";
import { connectRequest } from "@services/UserService";
import { useTranslations } from "use-intl";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@services/UserService");
jest.mock("use-intl", () => ({
  useTranslations: jest.fn(),
}));

describe("ProfileHeader Component", () => {
  const mockUser = {
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    connectionsCount: 5,
    bio: "Test bio",
    avatarUrl: "",
    bannerUrl: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        "editProfile": "Edit Profile",
        "connect": "Connect",
        "connected": "Connected",
        "connections": "Connections",
        "activity": "Activity",
      };
      return translations[key] || key;
    });
  });

  it("renders user information correctly", () => {
    render(<ProfileHeader user={mockUser} isOwnProfile={true} />);
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Connections")).toBeInTheDocument();
  });

  it("shows Edit Profile button for own profile", () => {
    const mockOnEdit = jest.fn();
    render(<ProfileHeader user={mockUser} isOwnProfile={true} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByText("Edit Profile");
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("shows Connect button for other profiles and handles connection", async () => {
    (connectRequest as jest.Mock).mockResolvedValue({});
    render(<ProfileHeader user={mockUser} isOwnProfile={false} />);
    
    const connectButton = screen.getByText("Connect");
    expect(connectButton).toBeInTheDocument();
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(connectRequest).toHaveBeenCalledWith("johndoe");
      expect(screen.getByText("Connected")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument(); // Count incremented locally
    });
  });

  it("renders fallback avatar when no avatarUrl is provided", () => {
    render(<ProfileHeader user={mockUser} isOwnProfile={true} />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
