<template>
  <section class="grid">
    <template v-for="predicate in importantPredicates">
      <template v-if="prefixedPredicates[predicate]">
        <predicate :key="'a' + predicate" :term="predicate" />
        <terms :key="'b' + predicate" :terms="prefixedPredicates[predicate]" />
      </template>
    </template>

    <template v-for="item in sortedPrefixedPredicates">
      <predicate :key="'a' + item.predicate" :term="item.predicate" />
      <terms :key="'b' + item.predicate" :terms="item.values" />
    </template>

    <template v-for="item in sortedIriPredicates">
      <predicate :key="'a' + item.predicate" :term="item.predicate" />
      <terms :key="'b' + item.predicate" :terms="item.values" />
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
  data() {
    return {
      // important predicates, manually selected+sorted
      importantPredicates,
      // the ones that are prefixed, alphabetically sorted
      prefixedPredicates: {},
      // other predicates, alphabetically sorted
      sortedIriPredicates: {},
      // tmp
      iriPredicates: {},
      sortedPrefixedPredicates: []
    }
  },
  computed: {
    fields() {
      if (!this.model) {
        return []
      }

      return []
    }
  },
  mounted() {
    [this.prefixedPredicates, this.iriPredicates] = this.model.parts
      .reduce(([prefixedPredicates, iriPredicates], field) => {
        if (field.predicate !== field.predicateIRI) {
          if (!prefixedPredicates[field.predicate]) {
            prefixedPredicates[field.predicate] = []
          }
          prefixedPredicates[field.predicate].push(field)
        } else {
          if (!iriPredicates[field.predicate]) {
            iriPredicates[field.predicate] = []
          }
          iriPredicates[field.predicate].push(field)
        }
        return [prefixedPredicates, iriPredicates]
      }, [{}, {}])

    this.sortedPrefixedPredicates = _sortBy(
      Object
        .entries(this.prefixedPredicates)
        .filter(([predicate, value]) => !(importantPredicates.includes(predicate)))
        .map(([predicate, values]) => ({ predicate, values }))
      , 'predicate')

    this.sortedIriPredicates = _sortBy(
      Object
        .entries(this.iriPredicates)
        .map(([predicate, values]) => ({ predicate, values }))
      , 'predicate')
  }
}
</script>
