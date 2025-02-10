<template>
  <div class="intro-page">
    <header class="header">
      <NuxtImg src="images/logo-horizontal-branca.svg" alt="Logo Hemocione" class="logo" />
    </header>

    <header class="second-header" v-auto-animate>
      <button class="go-back-button" key="go-back" @click="goBack" v-if="!isResultPage">
        <ElIconArrowLeftBold />
      </button>
      <span key="header-text">Posso doar?</ span>
        <button key="close" class="close-button" @click="close" v-if="!isResultPage">
          <ElIconClose />
        </button>
    </header>

    <el-drawer v-model="drawer" :with-header="false" :direction="direction" :before-close="handleClose"
      :size="'fit-content'">
      <div class="drawer-content">
        <p style="padding: 0 0 16px; margin: 0; text-align: left;">
          Deseja sair do questionário? Suas respostas não serão salvas, mas você
          pode voltar e refazer em outro momento.
        </p>
        <el-button class="exit-button" @click="exitQuestionnaire">
          Sair do questionário
        </el-button>
        <el-button class="continue-button" @click="closeDrawer">
          Continuar questionário
        </el-button>
      </div>
    </el-drawer>

    <main class="content">
      <Transition name="slide-fade-down" mode="out-in" appear>
        <div v-if="isQuestionsRoute" class="progress-bar">
          <div v-for="(question, index) in questions" :key="index" class="progress-dot" :class="{
            active: index === currentQuestionIndex,
            completed: index < currentQuestionIndex,
            finalSuccess: isFormCompleted && !isFailed,
            finalFailed: isFormCompleted && isFailed
          }" :style="{ width: `${100 / questions.length}%` }"></div>
        </div>
      </Transition>
      <div :class="{ 'route-wrapper': true, 'question-route': isQuestionsRoute }">
        <slot />
      </div>
      <!-- Espaço para conteúdo específico -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";
import type { DrawerProps } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("btt");
const selectedIntent = ref<"today" | "soon" | null>(null);

const handleClose = (done: () => void) => {
  drawer.value = false;
  done();
};

const isFailed = computed(() => userStore.isFormFailed());

const isFormCompleted = computed(() => {
  return currentQuestionIndex.value === -1;
});


const isQuestionsRoute = computed(() => {
  return route.path.startsWith("/questions");
});

const currentQuestionSlug = computed(() => {
  return route.params.questionSlug;
});

const isResultPage = computed(() => {
  return route.meta.resultPage
})

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
  drawer.value = true;
}

function closeDrawer() {
  drawer.value = false; // Fecha o drawer
}

function resetSelection() {
  selectedIntent.value = null; // Reseta a intenção selecionada
}

function exitQuestionnaire() {
  console.log("Saindo do questionário...");

  // Limpa o sessionStorage
  sessionStorage.removeItem("questionnaireStarted");
  sessionStorage.removeItem("selectedIntent");

  // Reseta o estado no userStore
  userStore.setFormResponse(null);
  userStore.setDonationIntent(null);

  resetSelection();

  router.push("/");
}

watchEffect(() => {
  console.log("✅ isFormCompleted:", isFormCompleted.value);
  console.log("❌ isFailed:", isFailed.value);
  console.log("🔢 currentQuestionIndex:", currentQuestionIndex.value);
  console.log("📊 Total Questions:", questionsLength.value);
});

</script>

<style scoped>
.intro-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #f8f8f8;
  color: #333;
  height: 100vh;
}

.route-wrapper {
  width: 100%;
  height: 100%;
}

.question-route {
  height: calc(100% - 2rem);
}

.header {
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: var(--navbar-height);
  background-color: var(--hemo-color-black-100);
}

.second-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-width: var(--hemo-page-max-width);
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
  max-width: var(--hemo-page-max-width);
  background-color: var(--hemo-color-white);
  height: calc(100% - var(--navbar-height) - var(--secondary-header-height));
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

.close-button {
  all: unset;
  /* Remove estilos padrão */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  /* Alinha o botão no extremo direito */
}

.close-button svg {
  width: 1.2rem;
  height: 1.2rem;
}

.exit-button {
  background-color: #b44236;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  padding: 10px 20px;
  width: 100%;
  height: 48px;
}

.drawer-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.continue-button {
  background: none;
  color: #b44236;
  font-weight: bold;
  border: none;
  cursor: pointer;
  padding: 10px;
  padding-top: 20px;
  margin-top: 15px;
  height: 48px;
  width: 100%;
}

.progress-bar {
  display: flex;
  /* Define layout em linha */
  justify-content: center;
  /* Centraliza a barra */
  align-items: center;
  /* Alinha verticalmente */
  flex-wrap: nowrap;
  /* Evita que os itens quebrem de linha */
  gap: 10px;
  /* Define espaçamento fixo entre os elementos */
  padding: 0 1rem;
  height: 2rem;
  overflow-x: auto;
  /* Adiciona rolagem horizontal se necessário */
}

.progress-dot {
  width: calc(100% / var(--questions-length));
  height: 8px;
  border-radius: 20px;
  background-color: #e0e0e0;
  transition: background-color 0.4s ease-in-out, transform 0.3s ease, box-shadow 0.3s ease;
}

.progress-dot.active {
  background-color: #b44236;
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(180, 66, 54, 0.6);
}

.progress-dot.completed {
  background-color: #ffcccc;
}

.progress-dot.finalSuccess {
  background-color: #28a745 !important;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.8);
}

.progress-dot.finalFailed {
  background-color: #ffc107 !important;
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.8);
}
</style>
