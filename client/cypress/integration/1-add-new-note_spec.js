/// <reference types="Cypress" />

const crypto = require("crypto"),
  shasum = crypto.createHash("sha1");

shasum.update(new Date().getTime() + "");

let seed = shasum.digest("hex").substring(0, 7);
// Change seed by using command : CYPRESS_SEED="blabla" cypress open
seed = Cypress.env("SEED") || seed;

const username = `alice.${seed}`;
const password = `password1234=?`;

const formatedDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false
}).format(new Date());
const encryptedContent = `Here is a new encrypted note -- ${formatedDate}`;
const encryptedSharedContent = `Here is a new encrypted shared note -- ${formatedDate}`;

describe(`Notes creation ${seed}`, function() {
  for (let name of ["alice", "bob", "charlie"]) {
    it(`${name} create an account`, function() {
      cy.visit("/");

      let login = `${name}.${seed}`;

      cy.contains("Create an account").click();
      cy.get('.modal-body [name="username"]').type(login);
      cy.get('[name="password1"]').type(password);
      cy.get('[name="password2"]').type(password);
      cy.get('[data-test="create"]').click();

      // login
      cy.get('.panel-body [name="username"]').type(login);
      cy.get('[name="password"]').type(password);
      cy.get('[data-test="login-btn"]').click();
      cy.get('[data-test="create"]').should("not.exist");

      cy.visit("/");
      cy.login(login, password);
    });
  }

  it("alice sign in an create new note", function() {
    cy.visit("/");

    cy.get('[name="username"]').type(username);
    cy.get('[name="password"]').type(password);
    cy.get('[data-test="login-btn"]').click();

    // cy.get("div.modal-content", { timeout: 30000 }).then(modalNewPassword => {
    //   if (modalNewPassword.find('[name="password1"]').length > 0) {
    //     cy.get('[name="password1"]').type(password2);
    //     cy.get('[name="password2"]').type(password2);
    //     cy.get('[data-test="create"]').click();
    //   }
    // });

    // Create new note
    cy.contains("New Note").click();
    cy.get('[name="title"]').type("New note encrypted");
    cy.get('[name="content"]').type(encryptedContent);
    cy.get('[data-test="save"]').click();

    for (let content of [encryptedContent]) {
      cy.contains("div.panel-body", content, { timeout: 20000 }).should(
        "exist"
      );
    }

    cy.get("#basic-nav-dropdown").click();
    cy.contains("Logout").click();
  });

  // it("Alice sign with her old password and get an error", function() {
  //   cy.visit("/");

  //   cy.get('[name="username"]').type(username);
  //   cy.get('[name="password"]').type(password);
  //   cy.get('[data-test="login-btn"]').click();

  //   cy.contains("div.alert-danger", "Incorrect Password", {
  //     timeout: 30000
  //   }).should("exist");
  // });

  it("alice sign in and find her note", function() {
    cy.visit("/");

    cy.login(username, password);

    cy.contains("div.panel-body", encryptedContent, {
      timeout: 20000
    }).should("exist");

    // cy.get("#basic-nav-dropdown", { timeout: 10000 }).click();
    // cy.contains("Logout").click();
  });
});

describe(`Notes sharing ${seed}`, function() {
  it("Login error should disapear", () => {
    cy.visit("/");
    cy.login("toto", "atat", false);
    cy.login(`alice.${seed}`, password);
    cy.contains("div.alert", "incorrect Username or Password").should(
      "not.exist"
    );
  });

  it(`alice.${seed} share a new note, extends share`, function() {
    cy.visit("/");

    cy.login(`alice.${seed}`, password);

    // Test if precedent title exists
    cy.contains("div", "New note encrypted", {
      timeout: 10000
    }).should("exist");

    // In case of lots of notes, I need to wait them to be all decrypted
    // cy.get("li.list-group-item", { timeout: 30000 }).each(() => {
    //   cy.wait(800);
    // });

    cy.contains("button", "New Note", {
      timeout: 20000
    }).click();

    cy.get('[name="title"]').type("New note encrypted and shared");
    cy.get('[name="content"]').type(encryptedSharedContent);

    const shareWith = `charlie.${seed}`;

    cy.shareWith(shareWith);
    cy.contains("Save").click();

    cy.contains(".modal-footer", "Save", { timeout: 60000 }).should(
      "not.exist"
    );

    // New note should appear and use .shared css class
    cy.contains("div.panel-body", encryptedSharedContent, {
      timeout: 20000
    }).should("exist");
  });

  it(`charlie.${seed} find his notes`, function() {
    cy.visit("/");

    cy.login(`charlie.${seed}`, password);

    // Test if precedent title exists
    cy.contains("div", "New note encrypted and shared", {
      timeout: 10000
    }).should("exist");
    cy.contains("div.panel-body", encryptedSharedContent, {
      timeout: 20000
    }).should("exist");
  });

  it("alice sign in and extends share with bob", function() {
    cy.visit("/");

    cy.login(username, password);

    cy.contains("div.panel-body", encryptedSharedContent, { timeout: 20000 })
      .parentsUntil("li")
      .find(".shared")
      .parent()
      .click();

    // Search bob
    const shareWith = `bob.${seed}`;

    cy.shareWith(shareWith);

    cy.contains("Save").click();
    cy.contains("Save").should("not.exist");

    // Click on shared button
    cy.contains("div.panel-body", encryptedSharedContent, { timeout: 20000 })
      .parentsUntil("li")
      .find(".shared")
      .parent()
      .click();

    cy.contains("span", "bob", { timeout: 5000 }).should("exist");
    cy.contains("Cancel").click();
  });

  it(`bob.${seed} find his notes`, function() {
    cy.visit("/");

    cy.login(`bob.${seed}`, password);

    cy.contains("div.panel-body", encryptedSharedContent, {
      timeout: 10000
    }).should("exist");
  });
});

describe(`Sharing with groups ${seed}`, () => {
  const group1name = `Group test -- 🎲 ${Math.floor(Math.random() * 100)}`;

  const notes = new Array(2).fill(1).map((x, idx) => ({
    title: `Group note #${idx + 1}`,
    content: `Note #${idx +
      1} group ${group1name} containing text -- ${formatedDate}`
  }));

  it(`alice ${seed} create a group`, () => {
    cy.visit("/");
    cy.login(username, password);
    cy.get('[data-test="new-group"]').click();
    cy.get(".modal-body").within(() => {
      cy.get("input:first").should("have.attr", "placeholder", "Name");
      cy.get("input:first").type(group1name);
      cy.shareWith(`bob.${seed}`);
      cy.shareWith(`charlie.${seed}`);
    });

    cy.get('[data-test="save"]').click();
    cy.contains(group1name).should("exist");
  });

  it(`alice ${seed} add a note to the group`, () => {
    cy.visit("/");
    cy.login(username, password);
    // Select the group
    cy.contains(group1name).click();
    // Create notes

    for (let note of notes) {
      cy.contains("button", "New Note", {
        timeout: 20000
      }).click();
      cy.get(".modal-body").within(() => {
        cy.get("input").should("have.attr", "placeholder", "Title");
        cy.get("input").type(note.title);
        cy.get("textarea").should("have.attr", "placeholder", "Content");
        cy.get("textarea").type(note.content);
      });
      cy.contains("Save").click();
      cy.contains(".panel-body", note.content, { timeout: 30000 }).should(
        "exist"
      );
    }
  });

  it(`bob ${seed} access to the group`, () => {
    cy.visit("/");
    cy.login(`bob.${seed}`, password);
    // Select the group
    cy.contains(group1name).click();
    // See the note
    cy.contains(".panel-body", notes[0].content, { timeout: 30000 }).should(
      "exist"
    );
  });

  it(`charlie ${seed} access to the group`, () => {
    cy.visit("/");
    cy.login(`charlie.${seed}`, password);
    // Select the group
    cy.contains(group1name).click();
    // See the note
    cy.contains(".panel-body", notes[0].content, { timeout: 30000 }).should(
      "exist"
    );
  });

  it(`alice ${seed} remove charlie from the group`, () => {
    cy.visit("/");
    cy.login(username, password);
    // Select the group
    cy.contains(group1name)
      .parent()
      .within(() => {
        cy.get('[data-test="edit-group"]').click();
      });

    cy.shareWith(`alice.${seed}`);
    cy.shareWith(`bob.${seed}`);
    cy.contains("Save").click();
    cy.contains(".modal-footer", "Save", { timeout: 5000 }).should("not.exist");
    // Wait for the request to be executed
    cy.wait(2000);
  });

  it(`charlie ${seed} stop seeing the note`, () => {
    cy.visit("/");
    cy.login(`charlie.${seed}`, password);
    // Select the group
    cy.contains(group1name).click();
    cy.wait(5000);
    // Don't see the note
    cy.get(".panel-body").should("not.contain", notes[0].content);
  });

  it(`Alice ${seed} delete the second group's note`, () => {
    cy.visit("/");
    cy.login(username, password);
    // Select the group
    cy.contains(group1name).click();

    cy.contains(".panel-body", notes[1].content, { timeout: 30000 }).should(
      "exist"
    );
    cy.contains(notes[1].content)
      .parent(".panel")
      .within(() => {
        cy.get("button").click();
      });
    // Note should display in red and hide delete button
    cy.contains(notes[1].content)
      .parent(".panel")
      .within(() => {
        cy.get("button").should("not.exist");
      });
    // Force refresh, note should disapear
    cy.get('[data-test="refresh"]').click();
    cy.contains(notes[1].content).should("not.exist");
  });
  it(`charlie ${seed} stop seeing the second note`, () => {
    cy.visit("/");
    cy.login(`bob.${seed}`, password);
    // Select the group
    cy.contains(group1name).click();

    cy.wait(5000);

    // Don't see the note
    cy.get(".panel-body").should("not.contain", notes[1].content);
  });
});
