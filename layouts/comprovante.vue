<template>
  <div class="comprovante-layout">
    <slot />
  </div>
</template>

<style scoped>
.comprovante-layout {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: var(--hemo-color-black-5, #f8f8f8);
  box-sizing: border-box;
}
</style>
