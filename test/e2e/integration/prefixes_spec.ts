const collectResults = (result: JQuery<HTMLElement>): string[] =>
  Array.from(result, element => (element.textContent ?? '').trim().split(':')[0] ?? '')

describe('Prefixes', () => {
  beforeEach(() => {
    cy.visit('/prefixes')
  })

  it('should list prefixes in alphabetical order', () => {
    cy.get('#prefixes li')
      .then(collectResults)
      .then((list) => {
        expect(list).to.deep.equal(Cypress._.sortBy(list))
      })
  })

  it('should lead to a single prefix', () => {
    cy.get('#prefixes li').first().click()
    cy.url().should('include', '/prefix/')
  })

  it('should redirect missing prefix', () => {
    cy.visit('/prefix/')
    cy.url().should('include', '/prefixes')
  })

  it('should redirect prefixes that do not end with `:`', () => {
    cy.visit('/prefix/schema')
    cy.url().should('include', '/prefix/schema:')
    cy.visit('/prefix/foobarbaz', { failOnStatusCode: false })
    cy.url().should('include', '/prefix/foobarbaz:')
  })

  it('should 404 unknown prefixes', () => {
    cy.visit('/prefix/hahaha:', { failOnStatusCode: false }).then(() => {
      cy.get('.content-container > h1').invoke('text').then((text) => {
        expect(text).to.equal('404')
      })
    })
  })

  it('should list classes and properties of a single prefix', () => {
    cy.get('#prefixes li').first().click()
    cy.get('h1 > code').invoke('text').then((prefix) => {
      cy.url().should('include', `/prefix/${prefix}`)
    })
    cy.get('#rdfs-class ul li').then((list) => {
      expect(list).to.have.length.of.at.least(1)
    })
    cy.get('#rdf-property ul li').then((list) => {
      expect(list).to.have.length.of.at.least(1)
    })
  })

  it('should lead to individual terms', () => {
    cy.get('#prefixes li').first().click()
    cy.get('h1 > code').invoke('text').then(() => {
      cy.get('#rdfs-class ul li').first().invoke('text').then((term) => {
        cy.get('#rdfs-class ul li').first().find('a').click()
        cy.url().should('include', term.trim().split(' ')[0])
      })
    })
  })
})
