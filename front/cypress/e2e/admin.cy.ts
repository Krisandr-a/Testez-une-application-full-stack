describe('Create yoga class as admin spec', () => {
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

    // Intercept the POST request for saving session to mock response
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

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session');

//     // Mock the session list with a test session
//     cy.intercept('GET', '/api/session', {
//       statusCode: 200,
//       body: [
//         {
//           id: 123,
//           name: 'Mock Yoga Session',
//           date: '2025-04-30T00:00:00.000Z',
//           description: 'A relaxing mock session for testing.',
//         },
//       ],
//     }).as('getSessions');

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




});

