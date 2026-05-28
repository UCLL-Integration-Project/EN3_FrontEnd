import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserSignupForm from "./UserSignupForm";
import useAuth from "@hooks/useAuth";
import { signupRequest } from "@services/UserService";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

jest.mock("@hooks/useAuth");
jest.mock("@services/UserService");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("use-intl", () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(() => "en"),
}));

const mockLogin = jest.fn();
const mockReplace = jest.fn();

const fillValidForm = (overrides: Partial<Record<string, string>> = {}) => {
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: overrides.username ?? "tom" },
  });
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: overrides.firstName ?? "Tom" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: overrides.lastName ?? "Smith" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: overrides.email ?? "tom@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Age"), {
    target: { value: overrides.age ?? "30" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: overrides.password ?? "longenough" },
  });
};

describe("UserSignupForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useTranslations as jest.Mock).mockImplementation(() => (key: string) => {
      const translations: Record<string, string> = {
        title: "Sign up",
        subtitle: "Create your account",
        button: "Join",
        loginLink: "Already have an account?",
        success: "Welcome!",
        "label.username": "Username",
        "label.password": "Password",
        "label.firstName": "First name",
        "label.lastName": "Last name",
        "label.email": "Email",
        "label.age": "Age",
        "validate.error": "Required",
        "validate.weakPassword": "Password too short",
        "error.USERNAME_TAKEN": "That username is taken",
        "error.EMAIL_TAKEN": "That email is in use",
        "error.NETWORK_ERROR": "Network error",
        "error.UNKNOWN_ERROR": "Something went wrong",
      };
      return translations[key] ?? key;
    });
  });

  it("renders every form field", () => {
    render(<UserSignupForm />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });

  it("blocks submit and shows errors when fields are empty", async () => {
    render(<UserSignupForm />);
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getAllByText("Required").length).toBeGreaterThan(0);
    });
    expect(signupRequest).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("flags a password shorter than 8 characters", async () => {
    render(<UserSignupForm />);
    fillValidForm({ password: "short" });
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getByText("Password too short")).toBeInTheDocument();
    });
    expect(signupRequest).not.toHaveBeenCalled();
  });

  it("flags a malformed email", async () => {
    render(<UserSignupForm />);
    fillValidForm({ email: "not-an-email" });
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getAllByText("Required").length).toBeGreaterThan(0);
    });
    expect(signupRequest).not.toHaveBeenCalled();
  });

  it("calls signupRequest with the parsed payload and logs the user in on success", async () => {
    const created = {
      username: "tom",
      firstName: "Tom",
      lastName: "Smith",
      email: "tom@example.com",
      age: 30,
      password: "longenough",
    };
    (signupRequest as jest.Mock).mockResolvedValue(created);

    render(<UserSignupForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(signupRequest).toHaveBeenCalledWith({
        username: "tom",
        firstName: "Tom",
        lastName: "Smith",
        email: "tom@example.com",
        age: 30,
        password: "longenough",
      });
    });
    expect(mockLogin).toHaveBeenCalledWith(created);
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
  });

  it("renders the USERNAME_TAKEN error from the backend", async () => {
    (signupRequest as jest.Mock).mockRejectedValue(new Error("USERNAME_TAKEN"));

    render(<UserSignupForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getByText("That username is taken")).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("renders the EMAIL_TAKEN error from the backend", async () => {
    (signupRequest as jest.Mock).mockRejectedValue(new Error("EMAIL_TAKEN"));

    render(<UserSignupForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getByText("That email is in use")).toBeInTheDocument();
    });
  });

  it("falls back to a generic error message for unknown backend codes", async () => {
    (signupRequest as jest.Mock).mockRejectedValue(new Error("WEIRD_BACKEND_CODE"));

    render(<UserSignupForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
