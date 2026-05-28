import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForgetSheet } from "./ForgetSheet";
import { useTranslations } from "next-intl";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

const baseProps = {
  name: "Robert's Device",
  onConfirm: jest.fn(),
  onDismiss: jest.fn(),
};

describe("ForgetSheet Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockImplementation(() => (key: string, vars?: Record<string, string>) => {
      const translations: Record<string, string> = {
        "manage.forgetTitle": `Forget ${vars?.name ?? ""}?`,
        "manage.forgetBody": `Disconnect ${vars?.name ?? ""} and clear it from this app.`,
        "manage.forgetConfirm": "Forget device",
        "manage.forgetCancel": "Cancel",
        "manage.close": "Close",
        "manage.dismiss": "Dismiss",
      };
      return translations[key] ?? key;
    });
  });

  it("renders the title and body with the device name interpolated", () => {
    render(<ForgetSheet {...baseProps} />);
    expect(screen.getByText("Forget Robert's Device?")).toBeInTheDocument();
    expect(
      screen.getByText("Disconnect Robert's Device and clear it from this app.")
    ).toBeInTheDocument();
  });

  it("exposes itself as a modal dialog for assistive tech", () => {
    render(<ForgetSheet {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "forget-device-title");
  });

  it("calls onConfirm when the destructive button is pressed", () => {
    render(<ForgetSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Forget device" }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onDismiss).not.toHaveBeenCalled();
  });

  it("calls onDismiss when the Cancel button is pressed", () => {
    render(<ForgetSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(baseProps.onDismiss).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it("calls onDismiss when the close (X) icon is pressed", () => {
    render(<ForgetSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(baseProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when the backdrop is pressed", () => {
    render(<ForgetSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(baseProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
