<template>
  <div class="main-container">
    <div class="home-header">
      <div class="search-field-container flex-container">
        <div class="flex-item title">
          <div>
            <h1>
              Resolve
              <br>
              RDF Terms
            </h1>
          </div>
        </div>
        <div class="flex-item">
          <Autocomplete
            v-model:search-input="search"
            :entries="entries" />
        </div>
        <div class="flex-item desc">
          <div>
            Data based on <a href="https://github.com/zazuko/rdf-vocabularies">@zazuko/vocabularies</a>
          </div>
          <div class="tail"></div>
        </div>
      </div>
    </div>

    <div v-if="model" class="main-results">
      <MainResults :model="model" />
    </div>

    <div class="search-results">
      <DetailResults
        v-if="model"
        :model="model" />
    </div>
  </div>
</template>

<script setup>
import { debounce } from 'lodash-es'

function pickFromEntries (iriFromURL, entries) {
  if (!iriFromURL || !Array.isArray(entries)) {
    return false
  }

  // find the best match from the search results
  for (const match of entries) {
    // ideally a case sensitive exact match
    if (
      match.iri.value === iriFromURL ||
      match.prefixed === iriFromURL
    ) {
      return match
    }
  }

  // otherwise a case insensitive one
  for (const match of entries) {
    if (
      match.iri.value.toLowerCase() === iriFromURL.toLowerCase() ||
      match.prefixed.toLowerCase() === iriFromURL.toLowerCase()
    ) {
      return match
    }
  }
  return false
}

const route = useRoute()
// `/http://schema.org/Person` => ['http:', '', 'schema.org', 'Person']
const iriFromURL = [route.params.slug].flat().join('/')

const { data, error } = await useAsyncData(`search:${iriFromURL}`, async () => {
  if (!iriFromURL) {
    return { entries: [] }
  }

  const entries = await $fetch('/api/v1/search', { query: { q: iriFromURL.replace(/#/g, '---hash---') } })
  const match = pickFromEntries(iriFromURL, entries)
  if (match) {
    if (iriFromURL !== match.prefixed) {
      // we don't want `/schema:PERSON` to display the same data as
      // `/schema:Person`, so always redirect to the right thing
      return { redirect: `/${match.prefixed}` }
    }
    return { model: match, entries: [] }
  }
  if (!entries.length) {
    throw createError({ statusCode: 404, statusMessage: 'No Result' })
  }
  return { search: iriFromURL, entries }
})

if (error.value) {
  throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage })
}
if (data.value.redirect) {
  await navigateTo(data.value.redirect)
}

const model = data.value.model || null
const search = ref(data.value.search || '')
const entries = ref(data.value.entries || [])

useHead({
  title: model ? `${model.prefixed} lookup - Resolve RDF namespaces` : 'Resolve RDF namespaces'
})

let loadingValue = null
let isLoading = false

async function doSearch (value) {
  value = (value || '').replace(/#/g, '---hash---')
  if (value.toLowerCase() === loadingValue) {
    // entries have already been loaded or are being loaded
    if (entries.value.length > 0 || isLoading) {
      return
    }
  }

  isLoading = true
  loadingValue = value.toLowerCase()

  try {
    entries.value = await $fetch('/api/v1/search', { query: { q: value } })
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
  isLoading = false
}

watch(search, debounce(doSearch, 250))
</script>
