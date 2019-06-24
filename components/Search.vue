<template>
  <div class="main-container">
    <div class="home-header">
      <div class="layout-width">
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
          <div class="flex-item" data-app>
            <v-autocomplete
              v-model="model"
              :items="items"
              :loading="isLoading"
              :search-input.sync="search"
              autofocus
              color="white"
              hide-no-data
              hide-selected
              item-text="itemText"
              item-value="iri.value"
              no-data-text="Nothing found :("
              no-filter
              placeholder="Start typing to Search"
              return-object
            />
          </div>
          <div class="flex-item desc">
            <p>
              Data based on <strong>@zazuko/rdf-vocabularies</strong><span class="tail" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="model" class="default-content main-results">
      <div class="layout-width">
        <main-results :model="model" />
      </div>
    </div>

    <div class="default-content search-results">
      <div class="layout-width">
        <detail-results
          v-if="model"
          :model="model"
        />
        <v-btn
          v-show="model"
          color="grey darken-3"
          @click="clear"
        >
          Clear
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import _debounce from 'lodash/debounce'
import MainResults from '@/components/MainResults'
import DetailResults from '@/components/DetailResults'

export default {
  name: 'Search',
  components: {
    MainResults,
    DetailResults
  },
  props: {
    prefetchedEntries: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      entries: this.prefetchedEntries,
      isLoading: false,
      model: null,
      search: null,
      iriFromURL: ''
    }
  },
  computed: {
    items() {
      return this.entries
    }
  },
  watch: {
    model() {
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
  async mounted() {
    this.iriFromURL = this.$route.path + this.$route.hash
    if (this.iriFromURL.startsWith('/')) {
      // this.$route.path often starts with `/`, strip it since
      // no IRI nor any prefix start with /
      this.iriFromURL = this.iriFromURL.substr(1)
    }

    if (this.prefetchedEntries.length) {
      let found = false
      // find the best match from the search results
      for (const match of this.prefetchedEntries) {
        // ideally a case sensitive exact match
        if (
          match.iri.value === this.iriFromURL ||
          match.prefixed === this.iriFromURL
        ) {
          this.model = match
          this.entries = []
          found = true
          break
        }
      }

      if (found) {
        return
      }

      // otherwise a case insensitive one
      for (const match of this.prefetchedEntries) {
        if (
          match.iri.value.toLowerCase() === this.iriFromURL.toLowerCase() ||
          match.prefixed.toLowerCase() === this.iriFromURL.toLowerCase()
        ) {
          this.model = match
          this.entries = []
          found = true
          break
        }
      }
      if (found) {
        return
      }

      await this.doSearch(this.iriFromURL)
      if (this.entries.length) {
        this.model = this.entries[0]
        this.entries = []
      }
    }
  },
  methods: {
    async doSearch(val) {
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
        this.entries = await this.$axios.$get(`/api/search?q=${val}`)
      } catch (err) {
        console.error(err)
      }
      this.isLoading = false
    },
    clear() {
      this.$router.push('/')
    }
  }
}
</script>

<style>
.v-input.v-text-field input {
  background: #FFFFFF;
  border: 1px solid #979797;
}
.v-menu {
  position: fixed;
  left: 0;
  top: 24px;
}
</style>
