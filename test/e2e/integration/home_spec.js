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
const suggestionList = () => cy.get('div.v-list')
const suggestedElements = () => cy.get('div.v-list .v-list__tile__title')
const highlightedResult = () => cy.get('div.v-list .v-list__tile--highlighted .v-list__tile__title')

describe('Search', () => {
  before(() => {
    cy.visit('/')
  })
  beforeEach(() => {
    searchField().clear()
  })

  it('should be available on homepage', () => {
    searchField().type('schema:')
    cy.wait(500)
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()

    searchField().type('Person')
    cy.wait(1500)
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()

    searchField().type('rdfs')
    cy.wait(1500)
    suggestionList().should('be.visible')
    suggestedElements().then(collectResults)
    searchField().clear()
  })

  it('should navigate results with keyboard', () => {
    searchField().type('schema:P')
    suggestionList().should('be.visible')
    searchField().type('{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}')
    highlightedResult().contains('schema:ParentAudience')
    searchField().type('{uparrow}{uparrow}{uparrow}{downarrow}')
    highlightedResult().contains('schema:ParcelDelivery')
    searchField().type('{uparrow}{downarrow}{uparrow}')
    highlightedResult().contains('schema:Paperback')
    searchField().type('{enter}')
    cy.url().should('include', '/schema:Paperback')
  })
})
