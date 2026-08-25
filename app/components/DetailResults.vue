<template>
  <section class="grid">
    <template v-for="predicate in predicates.importantPredicates" :key="predicate">
      <div v-if="predicates.prefixedPredicates[predicate]" class="row">
        <Predicate :term="predicate" />
        <Terms :terms="predicates.prefixedPredicates[predicate]" />
      </div>
    </template>

    <div v-for="item in predicates.sortedPrefixedPredicates" :key="item.predicate" class="row">
      <Predicate :term="item.predicate" />
      <Terms :terms="item.values" />
    </div>

    <div v-for="item in predicates.sortedIriPredicates" :key="item.predicate" class="row">
      <Predicate :term="item.predicate" />
      <Terms :terms="item.values" />
    </div>
  </section>
</template>

<script setup>
import { sortBy } from 'lodash-es'

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

const props = defineProps({
  model: {
    type: Object,
    required: true
  }
})

const predicates = computed(() => {
  const [prefixedPredicates, iriPredicates] = props.model.parts
    .reduce(([prefixedPredicates, iriPredicates], field) => {
      const target = field.predicate !== field.predicateIRI ? prefixedPredicates : iriPredicates
      if (!target[field.predicate]) {
        target[field.predicate] = []
      }
      target[field.predicate].push(field)
      return [prefixedPredicates, iriPredicates]
    }, [{}, {}])

  const sortedPrefixedPredicates = sortBy(
    Object
      .entries(prefixedPredicates)
      .filter(([predicate]) => !importantPredicates.includes(predicate))
      .map(([predicate, values]) => ({ predicate, values })),
    'predicate')

  const sortedIriPredicates = sortBy(
    Object
      .entries(iriPredicates)
      .map(([predicate, values]) => ({ predicate, values })),
    'predicate')

  return {
    prefixedPredicates,
    importantPredicates,
    sortedPrefixedPredicates,
    sortedIriPredicates
  }
})
</script>
