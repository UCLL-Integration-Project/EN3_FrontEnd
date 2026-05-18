import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as a user with username {string}, first name {string}, last name {string}, email {string}, and age {int}", (username: string, firstName: string, lastName: string, email: string, age: number) => {
  // Mock the login API call
  cy.intercept("POST", "**/api/users/login", {
    statusCode: 200,
    body: { token: "fake-token", username, firstName, lastName, email, age, role: "USER" },
  }).as("loginRequest");

  // Mock the get profile API call to return the user's data
  cy.intercept("GET", "**/api/users/me", {
    statusCode: 200,
    body: { id: 1, username, firstName, lastName, email, age },
  }).as("getProfileRequest");

  // Programmatically login (assuming /login page exists and handles this)
  cy.visit("/en/login");
  cy.get("input[type='email']").type(email);
  cy.get("input[type='password']").type("password123");
  cy.get("button[type='submit']").click();
  cy.wait("@loginRequest");
});

When("I navigate to the {string} page", (path: string) => {
  cy.visit(path);
});

Then("I should see the profile form", () => {
  cy.wait("@getProfileRequest");
  cy.get("form").should("be.visible");
  cy.get("h1").contains("Profile").should("be.visible");
});

Then("the {string} input should contain {string}", (field: string, value: string) => {
  cy.get(`input[id='${field}Input']`).should("have.value", value);
});

When("I change the {string} input to {string}", (field: string, value: string) => {
  cy.get(`input[id='${field}Input']`).clear().type(value);
});

When("I clear the {string} input", (field: string) => {
  cy.get(`input[id='${field}Input']`).clear();
});

When("I click the save button", () => {
  // Mock the update profile API call before clicking
  cy.intercept("PUT", "**/api/users/me", {
    statusCode: 200,
    body: { id: 1, username: "johndoe", firstName: "Johnny", lastName: "Doe", email: "john@example.com", age: 31 },
  }).as("updateProfileRequest");

  cy.get("button[type='submit']").contains("Save").click();
});

Then("I should see a success message saying {string}", (message: string) => {
  cy.wait("@updateProfileRequest");
  cy.get(".status-success").should("contain.text", message).and("be.visible");
});

Then("I should see validation errors for {string}", (field: string) => {
  cy.get(`input[id='${field}Input']`).closest(".field").find(".field-error").should("not.be.empty");
});

Then("I should not see a success message", () => {
  cy.get(".status-success").should("not.exist");
});
