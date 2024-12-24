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
      <button class="close-button" @click="close">
        <ElIconClose />
      </button>
    </header>

    <main class="content">
      <div v-if="isQuestionsRoute" class="progress-bar">
        <div
          v-for="(question, index) in questions"
          :key="index"
          class="progress-dot"
          :class="{
            active: index === currentQuestionIndex,
            completed: index < currentQuestionIndex,
          }"
          :style="{ width: `${100 / questions.length}%` }"
        ></div>
      </div>
      <slot />
      <!-- Espaço para conteúdo específico -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isQuestionsRoute = computed(() => {
  return route.path.startsWith("/questions");
});

const currentQuestionSlug = computed(() => {
  return route.params.questionSlug;
});

const questions = computed(() => {
  console.log(
    "Recomputing questions based on donationIntent:",
    userStore.donationIntent
  );
  return userStore.formQuestions;
});

const currentQuestionIndex = computed(() => {
  return questions.value.findIndex((question) => {
    return question.slug == currentQuestionSlug.value;
  });
});

const questionsLength = computed(() => {
  return questions.value.length;
});

function goBack() {
  router.back();
}

function close() {
  // Lógica para fechar
  console.log("Close");
  // Exemplo: redirecionar ou fechar o layout
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
  height: 55px;
  background-color: var(--hemo-color-black-100);
}

.second-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-width: 768px;
  height: 53px;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
  background-color: var(--hemo-color-white);
}

.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.content {
  width: 100%;
  max-width: 768px;
  background-color: var(--hemo-color-white);
  height: calc(100vh - 108px);
  padding: 0 1rem;
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

.progress-bar {
  display: flex; /* Define layout em linha */
  justify-content: center; /* Centraliza a barra */
  align-items: center; /* Alinha verticalmente */
  flex-wrap: nowrap; /* Evita que os itens quebrem de linha */
  gap: 10px; /* Define espaçamento fixo entre os elementos */
  margin: 20px 0;
  padding: 0 5px;
  overflow-x: auto; /* Adiciona rolagem horizontal se necessário */
}

.progress-dot {
  width: calc(100% / v-bind(questionsLength));
  height: 8px;
  border-radius: 20px;
  background-color: #e0e0e0; /* Cor padrão (não ativa) */
  transition: background-color 0.3s;
}

.progress-dot.active {
  background-color: #b44236; /* Cor da pergunta atual */
}

.progress-dot.completed {
  background-color: #ffcccc; /* Cor das perguntas já respondidas */
}
</style>
