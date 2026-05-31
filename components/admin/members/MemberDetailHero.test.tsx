import React from "react";
import { render, screen } from "@testing-library/react";
import MemberDetailHero from "./MemberDetailHero";
import { AdminMemberDetail } from "@types";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
  useLocale: () => "en",
}));

const base: AdminMemberDetail = {
  id: 1,
  displayName: "Lina Verhoeven",
  username: "lina",
  email: "lina.verhoeven@ucll.be",
  bio: "Hello",
  moderationStatus: "FLAGGED",
  joinedAt: "2026-03-14T10:00:00Z",
  recentAudit: [],
};

describe("MemberDetailHero", () => {
  it("renders name, handle, and the status badge", () => {
    render(<MemberDetailHero member={base} />);
    expect(screen.getByText("Lina Verhoeven")).toBeInTheDocument();
    expect(screen.getByText("@lina")).toBeInTheDocument();
    expect(screen.getByText("admin.members.filter.flagged")).toBeInTheDocument();
  });

  it("renders initials when no avatar URL is set", () => {
    render(<MemberDetailHero member={base} />);
    expect(screen.getByText("LV")).toBeInTheDocument();
  });

  it("renders the avatar image when avatarUrl is set", () => {
    // alt="" makes the <img> role=presentation, so query by tag instead.
    const { container } = render(
      <MemberDetailHero member={{ ...base, avatarUrl: "/avatar.png" }} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/avatar.png");
  });
});
