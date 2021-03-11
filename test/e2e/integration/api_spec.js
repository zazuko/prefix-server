describe('/api/v1', () => {
  it('/health', () => {
    cy.request('/api/v1/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.eq('ok')
    })
  })

  describe('/expand', () => {
    it('should fail on bad requests', () => {
      cy.request({
        url: '/api/v1/expand?q=',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.deep.equal({ help: '/api/v1/expand?q=…' })
      })
      cy.request({
        url: '/api/v1/expand',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.deep.equal({ help: '/api/v1/expand?q=…' })
      })
    })

    it('should succeed with expandable prefixes', () => {
      cy.request('/api/v1/expand?q=schema:Person').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal({ success: true, value: 'http://schema.org/Person' })
      })
      cy.request('/api/v1/expand?q=rdfs:Class').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal({ success: true, value: 'http://www.w3.org/2000/01/rdf-schema#Class' })
      })
    })
  })

  describe('/shrink', () => {
    it('should fail on bad requests', () => {
      cy.request({
        url: '/api/v1/shrink?q=',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.deep.equal({ help: '/api/v1/shrink?q=…' })
      })
      cy.request({
        url: '/api/v1/shrink',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.deep.equal({ help: '/api/v1/shrink?q=…' })
      })
    })

    it('should succeed with shrinkable prefixes', () => {
      cy.request('/api/v1/shrink?q=http://schema.org/Person').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal({ success: true, value: 'schema:Person' })
      })
      const iri = 'http://www.w3.org/2000/01/rdf-schema#Class'
      const encodedIRI = encodeURIComponent(iri)
      cy.request(`/api/v1/shrink?q=${encodedIRI}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal({ success: true, value: 'rdfs:Class' })
      })
    })

    it('should fail with non-shrinkable prefixes', () => {
      cy.request({
        url: '/api/v1/shrink?q=http://example.org/Person',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.deep.equal({ success: false })
      })
      const iri = 'http://www.w3.org/2000/01/rdf-schema#Class'
      cy.request({
        url: `/api/v1/shrink?q=${iri}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.deep.equal({ success: false })
      })
    })
  })

  describe('/suggest', () => {
    it('should suggest empty', () => {
      cy.request('/api/v1/suggest?q=').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal([])
      })
    })
    it('should suggest results', () => {
      cy.request('/api/v1/suggest?q=Person').then((response) => {
        expect(response.status).to.eq(200)
        response.body.slice(0, 8).forEach((term) => {
          expect(term.toLowerCase()).to.contain('person')
        })
      })
      cy.request('/api/v1/suggest?q=person').then((response) => {
        expect(response.status).to.eq(200)
        response.body.slice(0, 8).forEach((term) => {
          expect(term.toLowerCase()).to.contain('person')
        })
      })
    })
  })

  describe('/autocomplete', () => {
    it('should suggest prefixes starting with query', () => {
      cy.request('/api/v1/autocomplete?q=').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('rdf:')
        expect(response.body).to.contain('schema:')
        expect(response.body).to.contain('xsd:')
      })
      cy.request('/api/v1/autocomplete?q=r').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.filter(p => p.startsWith('r'))).to.have.length(response.body.length)
      })
    })
    it('should be case insensitive', () => {
      cy.request('/api/v1/autocomplete?q=schema:a').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('schema:about')
        expect(response.body).to.contain('schema:AboutPage')
      })
    })
    it('should be case sensitive', () => {
      cy.request('/api/v1/autocomplete?q=schema:a&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('schema:about')
        expect(response.body).not.to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:A&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).not.to.contain('schema:about')
        expect(response.body).to.contain('schema:AboutPage')
      })
    })
    it('should match type', () => {
      cy.request('/api/v1/autocomplete?q=schema:a&type=rdf:Property').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('schema:about')
        expect(response.body).not.to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:A&type=rdfs:Class').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).not.to.contain('schema:about')
        expect(response.body).to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:a&type=rdf:property').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('schema:about')
        expect(response.body).not.to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:A&type=rdfs:class').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).not.to.contain('schema:about')
        expect(response.body).to.contain('schema:AboutPage')
      })
    })
    it('should match type and case', () => {
      cy.request('/api/v1/autocomplete?q=schema:a&type=rdf:Property&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('schema:about')
        expect(response.body).not.to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:A&type=rdfs:Class&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).not.to.contain('schema:about')
        expect(response.body).to.contain('schema:AboutPage')
      })
      cy.request('/api/v1/autocomplete?q=schema:a&type=rdfs:Class&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(0)
      })
      cy.request('/api/v1/autocomplete?q=schema:A&type=rdf:Property&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(0)
      })
      cy.request('/api/v1/autocomplete?q=schema:a&type=rdf:property&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(0)
      })
      cy.request('/api/v1/autocomplete?q=schema:A&type=rdfs:class&case=true').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(0)
      })
    })
    describe('expands', () => {
      it('prefixes starting with query', () => {
        cy.request('/api/v1/autocomplete?q=rd&expand=true').then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.contain('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          expect(response.body).to.contain('http://www.w3.org/2000/01/rdf-schema#')
        })
      })
      it('case sensitive', () => {
        cy.request('/api/v1/autocomplete?expand=true&q=schema:a&case=true').then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.contain('http://schema.org/about')
          expect(response.body).not.to.contain('http://schema.org/AboutPage')
        })
      })
      it('match type and case', () => {
        cy.request('/api/v1/autocomplete?q=schema:a&type=rdf:Property&expand=true&case=true').then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.contain('http://schema.org/about')
          expect(response.body).not.to.contain('http://schema.org/AboutPage')
        })
      })
    })
  })
})
