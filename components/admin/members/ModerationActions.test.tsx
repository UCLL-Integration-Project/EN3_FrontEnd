import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ModerationActions from "./ModerationActions";
import { AdminMemberDetail } from "@types";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const activeMember: AdminMemberDetail = {
  id: 1,
  displayName: "Lina Verhoeven",
  username: "lina",
  email: "lina@ucll.be",
  bio: "hello",
  avatarUrl: "/a.png",
  moderationStatus: "ACTIVE",
  joinedAt: "2026-03-14T10:00:00Z",
  recentAudit: [],
};

describe("ModerationActions", () => {
  it("disables Reactivate for an active member, enables Suspend", () => {
    render(<ModerationActions member={activeMember} onAction={() => {}} />);
    expect(screen.getByRole("button", { name: /reactivate\.label/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /suspend\.label/ })).toBeEnabled();
  });

  it("disables Suspend for a suspended member, enables Reactivate", () => {
    render(
      <ModerationActions member={{ ...activeMember, moderationStatus: "SUSPENDED" }} onAction={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /suspend\.label/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /reactivate\.label/ })).toBeEnabled();
  });

  it("disables Clear bio when the bio is empty", () => {
    render(
      <ModerationActions member={{ ...activeMember, bio: null }} onAction={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /clearBio\.label/ })).toBeDisabled();
  });

  it("disables Clear picture when there is no avatar", () => {
    render(
      <ModerationActions member={{ ...activeMember, avatarUrl: null }} onAction={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /clearAvatar\.label/ })).toBeDisabled();
  });

  it("calls onAction with the clicked action", () => {
    const onAction = jest.fn();
    render(<ModerationActions member={activeMember} onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: /suspend\.label/ }));
    expect(onAction).toHaveBeenCalledWith("SUSPEND");
  });
});
