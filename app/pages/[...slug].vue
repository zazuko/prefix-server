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

<script setup lang="ts">
import { debounce } from 'lodash-es'
import type { TermEntry } from '#shared/types/api'

interface SearchState {
  entries: TermEntry[]
  /** the term matching the URL, when it exists */
  model?: TermEntry
  /** the text to search for, when the URL does not match a term */
  search?: string
  /** the URL of the term matching the URL, when it is written differently */
  redirect?: string
}

function pickFromEntries (iriFromURL: string, entries: TermEntry[]): TermEntry | undefined {
  if (!iriFromURL) {
    return undefined
  }

  // find the best match from the search results: ideally a case sensitive exact match…
  const exact = entries.find(match => match.iri.value === iriFromURL || match.prefixed === iriFromURL)
  if (exact) {
    return exact
  }

  // …otherwise a case insensitive one
  const lowerCased = iriFromURL.toLowerCase()
  return entries.find(match => match.iri.value.toLowerCase() === lowerCased || match.prefixed.toLowerCase() === lowerCased)
}

const route = useRoute()
// `/http://schema.org/Person` => ['http:', '', 'schema.org', 'Person']
const iriFromURL = [route.params.slug].flat().join('/')

const { data, error } = await useAsyncData<SearchState>(`search:${iriFromURL}`, async () => {
  if (!iriFromURL) {
    return { entries: [] }
  }

  const entries = await $fetch<TermEntry[]>('/api/v1/search', { query: { q: iriFromURL.replace(/#/g, '---hash---') } })
  const match = pickFromEntries(iriFromURL, entries)
  if (match) {
    if (iriFromURL !== match.prefixed) {
      // we don't want `/schema:PERSON` to display the same data as
      // `/schema:Person`, so always redirect to the right thing
      return { entries: [], redirect: `/${match.prefixed}` }
    }
    return { entries: [], model: match }
  }
  if (!entries.length) {
    throw createError({ statusCode: 404, statusMessage: 'No Result' })
  }
  return { entries, search: iriFromURL }
})

if (error.value) {
  throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage })
}
if (data.value?.redirect) {
  await navigateTo(data.value.redirect)
}

const model = data.value?.model ?? null
const search = ref(data.value?.search ?? '')
const entries = ref<TermEntry[]>(data.value?.entries ?? [])

useHead({
  title: model ? `${model.prefixed} lookup - Resolve RDF namespaces` : 'Resolve RDF namespaces'
})

let loadingValue: string | null = null
let isLoading = false

async function doSearch (value: string) {
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
    entries.value = await $fetch<TermEntry[]>('/api/v1/search', { query: { q: value } })
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
  isLoading = false
}

watch(search, debounce(doSearch, 250))
</script>
