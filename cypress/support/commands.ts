/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      visitWithLocale(path: string, locale?: string): Chainable<void>;
    }
  }
}

/* Logs in via the API and primes the first-party hint cookies the
   middleware (proxy.ts) reads before a page renders. The httpOnly
   authToken cookie is set by the login response itself. The caller
   navigates afterwards. */
Cypress.Commands.add("login", (email: string, password: string) => {
  const apiUrl = Cypress.env("apiUrl") as string;

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/v1/users/login`,
    body: { email, password, mfaEnabled: false },
    failOnStatusCode: true,
  }).then((response) => {
    cy.setCookie("cw_session", "1");
    if (response.body?.role === "ADMIN") {
      cy.setCookie("cw_admin", "1");
    }
  });
});

Cypress.Commands.add("visitWithLocale", (path: string, locale?: string) => {
  const localeToUse = locale || (Cypress.env("locale") as string) || "en";
  cy.visit(`/${localeToUse}${path}`);
});

export {};
