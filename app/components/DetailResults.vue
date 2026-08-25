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

<script setup lang="ts">
import { sortBy } from 'lodash-es'
import type { TermEntry, TermPart } from '#shared/types/api'

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

const props = defineProps<{
  model: TermEntry
}>()

interface PredicateGroup {
  predicate: string
  values: TermPart[]
}

const predicates = computed(() => {
  const prefixedPredicates: Record<string, TermPart[]> = {}
  const iriPredicates: Record<string, TermPart[]> = {}

  for (const field of props.model.parts) {
    const target = field.predicate !== field.predicateIRI ? prefixedPredicates : iriPredicates
    const values = target[field.predicate] ?? []
    values.push(field)
    target[field.predicate] = values
  }

  const toGroups = (groups: Record<string, TermPart[]>): PredicateGroup[] => Object
    .entries(groups)
    .map(([predicate, values]) => ({ predicate, values }))

  const sortedPrefixedPredicates = sortBy(
    toGroups(prefixedPredicates).filter(({ predicate }) => !importantPredicates.includes(predicate)),
    'predicate')

  const sortedIriPredicates = sortBy(toGroups(iriPredicates), 'predicate')

  return {
    prefixedPredicates,
    importantPredicates,
    sortedPrefixedPredicates,
    sortedIriPredicates
  }
})
</script>
