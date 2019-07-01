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
          <autocomplete
            :entries="entries"
            :search-input.sync="search" />
        </div>
        <div class="flex-item desc">
          <div>
            Data based on <a href="https://github.com/zazuko/rdf-vocabularies">@zazuko/rdf-vocabularies</a>
          </div>
          <div class="tail"></div>
        </div>
      </div>
    </div>

    <div v-if="model" class="main-results">
      <main-results :model="model" />
    </div>

    <div class="search-results">
      <detail-results
        v-if="model"
        :model="model" />
    </div>
  </div>
</template>

<script>
import _debounce from 'lodash/debounce'
import MainResults from '@/components/MainResults'
import DetailResults from '@/components/DetailResults'
import Autocomplete from '@/components/Autocomplete'

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

export default {
  components: {
    MainResults,
    DetailResults,
    Autocomplete
  },
  data () {
    return {
      isLoading: false,
      model: null,
      search: null,
      iriFromURL: ''
    }
  },
  computed: {
    items () {
      return this.entries
    }
  },
  watch: {
    model () {
      // only redirect to result when user search something, otherwise people hitting
      // http://localhost:3000/http://www.w3.org/ns/rdfa#PrefixOrTermMapping
      // will also be redirected
      if (this.model && this.search) {
        this.$router.push(`/${this.model.prefixed}`)
      }
    },
    search: _debounce(async function (val) {
      await this.doSearch(val)
    }, 250)
  },
  async asyncData ({ $axios, params, redirect, error }) {
    let entries = []
    const iriFromURL = params.pathMatch
    if (iriFromURL) {
      const val = `${iriFromURL}`.replace(/#/g, '---hash---')
      entries = await $axios.$get(`/api/v1/search?q=${val}`)
      const match = pickFromEntries(iriFromURL, entries)
      if (match) {
        if (iriFromURL !== match.prefixed) {
          // we don't want `/schema:PERSON` to display the same data as
          // `/schema/Person`, so always redirect to the right thing
          redirect(`/${match.prefixed}`)
          return
        }

        return {
          model: match,
          entries: []
        }
      }
      if (!entries.length) {
        return error({ statusCode: 404, message: 'No Result' })
      }
      // there is no match, we don't want the user to continue from a
      // URL that has no result, for instance if they typed schema:Lol<enter>
      // and are stuck on `/schema:Lol`. In this situation, redirect to `/`.
      redirect('/')
      return
    }
    return {
      entries
    }
  },
  async mounted () {
    this.iriFromURL = this.$route.path + this.$route.hash
    if (this.iriFromURL.startsWith('/')) {
      // this.$route.path often starts with `/`, strip it since
      // no IRI nor any prefix start with /
      this.iriFromURL = this.iriFromURL.substr(1)
    }

    const match = pickFromEntries(this.iriFromURL, this.entries)
    if (match) {
      this.model = match
      this.entries = []
      return
    }

    await this.doSearch(this.iriFromURL)
    if (this.entries.length) {
      this.model = this.entries[0]
      this.entries = []
    }
  },
  methods: {
    async doSearch (val) {
      val = val || ''
      val = val.replace(/#/g, '---hash---')
      if (val.toLowerCase() === this.loadingVal) {
        // Items have already been loaded
        if (this.items.length > 0) {
          return
        }

        // Items have already been requested
        if (this.isLoading) {
          return
        }
      }

      this.isLoading = true
      this.loadingVal = val.toLowerCase()

      // Lazily load input items
      try {
        this.entries = await this.$axios.$get(`/api/v1/search?q=${val}`)
      }
      catch (err) {
        console.error(err)
      }
      this.isLoading = false
    },
    clear () {
      this.$router.push('/')
    }
  },
  validate ({ params }) {
    if (params.pathMatch && params.pathMatch.endsWith(':')) {
      return false
    }
    return true
  },
  head () {
    return {
      title: 'Resolve RDF namespaces'
    }
  }
}
</script>
