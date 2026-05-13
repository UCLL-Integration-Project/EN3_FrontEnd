/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      visitWithLocale(path: string, locale?: string): Chainable<void>;
    }
  }
}

/**
 * Login by calling the API directly with cy.request() instead of filling the
 * login form. This avoids the React hydration timing window where controlled
 * inputs get reset before onChange handlers are attached.
 *
 * cy.request() runs in the Cypress Node process (no CORS, no browser hydration).
 * The backend's Set-Cookie response is stored in Cypress's cookie jar and
 * forwarded to the browser, so subsequent fetch calls from the app include
 * the authToken cookie automatically.
 *
 * sessionStorage is written via onBeforeLoad so AuthContext reads it before
 * React's first render — no redirect to /login, no isLoading race.
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  const apiUrl = Cypress.env("apiUrl") as string;
  const locale = (Cypress.env("locale") as string) || "en";

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/users/login`,
    body: { email, password },
    failOnStatusCode: true,
  }).then((response) => {
    const userData = response.body;
    cy.visit(`/${locale}/`, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
      },
    });
  });

  cy.contains("Settings").should("be.visible");
});

Cypress.Commands.add("visitWithLocale", (path: string, locale?: string) => {
  const localeToUse = locale || (Cypress.env("locale") as string) || "en";
  cy.visit(`/${localeToUse}${path}`);
});

export {};
