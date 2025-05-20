<template>
  <div class="intention-page">
    <el-drawer
      v-model="drawer"
      :with-header="false"
      :direction="direction"
      :before-close="handleClose"
      :size="'200px'"
    >
      <div class="drawer-content">
        <p class="drawer-text">
          Este questionário serve como uma orientação inicial com perguntas
          frequentes sobre a doação, mas não substitui a triagem realizada por
          profissionais de saúde no dia e no local da doação.
        </p>
        <el-button class="start-button" @click="startQuestionnaire">
          Começar a responder
        </el-button>
      </div>
    </el-drawer>

    <div class="calendar-container">
      <NuxtImg src="/images/calendar.svg" alt="Calendário" class="calendar" />
    </div>

    <div>
      <div class="first-question">
        <h2>Quando você pretende doar?</h2>
      </div>

      <p class="why">Por que essa pergunta?</p>

      <p class="question-description">
        Essa informação é importante para que possamos fazer as perguntas certas
        sobre sua saúde e bem-estar, especialmente se você estiver doando hoje.
      </p>
    </div>

    <CoolFooter height="120px" hideToggle desktopBorderRadius="0">
      <div class="intention-buttons">
        <el-button
          class="intention-button"
          :class="{ selected: selectedIntent === 'today' }"
          @click="selectIntent('today')"
          :loading="loadingAfterSelected"
        >
          ⏰ Hoje
        </el-button>
        <el-button
          class="intention-button"
          :class="{ selected: selectedIntent === 'soon' }"
          @click="selectIntent('soon')"
          :loading="loadingAfterSelected"
        >
          ⏳ Em breve
        </el-button>
      </div>
    </CoolFooter>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { DrawerProps } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { evaluateCurrentLogin, redirectToID } from "~/middleware/auth";

definePageMeta({ layout: "questionnaire" });

const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("btt");
const showFirstQuestion = ref(false);
const router = useRouter();
const userStore = useUserStore();
const selectedIntent = ref<"today" | "soon" | null>(null);
const isAnonymousMode = ref(false);

const handleClose = (done: () => void) => {
  drawer.value = false;
  done();
};

onMounted(async () => {
  const anonymousMode = sessionStorage.getItem("anonymousMode");
  isAnonymousMode.value = anonymousMode === "true";

  if (!isAnonymousMode.value) {
    const isLoggedIn = await evaluateCurrentLogin();
    if (!isLoggedIn) {
      console.log("Usuário não autenticado. Redirecionando para login...");
      redirectToID(window.location.pathname);
      return;
    }
    console.log("Usuário autenticado:", userStore.user);
  } else {
    console.log("Usuário escolheu continuar sem cadastro.");
  }

  const alreadyStarted = sessionStorage.getItem("questionnaireStarted");
  const savedIntent = sessionStorage.getItem("selectedIntent");

  if (savedIntent) {
    selectedIntent.value = savedIntent as "today" | "soon";
  }

  if (!alreadyStarted) {
    console.log("Drawer deve abrir pela primeira vez");
    drawer.value = true;
  } else {
    console.log("Questionário já iniciado, não exibe o drawer");
    drawer.value = false;
  }
});

// Handles the "Começar" button inside the drawer
async function startQuestionnaire() {
  drawer.value = false;
  showFirstQuestion.value = true;
  sessionStorage.setItem("questionnaireStarted", "true");
}

const loadingAfterSelected = ref(false);

// Handles selecting a donation intent
async function selectIntent(intent: "today" | "soon") {
  if (loadingAfterSelected.value) return;

  loadingAfterSelected.value = true;
  try {
    console.log(`Selecionando a intenção: ${intent}`);

    selectedIntent.value = intent;
    sessionStorage.setItem("selectedIntent", intent);

    userStore.setDonationIntent(intent);

    if (!isAnonymousMode.value) {
      const isLoggedIn = await evaluateCurrentLogin();
      if (!isLoggedIn) {
        console.log("Usuário não autenticado. Redirecionando para login...");
        redirectToID(window.location.pathname);
        return;
      }
    }

    await userStore.updateDonationIntent(intent);

    const firstQuestionSlug = userStore.formQuestions[0]?.slug;
    if (firstQuestionSlug) {
      router.push(`/questions/${firstQuestionSlug}`);
    } else {
      console.error("No questions found for the selected intent.");
    }
  } catch (error) {
    console.error("Error selecting intent:", error);
  }

  loadingAfterSelected.value = false;
}
</script>

<style scoped>
.drawer {
  padding: 20px;
  height: 20dvh;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intention-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-around;
  align-items: center;
  gap: 16px;
}

.drawer-text {
  padding: 0;
  margin: 0;
  text-align: left;
  width: 100%;
}

.start-button {
  background-color: var(--hemo-color-primary-medium);
  color: #fff;
  padding: 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

.first-question {
  height: calc(100% - 120px);
  padding: 20px;
  color: var(--hemo-color-primary-less-dark);
}

.first-question h2 {
  margin: 0;
  text-align: left;
}

.intention-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
  height: 100%;
}

.intention-button {
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-primary-medium);
  font-weight: bold;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 1.3rem;
  box-sizing: border-box;
  border: 2px solid var(--hemo-color-primary-medium);
  transition: all 0.3s ease;
}

.intention-button:hover {
  background-color: var(--hemo-color-primary-medium-hover);
  color: var(--hemo-color-primary-medium);
  border-color: var(--hemo-color-primary-medium);
}

.intention-button.selected {
  background-color: var(--hemo-color-primary-medium);
  color: var(--hemo-color-white);
  border-color: var(--hemo-color-primary-medium);
  font-weight: bold;
}

.calendar {
  width: 208px;
  height: 208px;
  margin-bottom: 5px;
  margin-top: 5px;
  object-fit: contain;
}

.why {
  color: var(--hemo-color-black-80);
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
  text-align: left;
  margin-left: 20px;
}

.question-description {
  text-align: left;
  padding-bottom: 16px;
  margin-left: 20px;
}

.calendar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
