import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate to the settings page", () => {
  cy.intercept("GET", "**/api/users/me").as("getProfile");
  cy.visitWithLocale("/settings");
  cy.wait("@getProfile");
});

Then("I should see the settings page heading", () => {
  cy.get("h3").contains("Settings").should("be.visible");
});

Then("the profile form should be pre-filled with my data", () => {
  cy.get("#firstNameInput").should("not.have.value", "");
  cy.get("#emailInput").should("not.have.value", "");
});

When("I update my first name to {string}", (name: string) => {
  cy.get("#firstNameInput").clear().type(name);
});

When("I save my profile", () => {
  cy.get("form").first().find("button[type='submit']").click();
});

Then("I should see a profile success message", () => {
  cy.contains("Profile updated successfully.", { timeout: 8000 }).should("be.visible");
});

When("I clear the first name field", () => {
  cy.get("#firstNameInput").clear();
});

Then("I should see a profile validation error", () => {
  cy.contains("Missing or Invalid").should("be.visible");
});

When("I fill in the change password form with current {string} and new {string}", (current: string, newPw: string) => {
  cy.get("#currentPasswordInput").clear().type(current);
  cy.get("#newPasswordInput").clear().type(newPw);
  cy.get("#confirmPasswordInput").clear().type(newPw);
});

When("I save my password", () => {
  cy.get("form").eq(1).find("button[type='submit']").click();
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
  cy.contains("button", "Confirm").click();
});

Then("I should be redirected to the login page", () => {
  cy.url({ timeout: 8000 }).should("include", "/login");
});
