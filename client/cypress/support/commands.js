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

Cypress.Commands.add("login", (login, pw, should_success = true) => {
  cy.get('[name="username"]')
    .clear()
    .type(login);
  cy.get('[name="password"]')
    .clear()
    .type(pw);
  cy.get('[data-test="login-btn"]').click();

  if (should_success)
    cy.contains("button", "New Note", { timeout: 20000 }).should("exist");
  else
    cy.contains("div.alert", "incorrect Username or Password", {
      timeout: 20000
    }).should("exist");
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
