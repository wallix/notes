/// <reference types="Cypress" />

describe("My First Test", function() {
  const username = `alice${Math.random()}`;
  const password = `password1234=?`;
  const password2 = `password567=!`;
  const formatedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  }).format(new Date());
  const noteContent = `Here is a new note \n${formatedDate}`;
  const encryptedNoteContent = `Here is a new encrypted note \n${formatedDate}`;

  it("Alice create an account", function() {
    cy.visit("http://localhost:3000");
    cy.contains("Create an account").click();

    cy.get('[name="username"]')
      .eq(1)
      .type(username);
    cy.get('[name="password1"]').type(password);
    cy.get('[name="password2"]').type(password);

    cy.get('[data-test="create"]').click();
  });

  it("Alice sign in an create new encrypted note", function() {
    cy.visit("http://localhost:3000");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password);
    cy.get('[data-test="login-btn"]').click();

    cy.get("div.modal-content").then(modalNewPassword => {
      if (modalNewPassword.find('[name="password1"]').length > 0) {
        cy.get('[name="password1"]').type(password2);
        cy.get('[name="password2"]').type(password2);
        cy.get('[data-test="create"]').click();
      }
    });

    // Create new unprotected note
    cy.contains("New Note").click();
    cy.get('[name="title"]').type("New note");
    cy.get('[name="content"]').type(noteContent);
    cy.get('[data-test="protected"]').uncheck();
    cy.get('[data-test="save"]').click();
    cy.contains(noteContent).should("exist");

    // Create new protected note
    cy.contains("New Note").click();
    cy.get('[name="title"]').type("New note encrypted");
    cy.get('[name="content"]').type(encryptedNoteContent);
    cy.get('[data-test="protected"]').check();
    cy.get('[data-test="save"]').click();
    cy.contains(encryptedNoteContent).should("exist");

    cy.get("#basic-nav-dropdown").click();
    cy.contains("Logout").click();
  });

  it("Alice sign in with her new password and find her notes", function() {
    cy.visit("http://localhost:3000");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password2);
    cy.get('[data-test="login-btn"]').click();

    cy.contains(noteContent).should("exist");
    cy.contains(encryptedNoteContent).should("exist");

    cy.get("#basic-nav-dropdown").click();
    cy.contains("Logout").click();
  });
});
