import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/* /test-utils/reset-database (dev profile) seeds an admin user with
   admin@example.com / admin, now flagged Role.ADMIN. */
Given("the database is reset", () => {
  cy.task("resetDatabase");
});

Given("I am logged in as the admin", () => {
  cy.login("admin@example.com", "admin");
});

When("I open the admin members page", () => {
  cy.intercept("GET", "**/api/admin/members*").as("listMembers");
  cy.visitWithLocale("/admin/members");
  cy.wait("@listMembers");
});

When("I search the members list for {string}", (q: string) => {
  cy.intercept("GET", "**/api/admin/members*").as("searchMembers");
  cy.get('input[type="search"]').clear().type(q);
  cy.wait("@searchMembers");
});

Then("I should see {string} in the list", (name: string) => {
  cy.contains("li", name).should("be.visible");
});

Then("I should not see {string} in the list", (name: string) => {
  cy.contains("li", name).should("not.exist");
});
