import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

const MOCK_USER = {
  id: 1,
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  age: 25,
};

const MOCK_ADMIN = {
  ...MOCK_USER,
  username: "admin",
  firstName: "Admin",
  role: "ADMIN",
};

Given("I visit the home page as a guest", () => {
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 401, body: {} }).as("getMeHome");
  cy.visit("/en");
});

Given("I visit the home page as a logged-in user", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeHome");
  cy.visit("/en");
  cy.wait("@getMeHome");
});

Given("I visit the home page as a logged-in admin", () => {
  cy.setCookie("cw_session", "1");
  cy.setCookie("cw_admin", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_ADMIN }).as("getMeHome");
  cy.visit("/en");
  cy.wait("@getMeHome");
});

Then("I should see the {string} call to action", (text: string) => {
  cy.contains(text).should("be.visible");
});

Then("I should see the {string} link", (text: string) => {
  cy.contains(text).should("be.visible");
});

Then("I should see the home screen navigation items", () => {
  cy.contains("Profile").should("exist");
  cy.contains("Connections").should("exist");
  cy.contains("Settings").should("exist");
});

Then("I should see the sign-out button", () => {
  cy.contains("Sign out").should("exist");
});

Then("I should see the admin navigation item", () => {
  cy.contains("Admin").should("exist");
});
