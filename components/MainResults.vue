<template>
  <section>
    <div class="big">
      <p>
        <span class="partA">{{ model.prefixedSplitA }}:</span>
        <span class="partB">{{ model.prefixedSplitB }}</span>
      </p>
      <p>
        <span class="partA">{{ model.iriSplitA }}</span>
        <span class="partB">{{ model.iriSplitB }}</span>
      </p>
    </div>
    <div class="small">
      <div>
        <h3>
          Namespace
        </h3>
        {{ model.iriSplitA }}
      </div>
      <div>
        <h3>
          Recommended prefix
        </h3>
        {{ model.prefixedSplitA }}:
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
  }
}
</script>
