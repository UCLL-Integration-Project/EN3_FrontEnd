/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      visitWithLocale(path: string, locale?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  const apiUrl = Cypress.env("apiUrl") as string;
  const locale = (Cypress.env("locale") as string) || "en";

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/v1/users/login`,
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
