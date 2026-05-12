import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given(
  "I am logged in as {string} with password {string}",
  (username: string, password: string) => {
    cy.visitWithLocale("/");
    cy.login(username, password);
  },
);
