import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string} with password {string}", (email: string, password: string) => {
  cy.login(email, password);
});
