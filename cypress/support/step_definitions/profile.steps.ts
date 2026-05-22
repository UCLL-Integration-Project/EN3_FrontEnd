import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string} with name {string}", (username: string, fullName: string) => {
  const [firstName, lastName] = fullName.split(" ");
  const email = `${username}@example.com`;

  cy.intercept("POST", "**/api/v1/users/login", {
    statusCode: 200,
    body: { token: "fake-token", username, firstName, lastName, email, age: 30, role: "USER" },
  }).as("loginRequest");

  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: { id: 1, username, firstName, lastName, email, age: 30, bio: "My test bio", connectionsCount: 10 },
  }).as("getMeRequest");

  cy.intercept("GET", `**/api/v1/users/${username}/activity`, {
    statusCode: 200,
    body: [{ id: 1, type: "POST", description: "Updated profile", timestamp: new Date().toISOString() }],
  }).as("getActivityRequest");

  cy.visit("/en/login");
  cy.get("input[type='email']").type(email);
  cy.get("input[type='password']").type("password123");
  cy.get("button[type='submit']").click();
  cy.wait("@loginRequest");
});

Given("a user {string} exists with name {string} and bio {string}", (username: string, fullName: string, bio: string) => {
  const [firstName, lastName] = fullName.split(" ");
  cy.intercept("GET", `**/api/v1/users/${username}`, {
    statusCode: 200,
    body: { id: 2, username, firstName, lastName, email: `${username}@example.com`, age: 25, bio, connectionsCount: 5 },
  }).as("getOtherUserRequest");

  cy.intercept("GET", `**/api/v1/users/${username}/activity`, {
    statusCode: 200,
    body: [],
  }).as("getOtherActivityRequest");
});

When("I navigate to the {string} page", (path: string) => {
  cy.visit(path);
});

Then("I should see my banner and avatar", () => {
  cy.get(".bg-brand-gradient").should("be.visible"); // Fallback banner
  cy.get(".h-24.w-24").contains("J").should("be.visible"); // Fallback avatar initial
});

Then("I should see my name {string} and username {string}", (name: string, username: string) => {
  cy.get("h2").contains(name).should("be.visible");
  cy.get("p").contains(username).should("be.visible");
});

Then("I should see an {string} button", (text: string) => {
  cy.get("button").contains(text).should("be.visible");
});

Then("I should see the {string} section with my bio", (section: string) => {
  cy.get("h5").contains(section).should("be.visible");
  cy.get("p").contains("My test bio").should("be.visible");
});

Then("I should see the {string} section", (section: string) => {
  cy.get("h5").contains(section).should("be.visible");
});

When("I click the {string} button", (text: string) => {
  if (text === "Connect") {
    cy.intercept("POST", "**/api/v1/users/*/connect", { statusCode: 200 }).as("connectRequest");
  }
  cy.get("button").contains(text).click();
});

Then("I should see the profile edit form", () => {
  cy.get("form").should("be.visible");
});

Then("I should see inputs for {string}, {string}, and {string}", (f1: string, f2: string, f3: string) => {
  cy.get(`textarea[id='${f1}Input']`).should("be.visible");
  cy.get(`input[id='${f2}Input']`).should("be.visible");
  cy.get(`input[id='${f3}Input']`).should("be.visible");
});

Then("I should be back in the social profile view", () => {
  cy.get("h2").should("be.visible");
  cy.get("form").should("not.exist");
});

Then("I should see Jane's banner and avatar", () => {
  cy.get(".bg-brand-gradient").should("be.visible");
  cy.get(".h-24.w-24").contains("J").should("be.visible");
});

Then("I should see the name {string} and username {string}", (name: string, username: string) => {
  cy.get("h2").contains(name).should("be.visible");
  cy.get("p").contains(username).should("be.visible");
});

Then("I should not see an {string} button", (text: string) => {
  cy.get("button").contains(text).should("not.exist");
});

Then("the button should change to {string}", (text: string) => {
  cy.wait("@connectRequest");
  cy.get("button").contains(text).should("be.visible");
});

Then("the connection count should increase", () => {
  cy.get("span").contains("6").should("be.visible"); // 5 + 1
});

Given("I have a connection with {string}", (username: string) => {
  cy.intercept("GET", "**/api/v1/users/me/connections", {
    statusCode: 200,
    body: [{ id: 2, username, firstName: "Jane", lastName: "Doe" }],
  }).as("getConnectionsRequest");
  
  cy.intercept("DELETE", `**/api/v1/users/me/connections/${username}`, {
    statusCode: 200,
  }).as("removeConnectionRequest");

  // Mock the profile call to return 10 connections initially, 
  // then 9 connections after removal (simulating backend update)
  let callCount = 0;
  cy.intercept("GET", "**/api/v1/users/me", (req) => {
    callCount++;
    req.reply({
      statusCode: 200,
      body: { 
        id: 1, 
        username: "johndoe", 
        firstName: "John", 
        lastName: "Doe", 
        connectionsCount: callCount === 1 ? 10 : 9 
      },
    });
  }).as("getMeRequestSync");
});

When("I remove the connection with {string}", (username: string) => {
  cy.get(`button[aria-label*='${username}']`).click();
  cy.wait("@removeConnectionRequest");
});

Then("I should see the connection count as {string}", (count: string) => {
  cy.get("span").contains(count).should("be.visible");
});
