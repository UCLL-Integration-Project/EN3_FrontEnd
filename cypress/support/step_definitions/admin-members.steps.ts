import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/* /api/v1/test-utils/reset-database (dev profile) seeds: Admin User (admin/admin,
   ADMIN), Jane Doe (janedoe, USER, has a bio) and John Smith (johnsmith,
   USER). */
Given("the database is reset", () => {
  cy.task("resetDatabase");
});

Given("I am logged in as the admin", () => {
  cy.login("admin@example.com", "admin");
});

When("I open the admin members page", () => {
  cy.intercept("GET", "**/api/v1/admin/members*").as("listMembers");
  cy.visitWithLocale("/admin/members");
  cy.wait("@listMembers");
});

When("I search the members list for {string}", (q: string) => {
  cy.intercept("GET", "**/api/v1/admin/members*").as("searchMembers");
  cy.get('input[type="search"]').clear().type(q);
  cy.wait("@searchMembers");
});

Then("I should see {string} in the list", (name: string) => {
  cy.contains("li", name).should("be.visible");
});

Then("I should not see {string} in the list", (name: string) => {
  cy.contains("li", name).should("not.exist");
});

When("I open the member named {string}", (name: string) => {
  cy.intercept("GET", "**/api/v1/admin/members/*").as("getMember");
  cy.contains("li", name).find("a").click();
  cy.wait("@getMember");
});

Then("I should land on the member detail page", () => {
  cy.location("pathname").should("match", /\/[a-z]{2}\/admin\/members\/\d+$/);
});

Then("I should see {string} on the detail page", (name: string) => {
  cy.contains("h3", name).should("be.visible");
});

When("I go back to the members list", () => {
  cy.intercept("GET", "**/api/v1/admin/members*").as("listAgain");
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
  cy.intercept("POST", "**/api/v1/admin/members/*/suspend").as("suspend");
  // The moderation action button ("Suspend member") opens the confirm sheet.
  cy.contains("button", "Suspend member").click();
  cy.get("textarea").type(note);
  // The confirm sheet's button is the bare action verb ("Suspend").
  cy.contains("button", /^Suspend$/).click();
  cy.wait("@suspend");
});

Then("the member status should be {string}", (status: string) => {
  cy.contains(status).should("be.visible");
});

Then("the audit log should show a {string} entry", (text: string) => {
  cy.contains("li", text).should("be.visible");
});
