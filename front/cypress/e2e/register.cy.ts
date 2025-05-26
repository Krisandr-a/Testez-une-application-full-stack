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
});
