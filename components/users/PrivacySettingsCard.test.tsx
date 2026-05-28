import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PrivacySettingsCard from "./PrivacySettingsCard";
import useAuth from "@hooks/useAuth";
import { updatePrivacyRequest } from "@services/UserService";
import { useTranslations } from "next-intl";
import "@testing-library/jest-dom";

jest.mock("@hooks/useAuth");
jest.mock("@services/UserService");
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

describe("PrivacySettingsCard", () => {
  const mockUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { shareActivity: false, shareConnectionCount: false, shareExtendedProfile: true },
      updateUser: mockUpdateUser,
    });
    (useTranslations as jest.Mock).mockImplementation(() => (key: string) => {
      const translations: Record<string, string> = {
        "title": "Data sharing",
        "shareActivity.label": "Share activity",
        "shareActivity.hint": "Let visitors see your recent activity",
        "shareConnectionCount.label": "Share connection count",
        "shareConnectionCount.hint": "Let visitors see how many connections you have",
        "shareExtendedProfile.label": "Share extended profile",
        "shareExtendedProfile.hint": "Let visitors see your location, website, and interests",
      };
      return translations[key] ?? key;
    });
  });

  it("renders toggles reflecting current user privacy settings", () => {
    render(<PrivacySettingsCard />);

    expect(screen.getByTestId("share-activity-toggle")).not.toBeChecked();
    expect(screen.getByTestId("share-connection-count-toggle")).not.toBeChecked();
    expect(screen.getByTestId("share-extended-profile-toggle")).toBeChecked();
  });

  it("renders checked when user has preferences enabled", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { shareActivity: true, shareConnectionCount: true, shareExtendedProfile: true },
      updateUser: mockUpdateUser,
    });

    render(<PrivacySettingsCard />);

    expect(screen.getByTestId("share-activity-toggle")).toBeChecked();
    expect(screen.getByTestId("share-connection-count-toggle")).toBeChecked();
    expect(screen.getByTestId("share-extended-profile-toggle")).toBeChecked();
  });

  it("calls updatePrivacyRequest with correct payload when share activity is toggled", async () => {
    (updatePrivacyRequest as jest.Mock).mockResolvedValue({});

    render(<PrivacySettingsCard />);

    fireEvent.click(screen.getByTestId("share-activity-toggle"));

    await waitFor(() => {
      expect(updatePrivacyRequest).toHaveBeenCalledWith({
        shareActivity: true,
        shareConnectionCount: false,
        shareExtendedProfile: true,
      });
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      shareActivity: true,
      shareConnectionCount: false,
      shareExtendedProfile: true,
    });
  });

  it("reverts toggle to previous state when API call fails", async () => {
    (updatePrivacyRequest as jest.Mock).mockRejectedValue(new Error("NETWORK_ERROR"));

    render(<PrivacySettingsCard />);

    const toggle = screen.getByTestId("share-activity-toggle");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toggle).not.toBeChecked();
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
