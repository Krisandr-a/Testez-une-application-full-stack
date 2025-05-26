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
});
