import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate to the forum page", () => {
  cy.visitWithLocale("/forum");
});

Given("I am on the forum page", () => {
  cy.visitWithLocale("/forum");
});

Then("I should see a list of forum posts", () => {
  cy.contains(/Forum|Posts|Discussion/i).should("be.visible");
  cy.get("body").should("contain.text", "Test Post on Software Engineering");
});

Then("I should see the forum post {string}", (title: string) => {
  cy.contains(title).should("be.visible");
});

Given("I am viewing the forum post {string}", (title: string) => {
  cy.visitWithLocale("/forum");
  cy.contains(title).click();
  cy.contains(title).should("be.visible");
});

When("I create a forum post with title {string}", (title: string) => {
  cy.contains("button, a", /Create|New Post|Add Post|New/i).click();

  cy.get("input").eq(0).type(title);
  cy.get("input").eq(1).type("This post was created by a Cypress E2E test.");

  cy.contains("button", /Create|Submit|Save|Post/i).click();
});

When("I post a comment {string}", (comment: string) => {
  cy.contains("button", "New Comment").click();
  cy.get('input[placeholder="Write a comment..."]').type(comment);
  cy.contains("button", "Post").click();
});

Then("I should see the comment {string}", (comment: string) => {
  cy.contains(comment).should("be.visible");
});

When("I try to post an empty comment", () => {
  cy.contains("button", /Comment|Reply|Submit|Post/i).click();
});

Then("the comment post button should be disabled", () => {
  cy.contains("button", "New Comment").click();
  cy.contains("button", "Post").should("be.disabled");
});

Then("I should see a validation error", () => {
  cy.contains(/required|not blank|error|invalid|fill in|must not be empty/i).should(
    "be.visible",
  );
});

Then("I should be redirected to the login page", () => {
  cy.url().should("include", "/login");
});

Then("I should not see moderation actions for forum posts", () => {
  cy.contains(/Edit|Close|Delete|Lock|Moderate/i).should("not.exist");
});