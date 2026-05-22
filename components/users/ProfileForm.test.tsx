import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileForm from "./ProfileForm";
import useAuth from "@hooks/useAuth";
import { updateProfileRequest } from "@services/UserService";
import { useTranslations } from "use-intl";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@hooks/useAuth");
jest.mock("@services/UserService");
jest.mock("use-intl", () => ({
  useTranslations: jest.fn(),
}));

describe("ProfileForm Component", () => {
  const mockUpdateUser = jest.fn();
  const mockInitialProfile = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    username: "johndoe",
    age: 30,
    bio: "Original bio",
    avatarUrl: "http://avatar.com",
    bannerUrl: "http://banner.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      updateUser: mockUpdateUser,
    });
    
    // Simple mock for translation
    (useTranslations as jest.Mock).mockImplementation((namespace: string) => (key: string) => {
      const translations: Record<string, string> = {
        "label.firstName": "First Name",
        "label.lastName": "Last Name",
        "label.email": "Email",
        "label.username": "Username",
        "label.age": "Age",
        "saveButton": "Save",
        "profileSuccess": "Success",
        "validate.error": "Required",
        "cancelButton": "Cancel",
      };
      const socialTranslations: Record<string, string> = {
        "publicProfile": "Public Profile",
        "accountDetails": "Account Details",
        "about": "Bio",
        "avatarUrl": "Avatar URL",
        "bannerUrl": "Banner URL",
        "bioPlaceholder": "Tell us about yourself...",
      };
      if (namespace === "social") return socialTranslations[key] || key;
      return translations[key] || key;
    });
  });

  it("renders with initial profile data", () => {
    render(<ProfileForm initialProfile={mockInitialProfile} />);
    
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("johndoe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original bio")).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<ProfileForm initialProfile={{ firstName: "", lastName: "", email: "", username: "", age: 0, bio: "", avatarUrl: "", bannerUrl: "" }} />);
    
    fireEvent.click(screen.getByText("Save"));
    
    await waitFor(() => {
      const errors = screen.getAllByText("Required");
      expect(errors.length).toBeGreaterThan(0);
    });
    
    expect(updateProfileRequest).not.toHaveBeenCalled();
  });

  it("calls updateProfileRequest and updateUser on successful submit", async () => {
    (updateProfileRequest as jest.Mock).mockResolvedValue({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      username: "janesmith",
      age: 25,
      bio: "New bio",
      avatarUrl: "http://new.com",
      bannerUrl: "http://banner-new.com"
    });

    render(<ProfileForm initialProfile={mockInitialProfile} />);
    
    const bioInput = screen.getByLabelText("Bio");
    fireEvent.change(bioInput, { target: { value: "New bio" } });
    
    fireEvent.click(screen.getByText("Save"));
    
    await waitFor(() => {
      expect(updateProfileRequest).toHaveBeenCalledWith({
        ...mockInitialProfile,
        bio: "New bio",
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        username: "janesmith",
        age: 25,
        bio: "New bio",
        avatarUrl: "http://new.com",
        bannerUrl: "http://banner-new.com"
      });
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
  });

  it("displays an error message when API call fails", async () => {
    (updateProfileRequest as jest.Mock).mockRejectedValue(new Error("EMAIL_TAKEN"));

    render(<ProfileForm initialProfile={mockInitialProfile} />);
    
    fireEvent.click(screen.getByText("Save"));
    
    await waitFor(() => {
      expect(screen.getByText("error.EMAIL_TAKEN")).toBeInTheDocument();
    });
  });
});
