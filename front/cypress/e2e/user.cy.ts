describe('End-to-end non-admin user spec', () => {
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
        admin: false,
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

  it('should navigate to sessions page after logging in', () => {
    // Make sure we're on the sessions page first (login done in beforeEach)
    cy.url().should('include', '/sessions');

    cy.contains('Rentals available').should('be.visible');
  });

  it('should navigate to account page when clicking Account then beck to home page when clicking Sessions', () => {
    // Make sure we're on the sessions page first (login done in beforeEach)
    cy.url().should('include', '/sessions');

    // Click the "Account" link or button
    cy.contains('Account').click();

    // Assert that the URL is correct
    cy.url().should('include', '/me');

    // Optionally, assert something specific to the account page
    cy.contains('User information').should('be.visible');

    // Navigate away first to simulate being on another page
    cy.contains('Account').click();
    cy.url().should('include', '/me');

    // Click the "Sessions" link in the navbar
    cy.contains('Sessions').click();

    // Assert that we're back on the sessions page
    cy.url().should('eq', 'http://localhost:4200/sessions');

    // Optionally check if the session list is visible
    cy.contains('Rentals available').should('be.visible');
  });

  it('should navigate to detail page after clicking Detail button on session card', () => {
    // Wait for session list to load
    cy.wait('@getSessions');

    // Click the "Detail" button inside the mat-card
    cy.contains('mat-card', 'My Test Session')
      .contains('button', 'Detail')
      .click();

    // Assert correct navigation
    cy.url().should('include', '/sessions/detail');

    // Wait for session and teacher detail calls
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    // Assertions
    cy.contains('h1', 'My Test Session').should('be.visible');
    cy.contains('John DOE').should('be.visible');
    cy.contains('Description:').should('be.visible');
    cy.contains('This is a test description for my session.').should('be.visible');
  });


  it('should participate in a session and then cancel participation', () => {
    const sessionId = 123;
    const userId = 1;

    // Wait for session list and go to detail page
    cy.wait('@getSessions');
    cy.contains('mat-card', 'My Test Session').contains('button', 'Detail').click();
    cy.url().should('include', `/sessions/detail/${sessionId}`);
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    cy.contains('Description:').should('be.visible');

    // Intercept the participate POST and updated GET session with 1 user
    cy.intercept('POST', `/api/session/${sessionId}/participate/${userId}`, {
      statusCode: 200
    }).as('postParticipate');

    const sessionWithOneUser = {
      id: sessionId,
      name: 'My Test Session',
      date: '2025-04-25T00:00:00.000Z',
      teacher_id: 1,
      description: 'This is a test description for my session.',
      users: [userId],  // <-- Changed here: just an array of user IDs, not user objects
      createdAt: '2025-04-20T10:00:00.000Z',
      updatedAt: '2025-04-21T10:00:00.000Z',
    };

    cy.intercept('GET', `/api/session/${sessionId}`, {
      statusCode: 200,
      body: sessionWithOneUser,
    }).as('getSessionAfterParticipate');

    // Click "Participate"
    cy.contains('button', 'Participate').click();

    cy.wait('@postParticipate');
    cy.wait('@getSessionAfterParticipate');

    cy.contains('1 attendees').should('be.visible');
    cy.contains('button', 'Do not participate').should('be.visible');

  // Intercept the unParticipate DELETE request (not POST)
  cy.intercept('DELETE', `/api/session/${sessionId}/participate/${userId}`, {
    statusCode: 200
  }).as('postUnParticipate');


    const sessionWithZeroUsers = {
      ...sessionWithOneUser,
      users: []
    };

    cy.intercept('GET', `/api/session/${sessionId}`, {
      statusCode: 200,
      body: sessionWithZeroUsers,
    }).as('getSessionAfterUnParticipate');

    // Click "Do not participate"
    cy.contains('button', 'Do not participate').click();

    cy.wait('@postUnParticipate');
    cy.wait('@getSessionAfterUnParticipate');

    cy.contains('0 attendees').should('be.visible');
    cy.contains('button', 'Participate').should('be.visible');
  });







  it('should log out and redirect to page with login and register links', () => {
    // Ensure we're logged in and on the sessions page
    cy.url().should('include', '/sessions');

    // Click the "Logout" button in the navbar
    cy.contains('Logout').click();

    // Should redirect to homepage
    cy.url().should('include', '/');

    // Check that Login and Register buttons are visible
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });

});

