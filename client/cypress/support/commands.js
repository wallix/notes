// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("login", (login, pw) => {
  cy.get('[name="username"]').type(login);
  cy.get('[name="password"]').type(pw);
  cy.get('[data-test="login-btn"]').click();
  cy.contains("button", "New Note", { timeout: 20000 }).should("exist");
});

Cypress.Commands.add("shareWith", shareWith => {
  cy.get("#ShareSelect > div > div:first-child").click();
  cy.wait(500);
  cy.get("#ShareSelect input").type(shareWith, { force: true });
  cy.wait(500);
  cy.get("#ShareSelect > div:nth-of-type(2) > div:nth-of-type(1)").should(
    "contain",
    shareWith
  );
  cy.get("#ShareSelect > div:nth-of-type(2) > div:nth-of-type(1)").click();
});
