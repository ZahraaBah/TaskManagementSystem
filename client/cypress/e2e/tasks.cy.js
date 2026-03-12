describe('Tasks Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');
    cy.visit('http://localhost:5173/login');
    cy.get('input[type="email"]').type('23099@supnum.mr');
    cy.get('input[type="password"]').type('12345678');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url({ timeout: 10000 }).should('include', '/tasks');
  });

  it('should display tasks page', () => {
    cy.contains('My Tasks', { timeout: 10000 }).should('be.visible');
  });

  it('should create a new task', () => {
    cy.intercept('POST', '**/tasks').as('createTask');
    cy.contains('My Tasks').should('be.visible');
    cy.get('[data-testid="title-input"]').type('New E2E Task');
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@createTask');
    cy.contains('New E2E Task', { timeout: 10000 }).should('be.visible');
  });
});