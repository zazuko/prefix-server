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
        expect(response.body).to.deep.equal([
          'as:Person',
          'foaf:Person',
          'foaf:PersonalProfileDocument',
          'prov:Person',
          'schema:Person',
          'org:hasMember',
          'org:headOf',
          'org:member',
          'org:memberOf',
          'ma:Person'
        ])
      })
      cy.request('/api/v1/suggest?q=person').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal([
          'foaf:mbox',
          'frbr:Person',
          'qudt:HypersonicAerodynamicsQuantityKind',
          'dcterms:rightsHolder',
          'foaf:Person',
          'foaf:PersonalProfileDocument',
          'foaf:knows',
          'ma:Agent',
          'schema:Person',
          'schema:athlete'
        ])
      })
    })
  })
})
