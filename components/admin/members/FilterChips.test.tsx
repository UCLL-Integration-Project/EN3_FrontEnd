import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterChips from "./FilterChips";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("FilterChips", () => {
  it("renders all four options with the active one aria-checked", () => {
    render(<FilterChips value="ACTIVE" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    const active = screen.getByRole("radio", { name: "active" });
    expect(active).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with the clicked value", () => {
    const onChange = jest.fn();
    render(<FilterChips value="ALL" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "flagged" }));
    expect(onChange).toHaveBeenCalledWith("FLAGGED");

    fireEvent.click(screen.getByRole("radio", { name: "suspended" }));
    expect(onChange).toHaveBeenCalledWith("SUSPENDED");
  });
});
