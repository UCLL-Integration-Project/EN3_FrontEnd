import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string} with password {string}", (email: string, password: string) => {
  cy.login(email, password);
});

Then("I should be redirected to the login page", () => {
  cy.url({ timeout: 5000 }).should("include", "/login");
});
