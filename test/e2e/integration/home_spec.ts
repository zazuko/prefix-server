const searchField = () => cy.get('.search-field-container input')

describe('Home', () => {
  before(() => {
    cy.visit('/')
  })
  beforeEach(() => {
    searchField().focus().clear()
  })

  it('should redirect /namespaces to /prefixes', () => {
    cy.visit('/namespaces')
    cy.url().should('include', '/prefixes')
  })
})
