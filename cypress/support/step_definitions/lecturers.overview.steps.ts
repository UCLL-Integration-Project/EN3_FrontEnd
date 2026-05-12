import {
  Given,
  When,
  Then,
  DataTable,
} from "@badeball/cypress-cucumber-preprocessor";

Given("I am an unauthenticated user", () => {
  cy.logout();
  cy.clearAllCookies();
});

When("I navigate to the lecturers page", () => {
  cy.visitWithLocale("/lecturers");
  cy.reload();
});

Then("I should see an unauthorized error message", () => {
  cy.contains("not authorized").should("be.visible");
});

Then("I should see a table with all lecturers", () => {
  cy.get("table").should("exist");
});

Then(
  "I should see the correct lecturers table data:",
  (dataTable: DataTable) => {
    const expectedRows = dataTable.hashes();

    cy.get("table tbody tr").should("have.length", expectedRows.length);

    cy.get("table tbody tr").each((row, index) => {
      cy.wrap(row).within(() => {
        cy.get("td").eq(0).should("have.text", expectedRows[index].firstname);
        cy.get("td").eq(1).should("have.text", expectedRows[index].lastname);
        cy.get("td").eq(2).should("have.text", expectedRows[index].email);
        cy.get("td").eq(3).should("have.text", expectedRows[index].expertise);
      });
    });
  },
);
