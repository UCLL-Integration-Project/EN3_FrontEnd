import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I selected the schedule for {string}", (courseName: string) => {
  cy.visitWithLocale("/schedule");

  cy.contains("tr", courseName).click();

  cy.contains("h2", "Students").should("be.visible");
});

Given("the selected schedule has {int} enrolled student", (count: number) => {
  cy.contains("tr", "Full-stack development")
    .find("td")
    .eq(4)
    .should("contain", count.toString());
});

When("I enroll student {string}", (studentName: string) => {
  const [firstName, lastName] = studentName.split(" ");

  cy.intercept("POST", "**/schedules/enroll").as("enrollStudent");
  cy.intercept("GET", "**/schedules").as("getSchedulesAfterEnroll");

  cy.contains("tr", firstName)
    .should("contain", lastName)
    .contains("button", "Enroll")
    .click();

  cy.wait("@enrollStudent").its("response.statusCode").should("eq", 204);
  cy.wait("@getSchedulesAfterEnroll");
});

Then("the selected schedule should have {int} enrolled student", (count: number) => {
  cy.contains("tr", "Full-stack development")
    .find("td")
    .eq(4)
    .should("contain", count.toString());
});

Then("the selected schedule should have {int} enrolled students", (count: number) => {
  cy.contains("tr", "Full-stack development")
    .find("td")
    .eq(4)
    .should("contain", count.toString());
});

Then(
  "student {string} should no longer be available for enrollment",
  (studentName: string) => {
    const [firstName, lastName] = studentName.split(" ");

    cy.contains("tr", firstName)
      .should("contain", lastName)
      .contains("button", "Enroll")
      .should("not.exist");
  },
);