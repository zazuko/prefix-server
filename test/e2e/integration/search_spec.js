/* eslint-disable cypress/no-unnecessary-waiting */

const collectResults = (result) => {
  const results = Cypress._
    .chain(result)
    .map('textContent')
    .map(x => x.trim())
    .value()
  cy.wrap(results).snapshot()
}

const searchField = () => cy.get('.search-field-container input')
const suggestionList = () => cy.get('.autocomplete .results')
const suggestedElements = () => cy.get('.autocomplete .results li')
const keys = {
  generic: x => cy.focused().trigger('keydown', { keyCode: x, which: x }),
  downArrow: () => keys.generic(40),
  upArrow: () => keys.generic(38),
  repeat (what, count, time = 10) {
    for (let i = 0; i < count; i++) {
      what()
      cy.wait(time)
    }
  }
}

describe('Search', () => {
  beforeEach(() => {
    cy.visit('/')
    searchField().focus().clear()
  })

  it('should be available on homepage', () => {
    searchField().type('rdau:P608')
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
    suggestionList().should('not.be.visible')

    searchField().type('Person')
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
    suggestionList().should('not.be.visible')

    searchField().type('rdfs')
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
    suggestionList().should('not.be.visible')
  })

  it('should navigate results with keyboard', () => {
    searchField().type('schema:P')
    suggestionList().should('be.visible')
    keys.repeat(keys.downArrow, 6)
    cy.focused().contains('schema:ParentAudience')
    keys.repeat(keys.upArrow, 3)
    keys.downArrow()
    cy.focused().contains('schema:ParcelDelivery')
    keys.upArrow()
    keys.downArrow()
    keys.upArrow()
    cy.focused().contains('schema:Paperback')
    cy.focused().click()
    cy.url().should('equal', 'http://localhost:3000/schema:Paperback')
  })

  it('should navigate to a single prefix', () => {
    searchField().type('rdfs:')
    suggestionList().should('be.visible')
    keys.downArrow()
    cy.focused().click()
    cy.url().should('equal', 'http://localhost:3000/prefix/rdfs:')
  })

  it('should redirect to the correct form of existing terms', () => {
    searchField().type('schema:persON')
    suggestionList().should('be.visible')
    cy.get('form').submit()
    cy.url().should('equal', 'http://localhost:3000/schema:Person')
  })

  const searchTerms = ['schema:Lol', 'schema:', 'foo']

  searchTerms.forEach((term) => {
    it(`should search for ${term} on submit, redirect and display suggestions`, () => {
      searchField().type(term)
      suggestionList().should('be.visible')
      cy.get('form').submit()
      suggestionList().should('be.visible')
      cy.url().should('equal', `http://localhost:3000/${term}`)
    })
  })

  it('should be case sensitive', () => {
    searchField().type('qb:Slice')
    cy.get('form').submit()
    cy.url().should('equal', 'http://localhost:3000/qb:Slice')
    cy.get('.main-results section').invoke('text').then((foo) => {
      searchField().type('qb:slice')
      cy.get('form').submit()
      cy.url().should('equal', 'http://localhost:3000/qb:slice')
      cy.wait(500)
      cy.get('.main-results section').invoke('text').then((bar) => {
        expect(foo).not.to.equal(bar)
      })
    })
  })
})
