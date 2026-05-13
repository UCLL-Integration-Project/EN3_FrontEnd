/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to logout the current user
       * Clicks the logout button if it exists on the page
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to login with username and password
       * @example cy.login("admin", "admin")
       */
      login(username: string, password: string): Chainable<void>;

      visitWithLocale(path: string, locale?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("logout", () => {
  cy.get("body").then(($body) => {
    const logoutSelector =
      'button:contains("Logout"), a:contains("Logout"), [data-testid="logout"]';

    if ($body.find(logoutSelector).length > 0) {
      cy.contains("Logout").click();
      cy.wait(500);
      cy.clearLocalStorage();
    }
  });
});

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visitWithLocale("/login");

  cy.get("input").eq(0).type(username);
  cy.get("input").eq(1).type(password);

  cy.contains("button", "Login").click();

  cy.contains("Logout").should("be.visible");
});

Cypress.Commands.add("visitWithLocale", (path: string, locale?: string) => {
  const localeToUse = locale || Cypress.env("locale") || "en";
  cy.visit(`/${localeToUse}${path}`);
});

export {};
