import { After } from "@badeball/cypress-cucumber-preprocessor";

After({ tags: "@needs-db" }, () => {
  cy.task("resetDatabase");
});
