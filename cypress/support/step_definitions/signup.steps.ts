import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const MOCK_USER = {
  id: 1,
  username: "newuser",
  firstName: "New",
  lastName: "User",
  email: "newuser@example.com",
  age: 20,
};

Given("I am a visitor on the signup page", () => {
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 401, body: {} }).as("getMeSignup");
  cy.visitWithLocale("/signup");
  cy.get("#usernameInput").should("exist");
});

Given("I visit the signup page while already logged in", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeSignup");
  cy.visitWithLocale("/signup");
});

Then("I should see the signup form", () => {
  cy.get("#usernameInput").should("exist");
  cy.get("#emailInput").should("exist");
  cy.get("#passwordInput").should("exist");
  cy.contains("button", "Sign Up").should("exist");
});

When("I submit the empty signup form", () => {
  cy.contains("button", "Sign Up").click();
});

Then("I should see signup validation errors", () => {
  cy.get(".field-error").contains("Required or invalid").should("exist");
});

When("I fill in the signup form with a weak password {string}", (password: string) => {
  cy.get("#usernameInput").type("testuser");
  cy.get("#firstNameInput").type("Test");
  cy.get("#lastNameInput").type("User");
  cy.get("#emailInput").type("test@example.com");
  cy.get("#ageInput").type("20");
  cy.get("#passwordInput").type(password);
  cy.contains("button", "Sign Up").click();
});

Then("I should see a weak password error", () => {
  cy.get(".field-error").contains("Too short").should("exist");
});

When("I fill in and submit the signup form with valid data", () => {
  cy.intercept("POST", "**/api/v1/auth/signup", {
    statusCode: 201,
    body: MOCK_USER,
  }).as("signupRequest");
  cy.get("#usernameInput").type("newuser");
  cy.get("#firstNameInput").type("New");
  cy.get("#lastNameInput").type("User");
  cy.get("#emailInput").type("newuser@example.com");
  cy.get("#ageInput").type("20");
  cy.get("#passwordInput").type("securepassword123");
  cy.contains("button", "Sign Up").click();
  cy.wait("@signupRequest");
});

Then("I should see the signup success message", () => {
  cy.url({ timeout: 5000 }).should("not.include", "/signup");
});

When("I fill in and submit the signup form with a taken username", () => {
  cy.intercept("POST", "**/api/v1/auth/signup", {
    statusCode: 409,
    body: { errors: [{ code: "USERNAME_TAKEN" }] },
  }).as("signupTaken");
  cy.get("#usernameInput").type("takenuser");
  cy.get("#firstNameInput").type("Taken");
  cy.get("#lastNameInput").type("User");
  cy.get("#emailInput").type("taken@example.com");
  cy.get("#ageInput").type("20");
  cy.get("#passwordInput").type("securepassword123");
  cy.contains("button", "Sign Up").click();
  cy.wait("@signupTaken");
});

Then("I should see a username taken error", () => {
  cy.contains("This username is already taken.").should("exist");
});

Then("I should be redirected away from signup", () => {
  cy.url({ timeout: 5000 }).should("not.include", "/signup");
});
