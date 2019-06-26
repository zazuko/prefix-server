<template>
  <section>
    <div class="big">
      <div
        class="line"
      >
        <span>{{ model.prefixedSplitA }}:</span>{{ model.prefixedSplitB }}
      </div>
      <div
        class="line"
      >
        <span>{{ model.iriSplitA }}</span>{{ model.iriSplitB }}
      </div>
    </div>
    <div class="small">
      <div>
        <h3>
          Namespace
        </h3>
        <p>
          {{ model.iriSplitA }}
        </p>
      </div>
      <div>
        <h3>
          Recommended prefix
        </h3>
        <p>
          {{ model.prefixedSplitA }}:
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainResults',
  props: {
    model: {
      type: Object,
      required: true
    }
  },
}
</script>
