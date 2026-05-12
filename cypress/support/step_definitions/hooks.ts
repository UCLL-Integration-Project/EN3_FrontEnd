import { After } from "@badeball/cypress-cucumber-preprocessor";

After(() => {
  cy.task("resetDatabase");
});
