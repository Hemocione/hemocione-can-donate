<template>
  <button
    v-if="available"
    type="button"
    class="hemarcio-ask-button"
    @click="ask(intent, context)"
  >
    <img
      class="hemarcio-ask-face"
      src="/hemarcio-face.svg"
      alt=""
      width="24"
      height="24"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  intent: string;
  context: Record<string, unknown>;
  label: string;
}>();

const { available, ask } = useHemarcioAsk();
</script>

<style scoped>
.hemarcio-ask-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 90%;
  max-width: 400px;
  min-height: 48px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 2px solid var(--hemo-color-primary-medium);
  border-radius: 8px;
  background-color: white;
  color: var(--hemo-color-primary-medium);
  font: inherit;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.hemarcio-ask-face {
  flex-shrink: 0;
}
</style>
