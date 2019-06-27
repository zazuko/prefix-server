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
  before(() => {
    cy.visit('/')
  })
  beforeEach(() => {
    searchField().clear()
  })

  it('should be available on homepage', () => {
    searchField().type('rdau:P608')
    cy.wait(500)
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
    suggestionList().should('not.be.visible')

    searchField().type('Person')
    cy.wait(1500)
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
    suggestionList().should('not.be.visible')

    searchField().type('rdfs')
    cy.wait(1500)
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
    cy.url().should('include', '/schema:Paperback')
  })
})
