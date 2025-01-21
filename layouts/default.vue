<template>
  <div class="layout">
    <div class="page">
      <NuxtLoadingIndicator color="#f2f2f2" :height="3" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  height: 100dvh;
  width: 100%;
}

.page {
  width: 100%;
  height: 100%;
}
</style>
