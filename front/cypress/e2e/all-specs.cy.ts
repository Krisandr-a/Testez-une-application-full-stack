// cypress/e2e/all-roles.cy.ts

// ---------- Account creation flow ----------
describe('Register spec', () => {
  it('Register successful', () => {
    cy.visit('/register') // Simulates user navigating to /register page

    // Intercepts the registration request and mocks a successful response
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        id: 2,
        username: 'newUser',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com'
      },
    }).as('register')

    // Simulates user input
    cy.get('input[formControlName=firstName]').type("New")
    cy.get('input[formControlName=lastName]').type("User")
    cy.get('input[formControlName=email]').type("newuser@example.com")
    cy.get('input[formControlName=password]').type(`${"Testpassword"}{enter}{enter}`)

    // Waits for the intercepted request to ensure it was called
    cy.wait('@register')

    // Verifies the user is redirected to login after successful registration
    cy.url().should('include', '/login')
  })

  // --- Submit disabled & NO request when any required field is missing ---

  it('keeps Submit disabled & sends no request when first name is empty', () => {
    cy.visit('/register');
    cy.intercept({ method: 'POST', url: '**/api/auth/register*' }).as('regSpy');

    cy.get('input[formControlName=lastName]').type('User');
    cy.get('input[formControlName=email]').type('newuser@example.com');
    cy.get('input[formControlName=password]').type('ValidPass1!');

    cy.get('button[type=submit]').should('be.disabled');
    cy.get('@regSpy.all').should('have.length', 0);
  });

  it('keeps Submit disabled & sends no request when last name is empty', () => {
    cy.visit('/register');
    cy.intercept({ method: 'POST', url: '**/api/auth/register*' }).as('regSpy');

    cy.get('input[formControlName=firstName]').type('New');
    cy.get('input[formControlName=email]').type('newuser@example.com');
    cy.get('input[formControlName=password]').type('ValidPass1!');

    cy.get('button[type=submit]').should('be.disabled');
    cy.get('@regSpy.all').should('have.length', 0);
  });

  it('keeps Submit disabled & sends no request when email is empty', () => {
    cy.visit('/register');
    cy.intercept({ method: 'POST', url: '**/api/auth/register*' }).as('regSpy');

    cy.get('input[formControlName=firstName]').type('New');
    cy.get('input[formControlName=lastName]').type('User');
    cy.get('input[formControlName=password]').type('ValidPass1!');

    cy.get('button[type=submit]').should('be.disabled');
    cy.get('@regSpy.all').should('have.length', 0);
  });

  it('keeps Submit disabled & sends no request when password is empty', () => {
    cy.visit('/register');
    cy.intercept({ method: 'POST', url: '**/api/auth/register*' }).as('regSpy');

    cy.get('input[formControlName=firstName]').type('New');
    cy.get('input[formControlName=lastName]').type('User');
    cy.get('input[formControlName=email]').type('newuser@example.com');

    cy.get('button[type=submit]').should('be.disabled');
    cy.get('@regSpy.all').should('have.length', 0);
  });
});

// ---------- Login flow ----------
describe('Login spec', () => {
  it('Login successfull', () => {
    cy.visit('/login') // sims user navigating to /login page

    // intercepts HTTP requests made by the app
    // and responds with a mock SessionInformation object
    // simulating a successful login
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    // Intercepts the GET request before it hits the backend
    // and returns an empty array/
    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session') // Creates an alias for the intercepted call. Refer to request in tests as @session

    // Simulates user input.
    // cy.get finds DOM elements on page.
    // formControlName is an Angular directive, and you select the inputs by their formControlName
    // attributes: email and password.
    // type(): simulates typing into the fields
    // {enter}{enter}: by simulating pressing enter twice, that simulates pressing the Submit button
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    // cy.url: gets current URL.
    // .should('include', '/sessions') is an assertion to verify that the URL now includes /sessions.
    // This confirms that after submitting the form, the user is successfully redirected
    // to the sessions page (indicating a successful login).
    cy.url().should('include', '/sessions')
  })

  it('shows an error on wrong credentials', () => {
    cy.visit('/login');

    // Match regardless of host/trailing slash
    cy.intercept(
      { method: 'POST', url: '**/api/auth/login*' },
      { statusCode: 401, body: { message: 'Bad credentials' } }
    ).as('badLogin');

    // Fill with values that PASS client-side validators but are still wrong
    cy.get('[formControlName=email]').type('yoga@studio.com');
    cy.get('[formControlName=password]').type('WrongPass1!'); // valid-looking

    // Ensure the submit is enabled, then click (more reliable than {enter})
    cy.get('button[type=submit]').should('not.be.disabled').click();

    // Now the request should happen
    cy.wait('@badLogin');

    // Assert UI error and no redirect
    cy.contains(/an error occurred/i).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('keeps Submit disabled and sends no request when email is empty', () => {
    cy.visit('/login');
    cy.intercept({ method: 'POST', url: '**/api/auth/login*' }).as('loginSpy');

    cy.get('[formControlName=password]').type('ValidPass1!');
    cy.get('button[type=submit]').should('be.disabled');

    // give the app a brief moment; should not fire any request
    cy.wait(200);
    cy.get('@loginSpy.all').should('have.length', 0);
  });

  it('keeps Submit disabled and sends no request when password is empty', () => {
    cy.visit('/login');
    cy.intercept({ method: 'POST', url: '**/api/auth/login*' }).as('loginSpy');

    cy.get('[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    cy.wait(200);
    cy.get('@loginSpy.all').should('have.length', 0);
  });



});

// ---------- Admin flow ----------
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

    cy.intercept({ method: 'GET', url: '/api/session' }, []).as('session');

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

    const teacherMock = { id: 1, firstName: 'John', lastName: 'Doe' };

    cy.intercept('GET', '/api/session', { statusCode: 200, body: [sessionMock] }).as('getSessions');
    cy.intercept('GET', `/api/session/${sessionMock.id}`, { statusCode: 200, body: sessionMock }).as('getSessionDetail');
    cy.intercept('GET', `/api/teacher/${teacherMock.id}`, { statusCode: 200, body: teacherMock }).as('getTeacherDetail');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(`test!1234{enter}{enter}`);
    cy.url().should('include', '/sessions');
  });

  it('creates a session', () => {
    cy.contains('Create').click();

    cy.get('input[formcontrolname=name]').type('My Test Session');
    cy.get('input[formControlName=date]').type('2025-04-25');
    cy.get('input[formcontrolname=date]').should('have.value', '2025-04-25');

    cy.wait('@getTeachers', { timeout: 10000 });

    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').should('have.length', 2);
    cy.get('mat-option').contains('John Doe').click();

    cy.get('textarea[formControlName="description"]').type('This is a test description for my session.')
      .should('have.value', 'This is a test description for my session.');

    cy.contains('button', 'Save').click();
    cy.wait('@postSession');

    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.contains('Session created !').should('be.visible');
    cy.contains('My Test Session').should('be.visible');
  });

  it('create session keeps Save disabled & sends no request when name is missing', () => {
    cy.contains('button', 'Create').click();

    // Fill all except name
    cy.get('input[formControlName=date]').type('2025-04-25');
    cy.wait('@getTeachers', { timeout: 10000 });
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').contains('John Doe').click();
    cy.get('textarea[formControlName="description"]').type('Desc…');

    // Save must be disabled; no POST should have fired
    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@postSession.all').should('have.length', 0);
  });

  it('create session keeps Save disabled & sends no request when date is missing', () => {
    cy.contains('button', 'Create').click();

    // Fill all except date
    cy.get('input[formControlName=name]').type('My Test Session');
    cy.wait('@getTeachers', { timeout: 10000 });
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').contains('John Doe').click();
    cy.get('textarea[formControlName="description"]').type('Desc…');

    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@postSession.all').should('have.length', 0);
  });

  it('create session keeps Save disabled & sends no request when teacher is missing', () => {
    cy.contains('button', 'Create').click();

    // Fill all except teacher
    cy.get('input[formControlName=name]').type('My Test Session');
    cy.get('input[formControlName=date]').type('2025-04-25');
    cy.get('textarea[formControlName="description"]').type('Desc…');

    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@postSession.all').should('have.length', 0);
  });

  it('create session keeps Save disabled & sends no request when description is missing', () => {
    cy.contains('button', 'Create').click();

    // Fill all except description
    cy.get('input[formControlName=name]').type('My Test Session');
    cy.get('input[formControlName=date]').type('2025-04-25');
    cy.wait('@getTeachers', { timeout: 10000 });
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').contains('John Doe').click();

    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@postSession.all').should('have.length', 0);
  });


  it('navigates to detail from card', () => {
    cy.wait('@getSessions');

    cy.contains('mat-card', 'My Test Session').contains('button', 'Detail').click();

    cy.url().should('include', '/sessions/detail/123');
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    cy.contains('h1', 'My Test Session').should('be.visible');
    cy.contains('John DOE').should('be.visible');
    cy.contains('Description:').should('be.visible');
    cy.contains('This is a test description for my session.').should('be.visible');
  });

  it('deletes a session', () => {
    cy.intercept('DELETE', '/api/session/123', { statusCode: 204 }).as('deleteSession');
    cy.intercept('GET', '/api/session', { statusCode: 200, body: [] }).as('getSessionsAfterDelete');

    cy.contains('mat-card', 'My Test Session').contains('button', 'Detail').click();
    cy.url().should('include', '/sessions/detail/123');
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    cy.contains('button', 'Delete').click();

    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.wait('@getSessionsAfterDelete');

    cy.contains('My Test Session').should('not.exist');
    cy.contains('Session deleted !').should('be.visible');
  });

  it('edits a session', () => {
    cy.wait('@getSessions');

    cy.contains('mat-card', 'My Test Session').contains('button', 'Edit').click();
    cy.url().should('eq', 'http://localhost:4200/sessions/update/123');

    cy.wait('@getSessionDetail');

    cy.get('h1').should('contain', 'Update session');
    cy.get('input[formControlName="name"]').should('have.value', 'My Test Session');
    cy.get('input[formControlName="date"]').should('have.value', '2025-04-25');
    cy.get('textarea[formControlName="description"]').should('have.value', 'This is a test description for my session.');
    cy.get('mat-select[formControlName="teacher_id"]').invoke('text').should('contain', 'John Doe');

    cy.get('textarea[formControlName="description"]').clear().type('The session has been edited.');
    cy.contains('button', 'Save').click();

    cy.wait('@putSession');
    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.contains('Session updated !').should('be.visible');
  });

  it('edit session keeps Save disabled & sends no request when name is missing', () => {
    // Go to Edit page
    cy.wait('@getSessions');
    cy.contains('mat-card', 'My Test Session').contains('button', 'Edit').click();
    cy.url().should('eq', 'http://localhost:4200/sessions/update/123');
    cy.wait('@getSessionDetail');

    // Clear required field
    cy.get('input[formControlName="name"]').type('{selectAll}{backspace}');

    // Save must be disabled; no POST should have fired
    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@putSession.all').should('have.length', 0);
  });

  it('edit session keeps Save disabled & sends no request when description is missing', () => {
    cy.wait('@getSessions');
    cy.contains('mat-card', 'My Test Session').contains('button', 'Edit').click();
    cy.url().should('eq', 'http://localhost:4200/sessions/update/123');
    cy.wait('@getSessionDetail');

    cy.get('textarea[formControlName="description"]').clear();

    cy.contains('button', 'Save').should('be.disabled');
    cy.get('@putSession.all').should('have.length', 0);
  });

  it('navigates Account ⇄ Sessions and logs out', () => {
    cy.url().should('include', '/sessions');

    cy.contains('Account').click();
    cy.url().should('eq', 'http://localhost:4200/me');
    cy.contains('User information').should('be.visible');

    cy.contains('Account').click();
    cy.url().should('eq', 'http://localhost:4200/me');

    cy.contains('Sessions').click();
    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.contains('Rentals available').should('be.visible');

    cy.contains('Logout').click();
    cy.url().should('eq', 'http://localhost:4200/');
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });
});

// ---------- Non-admin (user) flow ----------
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

    cy.intercept({ method: 'GET', url: '/api/session' }, []).as('session');

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

    const teacherMock = { id: 1, firstName: 'John', lastName: 'Doe' };

    cy.intercept('GET', '/api/session', { statusCode: 200, body: [sessionMock] }).as('getSessions');
    cy.intercept('GET', `/api/session/${sessionMock.id}`, { statusCode: 200, body: sessionMock }).as('getSessionDetail');
    cy.intercept('GET', `/api/teacher/${teacherMock.id}`, { statusCode: 200, body: teacherMock }).as('getTeacherDetail');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(`test!1234{enter}{enter}`);
    cy.url().should('include', '/sessions');
  });

  it('lands on sessions after login', () => {
    cy.contains('Rentals available').should('be.visible');
  });

  it('navigates Account ⇄ Sessions', () => {
    cy.contains('Account').click();
    cy.url().should('include', '/me');
    cy.contains('User information').should('be.visible');

    cy.contains('Account').click();
    cy.url().should('include', '/me');

    cy.contains('Sessions').click();
    cy.url().should('eq', 'http://localhost:4200/sessions');
    cy.contains('Rentals available').should('be.visible');
  });

  it('opens session detail', () => {
    cy.wait('@getSessions');

    cy.contains('mat-card', 'My Test Session')
      .contains('button', 'Detail')
      .click();

    cy.url().should('include', '/sessions/detail');
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    cy.contains('h1', 'My Test Session').should('be.visible');
    cy.contains('John DOE').should('be.visible');
    cy.contains('Description:').should('be.visible');
    cy.contains('This is a test description for my session.').should('be.visible');
  });

  it('participates then cancels participation', () => {
    const sessionId = 123;
    const userId = 1;

    cy.wait('@getSessions');
    cy.contains('mat-card', 'My Test Session').contains('button', 'Detail').click();
    cy.url().should('include', `/sessions/detail/${sessionId}`);
    cy.wait('@getSessionDetail');
    cy.wait('@getTeacherDetail');

    cy.contains('Description:').should('be.visible');

    cy.intercept('POST', `/api/session/${sessionId}/participate/${userId}`, { statusCode: 200 }).as('postParticipate');

    const sessionWithOneUser = {
      id: sessionId,
      name: 'My Test Session',
      date: '2025-04-25T00:00:00.000Z',
      teacher_id: 1,
      description: 'This is a test description for my session.',
      users: [userId],
      createdAt: '2025-04-20T10:00:00.000Z',
      updatedAt: '2025-04-21T10:00:00.000Z',
    };

    cy.intercept('GET', `/api/session/${sessionId}`, { statusCode: 200, body: sessionWithOneUser }).as('getSessionAfterParticipate');

    cy.contains('button', 'Participate').click();
    cy.wait('@postParticipate');
    cy.wait('@getSessionAfterParticipate');
    cy.contains('1 attendees').should('be.visible');
    cy.contains('button', 'Do not participate').should('be.visible');

    cy.intercept('DELETE', `/api/session/${sessionId}/participate/${userId}`, { statusCode: 200 }).as('postUnParticipate');

    const sessionWithZeroUsers = { ...sessionWithOneUser, users: [] };
    cy.intercept('GET', `/api/session/${sessionId}`, { statusCode: 200, body: sessionWithZeroUsers }).as('getSessionAfterUnParticipate');

    cy.contains('button', 'Do not participate').click();
    cy.wait('@postUnParticipate');
    cy.wait('@getSessionAfterUnParticipate');

    cy.contains('0 attendees').should('be.visible');
    cy.contains('button', 'Participate').should('be.visible');
  });

  it('logs out', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/');
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });
});
