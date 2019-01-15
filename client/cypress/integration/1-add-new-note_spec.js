/// <reference types="Cypress" />

describe("My First Test", function () {
  const username = `alice`;
  const password = `password1234=?`;

  it("Alice create an account", function () {
    cy.visit("http://localhost:3000");
    cy.contains("Create an account").click();

    cy.get('[name="username"]')
      .eq(1)
      .type(username);
    cy.get('[name="password1"]').type(password);
    cy.get('[name="password2"]').type(password);

    cy.get('[data-test="create"]').click();
  });

  it("Alice sign in", function () {
    cy.visit("http://localhost:3000");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password);

    cy.get('[data-test="login-btn"]').click();

    cy.contains("New Note").click();
    cy.get('[name="title"]').type("New note");
    cy.get('[name="content"]').type(
      "Here is a new note " +
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      }).format(new Date())
    );
    cy.get('[data-test="save"]').click();
  });
});
