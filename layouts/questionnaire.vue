<template>
  <div class="intro-page">
    <header class="header">
      <NuxtImg
        src="images/logo-horizontal-branca.svg"
        alt="Logo Hemocione"
        class="logo"
      />
    </header>

    <header class="second-header">
      <button class="go-back-button" @click="goBack">
        <ElIconArrowLeftBold />
      </button>
      <span>Posso doar?</span>
    </header>

    <main class="content">
      <slot />
      <!-- Espaço para conteúdo específico -->
    </main>
  </div>
</template>

<script setup>
function goBack() {
  navigateTo("/");
}
</script>

<style scoped>
.intro-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #f8f8f8;
  color: #333;
  min-height: 100vh;
}

.header {
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: fit-content;
  background-color: var(--hemo-color-black-100);
}

.second-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  height: fit-content;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
}

.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.content p {
  font-size: 1rem;
  margin-bottom: 20px;
  padding: 0 20px;
}

.second-header p {
  font-size: 1.2rem;
}

.go-back-button {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-items: center;
}

.go-back-button svg {
  width: 1rem;
  height: 1rem;
}
</style>
