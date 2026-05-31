import React from "react";
import { render, screen } from "@testing-library/react";
import MemberRow from "./MemberRow";
import { AdminMemberSummary } from "@types";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
  useLocale: () => "en",
  useFormatter: () => ({
    dateTime: (date: Date, opts?: Intl.DateTimeFormatOptions) =>
      date.toLocaleDateString("en-GB", opts),
  }),
}));

const member: AdminMemberSummary = {
  id: 1,
  displayName: "Lina Verhoeven",
  handle: "@lina",
  email: "lina.verhoeven@ucll.be",
  moderationStatus: "FLAGGED",
  joinedAt: "2026-03-14T10:00:00Z",
};

describe("MemberRow", () => {
  it("renders the member's name, email, status badge, and joined date", () => {
    render(<MemberRow member={member} />);

    expect(screen.getByText("Lina Verhoeven")).toBeInTheDocument();
    expect(screen.getByText("lina.verhoeven@ucll.be")).toBeInTheDocument();
    // FLAGGED badge label is mapped via next-intl mock
    expect(screen.getByText("admin.members.filter.flagged")).toBeInTheDocument();
    // Joined date formatted via Intl — either "14 Mar" or "Mar 14"
    // depending on the host's en-US default ordering.
    expect(screen.getByText(/Mar\s*14|14\s*Mar/i)).toBeInTheDocument();
  });

  it("falls back to initials when no avatar URL is supplied", () => {
    render(<MemberRow member={member} />);
    expect(screen.getByText("LV")).toBeInTheDocument();
  });
});
