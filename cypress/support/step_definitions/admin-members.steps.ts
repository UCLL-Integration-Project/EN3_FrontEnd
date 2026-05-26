import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const MEMBERS_ALL = [
  {
    id: 2,
    displayName: "Jane Doe",
    handle: "@janedoe",
    email: "janedoe@example.com",
    status: "ACTIVE",
    joinedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    displayName: "John Smith",
    handle: "@johnsmith",
    email: "johnsmith@example.com",
    status: "ACTIVE",
    joinedAt: "2024-01-02T00:00:00Z",
  },
];

function makePage(content: typeof MEMBERS_ALL) {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

const JANE_DETAIL = {
  id: 2,
  displayName: "Jane Doe",
  username: "janedoe",
  email: "janedoe@example.com",
  bio: "Hello from Jane",
  status: "ACTIVE",
  joinedAt: "2024-01-01T00:00:00Z",
  lastSeenAt: null,
  recentAudit: [],
};

const JANE_SUSPENDED = {
  ...JANE_DETAIL,
  status: "SUSPENDED",
  recentAudit: [
    {
      id: 1,
      actorDisplayName: "Admin User",
      action: "SUSPEND",
      note: "repeated policy violations",
      createdAt: new Date().toISOString(),
    },
  ],
};

function filteredPage(url: string) {
  const searchParam = new URL(url).searchParams.get("search") ?? "";
  const filtered = searchParam
    ? MEMBERS_ALL.filter((m) =>
        m.displayName.toLowerCase().includes(searchParam.toLowerCase())
      )
    : MEMBERS_ALL;
  return makePage(filtered);
}

Given("the database is reset", () => {
  // No-op: tests use intercept mocks instead of a real database.
});

Given("I am logged in as the admin", () => {
  cy.setCookie("cw_session", "1");
  cy.setCookie("cw_admin", "1");
  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: {
      id: 1,
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "ADMIN",
    },
  }).as("getAdminProfile");
});

When("I open the admin members page", () => {
  cy.intercept("GET", "**/api/v1/admin/members*", (req) => {
    req.reply({ statusCode: 200, body: filteredPage(req.url) });
  }).as("listMembers");
  cy.visitWithLocale("/admin/members");
  cy.wait("@listMembers");
});

When("I search the members list for {string}", (q: string) => {
  cy.intercept("GET", "**/api/v1/admin/members*", (req) => {
    req.reply({ statusCode: 200, body: filteredPage(req.url) });
  }).as("searchMembers");
  cy.get('input[type="search"]').clear().type(q);
  cy.wait("@searchMembers");
});

Then("I should see {string} in the list", (name: string) => {
  cy.contains("li", name).should("be.visible");
});

Then("I should not see {string} in the list", (name: string) => {
  cy.contains("li", name).should("not.exist");
});

When("I open the member named {string}", (_name: string) => {
  cy.intercept("GET", "**/api/v1/admin/members/*", {
    statusCode: 200,
    body: JANE_DETAIL,
  }).as("getMember");
  cy.contains("li", _name).find("a").click();
  cy.wait("@getMember");
});

Then("I should land on the member detail page", () => {
  cy.location("pathname").should("match", /\/[a-z]{2}\/admin\/members\/\d+$/);
});

Then("I should see {string} on the detail page", (name: string) => {
  cy.contains("h3", name).should("be.visible");
});

When("I go back to the members list", () => {
  cy.intercept("GET", "**/api/v1/admin/members*", (req) => {
    req.reply({ statusCode: 200, body: filteredPage(req.url) });
  }).as("listAgain");
  cy.contains("a", /Back|Terug/).click();
  cy.wait("@listAgain");
});

Then("I should be on the members list", () => {
  cy.location("pathname").should("match", /\/[a-z]{2}\/admin\/members$/);
});

Then("the search should still be {string}", (q: string) => {
  cy.location("search").should("include", `search=${encodeURIComponent(q)}`);
  cy.get('input[type="search"]').should("have.value", q);
});

When("I suspend the member with note {string}", (note: string) => {
  cy.intercept("POST", "**/api/v1/admin/members/*/suspend", {
    statusCode: 200,
    body: JANE_SUSPENDED,
  }).as("suspend");
  cy.contains("button", "Suspend member").click();
  cy.get("textarea").type(note);
  cy.contains("button", /^Suspend$/).click();
  cy.wait("@suspend");
});

Then("the member status should be {string}", (status: string) => {
  cy.contains(status).should("exist");
});

Then("the audit log should show a {string} entry", (text: string) => {
  cy.contains("li", text).should("exist");
});
