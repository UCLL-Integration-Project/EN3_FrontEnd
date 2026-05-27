import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am a logged-in settings user", () => {
  cy.setCookie("cw_session", "1");
});

When("I navigate to the settings page", () => {
  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: {
      id: 1,
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      age: 30,
      bio: "",
    },
  }).as("getProfile");
  cy.visitWithLocale("/settings");
  cy.wait("@getProfile");
});

Then("I should see the settings page heading", () => {
  cy.get("h4").contains("Settings").should("be.visible");
});

When(
  "I fill in the change password form with current {string} and new {string}",
  (current: string, newPw: string) => {
    const isCorrect = current !== "wrongpassword";
    cy.intercept(
      "PUT",
      "**/api/v1/account/password",
      isCorrect
        ? { statusCode: 200 }
        : { statusCode: 401, body: { errors: [{ code: "INVALID_CREDENTIALS" }] } }
    ).as("changePassword");
    cy.get("#currentPasswordInput").clear().type(current);
    cy.get("#newPasswordInput").clear().type(newPw);
    cy.get("#confirmPasswordInput").clear().type(newPw);
  }
);

When("I save my password", () => {
  cy.get("form").first().find("button[type='submit']").click();
});

Then("I should see a password success message", () => {
  cy.contains("Password changed successfully.", { timeout: 8000 }).should("be.visible");
});

Then("I should see a password error message", () => {
  cy.contains("Current password is incorrect.", { timeout: 8000 }).should("be.visible");
});

When("I click the logout button", () => {
  cy.contains("Log out").click();
});

Then("I should see a logout confirmation", () => {
  cy.contains("Are you sure you want to log out?").should("be.visible");
});

When("I confirm the logout", () => {
  cy.intercept("POST", "**/api/v1/auth/logout", { statusCode: 200 }).as("logout");
  cy.contains("button", "Confirm").click();
});
