describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign in');
  });

  it('should show error with invalid credentials', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');
    cy.get('input[type="email"]').clear().type('wrong@example.com');
    cy.get('input[type="password"]').clear().type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');
  });

  it('should redirect to tasks after successful login', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');
    cy.get('input[type="email"]').clear().type('23099@supnum.mr');
    cy.get('input[type="password"]').clear().type('12345678');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url({ timeout: 10000 }).should('include', '/tasks');
    cy.contains('My Tasks', { timeout: 10000 }).should('be.visible');
  });
});