import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const MOCK_USER = {
  id: 1,
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
  email: "user@example.com",
  age: 25,
};

Given("I am a visitor on the login page", () => {
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 401, body: {} }).as("getMeLogin");
  cy.visitWithLocale("/login");
  cy.get("#emailInput").should("exist");
});

Given("I visit the login page while already logged in", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeLogin");
  cy.visitWithLocale("/login");
});

Then("I should see the login form", () => {
  cy.get("#emailInput").should("exist");
  cy.get("#passwordInput").should("exist");
  cy.contains("button", "Login").should("exist");
});

When("I submit the empty login form", () => {
  cy.contains("button", "Login").click();
});

Then("I should see login validation errors", () => {
  cy.get(".field-error").contains("Required").should("exist");
});

When("I log in with email {string} and password {string}", (email: string, password: string) => {
  const isValid = password !== "wrongpass";
  cy.intercept(
    "POST",
    "**/api/v1/auth/login",
    isValid
      ? { statusCode: 200, body: MOCK_USER }
      : { statusCode: 401, body: { errors: [{ code: "INVALID_CREDENTIALS" }] } }
  ).as("loginRequest");
  cy.get("#emailInput").type(email);
  cy.get("#passwordInput").type(password);
  cy.contains("button", "Login").click();
  cy.wait("@loginRequest");
});

Then("I should see an invalid credentials error", () => {
  cy.contains("Invalid email or password.").should("exist");
});

Then("I should see the login success message", () => {
  cy.url({ timeout: 5000 }).should("not.include", "/login");
});

Then("I should be redirected away from login", () => {
  cy.url({ timeout: 5000 }).should("not.include", "/login");
});
