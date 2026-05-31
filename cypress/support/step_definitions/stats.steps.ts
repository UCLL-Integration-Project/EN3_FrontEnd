import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am a logged-in stats user", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: {
      id: 1,
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      age: 30,
      bio: "",
      connectionsCount: 5,
    },
  }).as("getMeRequest");
});

Given(
  "my stats show {int} connections, {int} minutes active, and {int} data shared",
  (connections: number, timeActive: number, dataShared: number) => {
    cy.intercept("GET", "**/api/v1/users/me/stats", {
      statusCode: 200,
      body: { connections, timeActive, dataShared },
    }).as("getStats");
  }
);

Given("my stats are empty", () => {
  cy.intercept("GET", "**/api/v1/users/me/stats", {
    statusCode: 204,
    body: null,
  }).as("getStats");
});

Given("my stats update to {int} connections", (connections: number) => {
  cy.intercept("GET", "**/api/v1/users/me/stats", {
    statusCode: 200,
    body: { connections, timeActive: 120, dataShared: 4 },
  }).as("getStatsUpdated");
});

Then("I should see {string} as the connections stat", (value: string) => {
  cy.get("[data-stat='connections']").contains(value).should("be.visible");
});

Then("I should see {string} as the time active stat", (value: string) => {
  cy.get("[data-stat='timeActive']").contains(value).should("be.visible");
});

Then("I should see {string} as the data shared stat", (value: string) => {
  cy.get("[data-stat='dataShared']").contains(value).should("be.visible");
});

Then("I should see the stats empty state", () => {
  cy.get("[data-testid='stats-empty']").should("be.visible");
});

When("I click the stats refresh button", () => {
  cy.get("[data-testid='stats-refresh']").click();
});
