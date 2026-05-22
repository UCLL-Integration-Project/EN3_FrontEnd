import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmSheet from "./ConfirmSheet";
import "@testing-library/jest-dom";

const baseProps = {
  open: true,
  onClose: jest.fn(),
  title: "Suspend Lina Verhoeven?",
  message: "They won't be able to sign in.",
  confirmLabel: "Suspend",
  cancelLabel: "Cancel",
  notePlaceholder: "Add a note",
  onConfirm: jest.fn(),
};

describe("ConfirmSheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the title and message", () => {
    render(<ConfirmSheet {...baseProps} />);
    expect(screen.getByText("Suspend Lina Verhoeven?")).toBeInTheDocument();
    expect(screen.getByText("They won't be able to sign in.")).toBeInTheDocument();
  });

  it("calls onConfirm with the typed note", () => {
    render(<ConfirmSheet {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("Add a note"), {
      target: { value: "repeated spam" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
    expect(baseProps.onConfirm).toHaveBeenCalledWith("repeated spam");
  });

  it("calls onConfirm with an empty string when no note is typed", () => {
    render(<ConfirmSheet {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
    expect(baseProps.onConfirm).toHaveBeenCalledWith("");
  });

  it("renders a translated error when provided", () => {
    render(<ConfirmSheet {...baseProps} error="This member is already suspended." />);
    expect(screen.getByRole("alert")).toHaveTextContent("This member is already suspended.");
  });

  it("disables both buttons while loading", () => {
    render(<ConfirmSheet {...baseProps} loading />);
    expect(screen.getByRole("button", { name: "Suspend" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
