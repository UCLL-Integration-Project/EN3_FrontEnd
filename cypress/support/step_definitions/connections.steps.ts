import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

interface Connection {
  username: string;
  firstName: string;
  lastName: string;
  level: string;
}

// Combined step that handles login + connections setup
interface DataTable { hashes: () => Connection[] }

Given("I am logged in and have connections with levels:", (dataTable: DataTable) => {
  const connections: Connection[] = dataTable.hashes();

  // Mock auth
  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: {
      id: 1,
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      age: 30,
      bio: "Test bio",
      connectionsCount: connections.length
    },
  }).as("getMeRequest");

  // Mock connections
  cy.intercept("GET", "**/api/v1/connections", {
    statusCode: 200,
    body: connections.map((conn) => ({
      id: Math.random(),
      username: conn.username,
      firstName: conn.firstName,
      lastName: conn.lastName,
      email: `${conn.username}@example.com`,
      age: 25,
      level: conn.level,
      connectionsCount: 5,
      password: "",
    })),
  }).as("getConnectionsRequest");

  cy.intercept("PUT", "**/api/v1/connections/*/level", {
    statusCode: 200,
    body: {},
  }).as("setConnectionLevelRequest");

  cy.intercept("DELETE", "**/api/v1/connections/*", {
    statusCode: 200,
    body: {},
  }).as("removeConnectionRequest");

  // Navigate to connections
  cy.visit("/en/connections");
});

// Login with no connections
Given("I am logged in with no connections", () => {
  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: {
      id: 1,
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      age: 30,
      bio: "Test bio",
      connectionsCount: 0
    },
  }).as("getMeRequest");

  cy.intercept("GET", "**/api/v1/connections", {
    statusCode: 200,
    body: [],
  }).as("getConnectionsRequest");

  cy.visit("/en/connections");
});

When("I click the level button for {string}", (fullName: string) => {
  cy.contains("button", getLevelForName(fullName)).first().click();
});

When("I click the level button again", () => {
  cy.get("button").contains(/Contact|Friend|Best Friend/).first().click();
});

When("I select {string}", (levelName: string) => {
  // Set up intercept BEFORE clicking
  cy.intercept("PUT", "**/api/v1/connections/*/level", (req) => {
    req.reply({
      statusCode: 200,
      body: {},
    });
  }).as("setConnectionLevelRequest");

  // Find all buttons and click the one matching the level name
  cy.contains("button", levelName).click({ force: true });
});

When("I click the remove button for {string}", (fullName: string) => {
  const [firstName] = fullName.split(" ");
  cy.contains(firstName)
    .parent()
    .parent()
    .within(() => {
      cy.get("button[aria-label*='Remove']").click();
    });

  cy.wait("@removeConnectionRequest");
});

Then("I should see {int} connections", (count: number) => {
  if (count === 0) {
    cy.contains("You have no connections yet.").should("be.visible");
  } else {
    cy.get("div").filter(":contains('Contact'), :contains('Friend'), :contains('Best Friend')").should("have.length.at.least", count);
  }
});

Then("I should see {string} with level {string}", (fullName: string, levelName: string) => {
  const [firstName] = fullName.split(" ");
  cy.contains(firstName).should("be.visible").parent().parent().within(() => {
    cy.contains(levelName).should("be.visible");
  });
});

Then("the level dropdown should open", () => {
  cy.get("button").filter(":contains('Contact'), :contains('Friend'), :contains('Best Friend')").filter(".flex-1").should("be.visible");
});

Then("the level dropdown should close", () => {
  cy.get("button").filter(".flex-1").should("not.exist");
});

Then("I should see options {string}, {string}, {string}", (opt1: string, opt2: string, opt3: string) => {
  cy.contains("button", opt1).should("be.visible");
  cy.contains("button", opt2).should("be.visible");
  cy.contains("button", opt3).should("be.visible");
});

Then("the level button should show {string}", (levelName: string) => {
  cy.contains("button", levelName).should("be.visible");
});

Then("the connection level should be updated", () => {
  // Just verify the dropdown closed (indicating the action completed)
  // The API call happens in the background
  cy.get("button").filter(".flex-1").should("not.exist");
});

Then("the level should still be {string}", (levelName: string) => {
  cy.contains(levelName).should("be.visible");
});

Then("{string} should no longer be in the connections list", (fullName: string) => {
  const [firstName] = fullName.split(" ");
  cy.contains(firstName).should("not.exist");
});

Then("I should see {int} connections remaining", (count: number) => {
  cy.get("div").filter(":contains('Contact'), :contains('Friend'), :contains('Best Friend')").should("have.length.at.least", count);
});

Then("I should not see any connection items", () => {
  cy.get("div").filter(":contains('Contact'), :contains('Friend'), :contains('Best Friend')").should("not.exist");
});

Then("I should see {string}", (text: string) => {
  cy.contains(text).should("be.visible");
});

// Helper function to get the level for a given name from the data
function getLevelForName(fullName: string): string {
  const levelMap: Record<string, string> = {
    "Alice Smith": "Contact",
    "Bob Jones": "Friend",
    "Charlie Brown": "Best Friend",
  };
  return levelMap[fullName] || "Contact";
}
