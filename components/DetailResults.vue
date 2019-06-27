<template>
  <section class="grid">
    <template v-for="predicate in predicates.importantPredicates">
      <template v-if="predicates.prefixedPredicates[predicate]">
        <div :key="predicate" class="row">
          <predicate :term="predicate" />
          <terms :terms="predicates.prefixedPredicates[predicate]" />
        </div>
      </template>
    </template>

    <template v-for="item in predicates.sortedPrefixedPredicates">
      <div :key="item.predicate" class="row">
        <predicate :term="item.predicate" />
        <terms :terms="item.values" />
      </div>
    </template>

    <template v-for="item in predicates.sortedIriPredicates">
      <div :key="item.predicate" class="row">
        <predicate :term="item.predicate" />
        <terms :terms="item.values" />
      </div>
    </template>
  </section>
</template>

<script>
import _sortBy from 'lodash/sortBy'
import Predicate from '@/components/Predicate'
import Terms from '@/components/Terms'

const importantPredicates = [
  'rdf:type',
  'rdfs:label',
  'skos:prefLabel',
  'rdfs:comment',
  'skos:definition',
  'rdfs:domain',
  'schema:domainIncludes',
  'rdfs:range',
  'schema:rangeIncludes',
  'rdfs:subPropertyOf',
  'rdfs:subClassOf',
  'owl:inverseOf',
  'owl:equivalentProperty',
  'owl:equivalentClass'
]

export default {
  name: 'DetailResults',
  components: {
    Predicate,
    Terms
  },
  props: {
    model: {
      type: Object,
      required: true
    }
  },
  computed: {
    predicates () {
      const [prefixedPredicates, iriPredicates] = this.model.parts
        .reduce(([prefixedPredicates, iriPredicates], field) => {
          if (field.predicate !== field.predicateIRI) {
            if (!prefixedPredicates[field.predicate]) {
              prefixedPredicates[field.predicate] = []
            }
            prefixedPredicates[field.predicate].push(field)
          }
          else {
            if (!iriPredicates[field.predicate]) {
              iriPredicates[field.predicate] = []
            }
            iriPredicates[field.predicate].push(field)
          }
          return [prefixedPredicates, iriPredicates]
        }, [{}, {}])

      const sortedPrefixedPredicates = _sortBy(
        Object
          .entries(prefixedPredicates)
          .filter(([predicate, value]) => !(importantPredicates.includes(predicate)))
          .map(([predicate, values]) => ({ predicate, values }))
        , 'predicate')

      const sortedIriPredicates = _sortBy(
        Object
          .entries(iriPredicates)
          .map(([predicate, values]) => ({ predicate, values }))
        , 'predicate')

      return {
        prefixedPredicates,
        importantPredicates,
        sortedPrefixedPredicates,
        sortedIriPredicates
      }
    }
  }
}
</script>
