import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I have no auth cookies", () => {
  cy.clearCookies();
});

Given("I have only the cw_session cookie", () => {
  cy.clearCookies();
  cy.setCookie("cw_session", "1", { path: "/" });
});

Given("I have the cw_session and cw_admin cookies", () => {
  cy.clearCookies();
  cy.setCookie("cw_session", "1", { path: "/" });
  cy.setCookie("cw_admin", "1", { path: "/" });
});

When("I navigate to the admin path {string}", (path: string) => {
  // failOnStatusCode: false — the admin route has no real page yet (story 2),
  // so an authorised admin can land on a 404. The guard's behaviour is the
  // only thing under test.
  cy.visit(path, { failOnStatusCode: false });
});

Then("I should land on the login page", () => {
  cy.location("pathname").should("match", /\/[a-z]{2}\/login$/);
});

Then("I should land on the forbidden page", () => {
  cy.location("pathname").should("match", /\/[a-z]{2}\/403$/);
});

Then("I should not land on the forbidden page", () => {
  cy.location("pathname").should("not.match", /\/[a-z]{2}\/403$/);
});

Then("I should see the forbidden eyebrow", () => {
  // "Error 403" / "Fout 403" — the eyebrow line on the translated page.
  cy.contains(/Error 403|Fout 403/).should("be.visible");
});
