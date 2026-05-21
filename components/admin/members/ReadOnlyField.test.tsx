import React from "react";
import { render, screen } from "@testing-library/react";
import ReadOnlyField from "./ReadOnlyField";
import "@testing-library/jest-dom";

describe("ReadOnlyField", () => {
  it("renders the label and value", () => {
    render(<ReadOnlyField label="Display" value="Lina Verhoeven" />);
    expect(screen.getByText("Display")).toBeInTheDocument();
    expect(screen.getByText("Lina Verhoeven")).toBeInTheDocument();
  });

  it("falls back to the em-dash placeholder for null", () => {
    render(<ReadOnlyField label="Bio" value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("falls back to the em-dash placeholder for empty string", () => {
    render(<ReadOnlyField label="Bio" value="" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("respects a custom placeholder", () => {
    render(<ReadOnlyField label="Last seen" value={null} placeholder="Never" />);
    expect(screen.getByText("Never")).toBeInTheDocument();
  });
});
