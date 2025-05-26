describe('End-to-end admin spec', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
      ],
    }).as('getTeachers');

    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true,
      },
    });

    // Create session: intercept the POST request for saving session to mock response
    cy.intercept('POST', '/api/session', {
      statusCode: 201,
      body: {
        id: 123,
        name: 'My Test Session',
        date: '2025-04-25',
        teacher_id: 1,
        description: 'This is a test description for my session.'
      }
    }).as('postSession');

    // Edit session: intercept the POST request for saving session to mock response
    cy.intercept('PUT', '/api/session/123', {
      statusCode: 201,
      body: {
        id: 123,
        name: 'My Test Session',
        date: '2025-04-25',
        teacher_id: 1,
        description: 'The session has been edited.'
      }
    }).as('putSession');

//     // Intercept for create session
//     cy.intercept('POST', '/api/session', (req) => {
//       if (req.body.description === 'This is a test description for my session.') {
//         req.reply({
//           statusCode: 201,
//           body: {
//             id: 123,
//             name: 'My Test Session',
//             date: '2025-04-25',
//             teacher_id: 1,
//             description: 'This is a test description for my session.'
//           }
//         });
//       }
//     }).as('postSession');

//     // Intercept for edited session
//     cy.intercept('POST', '/api/session', (req) => {
//       if (req.body.description === 'The session has been edited.') {
//         req.reply({
//           statusCode: 201,
//           body: {
//             id: 123,
//             name: 'My Test Session',
//             date: '2025-04-25',
//             teacher_id: 1,
//             description: 'The session has been edited.'
//           }
//         });
//       }
//     }).as('postEditedSession');







    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session');

    const sessionMock = {
      id: 123,
      name: 'My Test Session',
      date: '2025-04-25T00:00:00.000Z',
      teacher_id: 1,
      description: 'This is a test description for my session.',
      users: [],
      createdAt: '2025-04-20T10:00:00.000Z',
      updatedAt: '2025-04-21T10:00:00.000Z',
    };

    const teacherMock = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    };

    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: [sessionMock],
    }).as('getSessions');

    cy.intercept('GET', `/api/session/${sessionMock.id}`, {
      statusCode: 200,
      body: sessionMock,
    }).as('getSessionDetail');

    cy.intercept('GET', `/api/teacher/${teacherMock.id}`, {
      statusCode: 200,
      body: teacherMock,
    }).as('getTeacherDetail');


    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(`test!1234{enter}{enter}`);
    cy.url().should('include', '/sessions');
  });

  it('should create a yoga session after filling in the form and clicking save', () => {

    cy.contains('Create').click();

    // Fill in Name
    cy.get('input[formcontrolname=name]').type('My Test Session');

    // === DATE INPUT: Manual entry ===
    // Requires the date in YYYY-MM-DD format even though the format is different in the field
    cy.get('input[formControlName=date]').type('2025-04-25')

    cy.get('input[formcontrolname=date]').should('have.value', '2025-04-25');

    cy.wait('@getTeachers', { timeout: 10000 });


    // Select Teacher
    // Ensure that the teachers dropdown has been populated with the mocked data
    cy.get('mat-select[formControlName="teacher_id"]').click();

    // Wait for the options to appear in the dropdown
    cy.get('mat-option').should('have.length', 2);  // Adjust this number based on your mocked teachers

    // Select teacher "John Doe" from the dropdown
    cy.get('mat-option').contains('John Doe').click();

     // === DESCRIPTION FIELD ===
    cy.get('textarea[formControlName="description"]').type('This is a test description for my session.');

    // Ensure the value is correctly filled in the description field
    cy.get('textarea[formControlName="description"]').should('have.value', 'This is a test description for my session.');



    // Click Save button (adjust selector if needed)
    cy.contains('button', 'Save').click();

    // Wait for the save POST request to complete
    cy.wait('@postSession');

    // Assert URL navigated back to sessions list
    cy.url().should('eq', 'http://localhost:4200/sessions');

    // Check that the pop-up with the message "Session created !" appears
    cy.contains('Session created !').should('be.visible');

    // Check that the session created is now displayed
    cy.contains('My Test Session').should('be.visible');


  });

  it('should navigate to detail page after clicking Detail button on session card', () => {
    // Wait for session list to load
    cy.wait('@getSessions');

    // Click the "Detail" button inside the mat-card
    cy.contains('mat-card', 'My Test Session')
      .contains('button', 'Detail')
      .click();

    // Assert correct navigation
    cy.url().should('include', '/sessions/detail/123');

    // Wait for session and teacher detail calls
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    // Assertions
    cy.contains('h1', 'My Test Session').should('be.visible');
    cy.contains('John DOE').should('be.visible');
    cy.contains('Description:').should('be.visible');
    cy.contains('This is a test description for my session.').should('be.visible');
  });

  it('should delete the yoga session from the detail page and remove it from the session list', () => {
    // Intercept the DELETE call
    cy.intercept('DELETE', '/api/session/123', {
      statusCode: 204
    }).as('deleteSession');

    // Mock the session list after deletion as empty
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: []
    }).as('getSessionsAfterDelete');

    // Click Detail to go to the session detail page
    cy.contains('mat-card', 'My Test Session')
      .contains('button', 'Detail')
      .click();

    cy.url().should('include', '/sessions/detail/123');
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    // Click Delete button
    cy.contains('button', 'Delete').click();

    // Confirm redirection to the list page
    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.wait('@getSessionsAfterDelete');

    // Ensure the deleted session is not visible
    cy.contains('My Test Session').should('not.exist');
    cy.contains('Session deleted !').should('be.visible');

  });

  it('should navigate to the update page after clicking Edit button on session card and edit the session after modifying a form field and clicking save', () => {
    // Wait for session list
    cy.wait('@getSessions');

    // Click the "Edit" button inside the mat-card
    cy.contains('mat-card', 'My Test Session')
      .contains('button', 'Edit')
      .click();

    // Assert that we're on the update page
    cy.url().should('eq', 'http://localhost:4200/sessions/update/123');

    // Wait for detail data to be loaded
    cy.wait('@getSessionDetail');

    // Assert that the form fields are populated with the session data
    cy.get('h1').should('contain', 'Update session');
    cy.get('input[formControlName="name"]').should('have.value', 'My Test Session');
    cy.get('input[formControlName="date"]').should('have.value', '2025-04-25');
    cy.get('textarea[formControlName="description"]').should('have.value', 'This is a test description for my session.');
    cy.get('mat-select[formControlName="teacher_id"]')
      .invoke('text')
      .should('contain', 'John Doe'); // Adjust if the select shows full name in a different format

    cy.get('textarea[formControlName="description"]')
      .clear()
      .type('The session has been edited.');

      // Click Save button
      cy.contains('button', 'Save').click();

      // Wait for the save POST request to complete
      cy.wait('@putSession');

      // Assert URL navigated back to sessions list
      cy.url().should('eq', 'http://localhost:4200/sessions');

      // Check that the pop-up with the message "Session created !" appears
      cy.contains('Session updated !').should('be.visible');


  });

  it('should navigate to account page when clicking Account then beck to home page when clicking Sessions', () => {
    // Make sure we're on the sessions page first (login done in beforeEach)
    cy.url().should('include', '/sessions');

    // Click the "Account" link or button
    cy.contains('Account').click();

    // Assert that the URL is correct
    cy.url().should('eq', 'http://localhost:4200/me');

    // Optionally, assert something specific to the account page
    cy.contains('User information').should('be.visible');

    // Navigate away first to simulate being on another page
    cy.contains('Account').click();
    cy.url().should('eq', 'http://localhost:4200/me');

    // Click the "Sessions" link in the navbar
    cy.contains('Sessions').click();

    // Assert that we're back on the sessions page
    cy.url().should('eq', 'http://localhost:4200/sessions');

    // Optionally check if the session list is visible
    cy.contains('Rentals available').should('be.visible');
  });

  it('should log out and redirect to page with login and register links', () => {
    // Ensure we're logged in and on the sessions page
    cy.url().should('include', '/sessions');

    // Click the "Logout" button in the navbar
    cy.contains('Logout').click();

    // Should redirect to homepage
    cy.url().should('eq', 'http://localhost:4200/');

    // Check that Login and Register buttons are visible
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });



});

