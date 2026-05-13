import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Navigate to settings and wait for the profile API call to finish loading
When("I navigate to the settings page", () => {
  cy.intercept("GET", "**/api/users/me").as("getProfile");
  cy.visitWithLocale("/settings");
  cy.wait("@getProfile");
});

// The settings page renders <h3>Settings</h3> as its title
Then("I should see the settings page heading", () => {
  cy.get("h3").contains("Settings").should("be.visible");
});

// Admin user is seeded with firstName="admin", email="admin@example.com"
Then("the profile form should be pre-filled with my data", () => {
  cy.get("#firstNameInput").should("not.have.value", "");
  cy.get("#emailInput").should("not.have.value", "");
});

When("I update my first name to {string}", (name: string) => {
  cy.get("#firstNameInput").clear().type(name);
});

// Profile form is the first <form> on the page
When("I save my profile", () => {
  cy.get("form").first().find("button[type='submit']").click();
});

// t("profileSuccess") = "Profile updated successfully."
Then("I should see a profile success message", () => {
  cy.contains("Profile updated successfully.", { timeout: 8000 }).should("be.visible");
});

When("I clear the first name field", () => {
  cy.get("#firstNameInput").clear();
});

// t("validate.error") = " - Missing or Invalid" (leading space, so match substring)
Then("I should see a profile validation error", () => {
  cy.contains("Missing or Invalid").should("be.visible");
});

When("I fill in the change password form with current {string} and new {string}", (current: string, newPw: string) => {
  cy.get("#currentPasswordInput").clear().type(current);
  cy.get("#newPasswordInput").clear().type(newPw);
  cy.get("#confirmPasswordInput").clear().type(newPw);
});

// Password form is the second <form> on the page
When("I save my password", () => {
  cy.get("form").eq(1).find("button[type='submit']").click();
});

// t("passwordSuccess") = "Password changed successfully."
Then("I should see a password success message", () => {
  cy.contains("Password changed successfully.", { timeout: 8000 }).should("be.visible");
});

// t("error.INVALID_CREDENTIALS") = "Current password is incorrect."
Then("I should see a password error message", () => {
  cy.contains("Current password is incorrect.", { timeout: 8000 }).should("be.visible");
});

// The logout button renders: <span class="material-symbols-outlined">logout</span><span>Log out</span>
// cy.contains finds any element whose text content includes the string
When("I click the logout button", () => {
  cy.contains("Log out").click();
});

// t("logoutConfirm") = "Are you sure you want to log out?"
Then("I should see a logout confirmation", () => {
  cy.contains("Are you sure you want to log out?").should("be.visible");
});

// t("logoutConfirmButton") = "Confirm"
When("I confirm the logout", () => {
  cy.contains("button", "Confirm").click();
});

Then("I should be redirected to the login page", () => {
  cy.url({ timeout: 8000 }).should("include", "/login");
});
