/// <reference types="Cypress" />

describe("My First Test", function() {
  const time = new Date().getTime();
  const username = `alice${time}`;
  // const username = `alice-test-6`; // DO NOT COMMIT

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

  it("Random Alice create an account", function() {
    cy.visit("/");
    cy.contains("Create an account").click();
    cy.get('.modal-body [name="username"]', { timeout: 5000 }).type(username);
    cy.get('[name="password1"]').type(password);
    cy.get('[name="password2"]').type(password);

    cy.get('[data-test="create"]').click();
  });

  it("Alice sign in an create new notes", function() {
    cy.visit("/");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password);
    cy.get('[data-test="login-btn"]').click();

    cy.get("div.modal-content", { timeout: 30000 }).then(modalNewPassword => {
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

    // Create new protected note
    cy.contains("New Note").click();
    cy.get('[name="title"]').type("New note encrypted");
    cy.get('[name="content"]').type(encryptedNoteContent);
    cy.get('[data-test="protected"]').check();
    cy.get('[data-test="save"]').click();

    for (let content of [noteContent, encryptedNoteContent]) {
      cy.contains("div.panel-body", content, { timeout: 20000 }).should(
        "exist"
      );
    }

    cy.get("#basic-nav-dropdown").click();
    cy.contains("Logout").click();
  });

  it("Alice sign with her old password and get an error", function() {
    cy.visit("/");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password);
    cy.get('[data-test="login-btn"]').click();

    cy.contains("div.alert-danger", "Incorrect Password").should("exist");
  });

  it("Alice sign in with her new password and find her notes", function() {
    cy.visit("/");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password2);
    cy.get('[data-test="login-btn"]').click();

    cy.contains("button", "New Note", { timeout: 30000 }).should("exist");

    // cy.get("#basic-nav-dropdown", { timeout: 10000 }).click();
    // cy.contains("Logout").click();
  });

  for (let i = 0; i < 2; i++) {
    it(`Alice.${i} create her account if not exists`, function() {
      cy.visit("/");

      let login = `alice.${i}${time}`;

      cy.contains("Create an account").click();
      cy.get('.modal-body [name="username"]').type(login);
      cy.get('[name="password1"]').type(password);
      cy.get('[name="password2"]').type(password);
      cy.get('[data-test="create"]').click();

      // login
      cy.get('.panel-body [name="username"]').type(login);
      cy.get('[name="password"]').type(password);
      cy.get('[data-test="login-btn"]').click();

      cy.get("div.modal-content", { timeout: 30000 }).then(modalNewPassword => {
        if (modalNewPassword.find('[name="password1"]').length > 0) {
          cy.get('[name="password1"]').type(password2);
          cy.get('[name="password2"]').type(password2);
          cy.get('[data-test="create"]').click();
        }
      });

      cy.contains("button", "New Note").should("exist");
    });
  }

  it("Alice sign in and share a new note", function() {
    const encryptedContent = `Here is a new encrypted shared note \n${formatedDate}`;

    cy.visit("/");
    // login
    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password2);
    cy.get('[data-test="login-btn"]').click();

    // cy.contains("button", "New Note", { timeout: 30000 }).should("exist");
    cy.contains("button", "New Note", { timeout: 30000 }).click();

    // In case of lots of notes, I need to wait them to be all decrypted
    cy.get("li.list-group-item", { timeout: 30000 }).each(() => {
      cy.wait(800);
    });

    cy.get("#ShareSelect > div > div:first-child").click();
    cy.get("#ShareSelect input").type("alice.0", { force: true });

    cy.get("#ShareSelect > div:nth-of-type(2) > div:nth-of-type(1)").click();

    cy.get('[name="title"]').type("New note encrypted and shared");
    cy.get('[name="content"]').type(encryptedContent);
    cy.get('[data-test="protected"]').check();

    cy.contains("Save").click();

    cy.contains(".modal-footer", "Save", { timeout: 60000 }).should(
      "not.exist"
    );

    cy.contains("div.panel-body", encryptedContent, { timeout: 20000 }).should(
      "exist"
    );
  });

  it("Alice sign in with her new password, find her shared notes and extends share", function() {
    cy.visit("/");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password2);
    cy.get('[data-test="login-btn"]').click();

    cy.contains("button", "New Note", { timeout: 30000 }).should("exist");

    // Test if precedent title exists
    cy.contains("div", "New note encrypted and shared", {
      timeout: 30000
    }).should("exist");

    // Click on shared button
    cy.get("span.shared", {
      timeout: 30000
    })
      .eq(0)
      .parent("button")
      .click();

    // Search alice.1
    cy.get("#ShareSelect > div > div:first-child").click();
    cy.get("#ShareSelect input").type("alice.1", { force: true });

    cy.wait(2000);

    cy.get("#ShareSelect > div:nth-of-type(2) > div:nth-of-type(1)").click();

    cy.contains("Save").click();
    cy.contains("Save").should("not.exist");

    // Click on shared button
    cy.get("span.shared", {
      timeout: 30000
    })
      .eq(0)
      .parent("button")
      .click();

    cy.contains("alice.1").should("exist");
    cy.contains("Cancel").click();
  });
});
