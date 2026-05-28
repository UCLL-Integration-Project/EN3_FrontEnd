import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

const MOCK_USER = {
  id: 1,
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  age: 25,
};

const DEVICE_KEY = `crosswave.deviceLinked:${MOCK_USER.username}`;

Given("I am a guest visiting the device page", () => {
  // No cw_session cookie — proxy.ts redirects PROTECTED routes to login.
  cy.visit("/en/device");
});

Given("I am a guest visiting the device setup page", () => {
  cy.visit("/en/device/setup");
});

Given("I am a logged-in user visiting device setup without a linked device", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeDevice");
  cy.visit("/en/device/setup", {
    onBeforeLoad: (win) => {
      win.localStorage.removeItem(DEVICE_KEY);
    },
  });
  cy.wait("@getMeDevice");
});

Given("I am a logged-in user visiting device page without a linked device", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeDevice");
  cy.visit("/en/device", {
    onBeforeLoad: (win) => {
      win.localStorage.removeItem(DEVICE_KEY);
    },
  });
  cy.wait("@getMeDevice");
});

Given("I am a logged-in user visiting device setup with a linked device", () => {
  cy.setCookie("cw_session", "1");
  cy.intercept("GET", "**/api/v1/users/me", { statusCode: 200, body: MOCK_USER }).as("getMeDevice");
  cy.visit("/en/device/setup", {
    onBeforeLoad: (win) => {
      win.localStorage.setItem(DEVICE_KEY, "true");
    },
  });
  cy.wait("@getMeDevice");
});

Then("I should be redirected to the device setup page", () => {
  cy.url({ timeout: 5000 }).should("include", "/device/setup");
});

Then("I should be redirected to the device management page", () => {
  cy.url({ timeout: 5000 }).should("match", /\/en\/device$/);
});

Then("I should see the device setup intro title", () => {
  cy.contains("Pair your companion").should("exist");
});
