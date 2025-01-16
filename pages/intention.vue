<template>
  <!-- <QuestionnaireLayout> -->
  <el-drawer
    v-model="drawer"
    :with-header="false"
    :direction="direction"
    :before-close="handleClose"
  >
    <p>
      Bem-vindo ao questionário! Este questionário serve como uma orientação
      inicial com perguntas frequentes sobre a doação, mas não substitui a
      triagem realizada por profissionais de saúde no dia e no local da doação.
    </p>
    <el-button class="start-button" @click="startQuestionnaire">
      Começar
    </el-button>
  </el-drawer>

  <div class="first-question">
    <h2>Qual é a sua intenção de doação?</h2>
    <div class="fixed-buttons">
      <div class="intention-buttons">
        <el-button
          class="intention-button"
          :class="{ selected: selectedIntent === 'today' }"
          @click="selectIntent('today')"
        >
          Hoje
        </el-button>
        <el-button
          class="intention-button"
          :class="{ selected: selectedIntent === 'this-week' }"
          @click="selectIntent('this-week')"
        >
          Esta Semana
        </el-button>
        <el-button
          class="intention-button"
          :class="{ selected: selectedIntent === 'future' }"
          @click="selectIntent('future')"
        >
          Futuro
        </el-button>
      </div>
    </div>
  </div>
  <!-- </QuestionnaireLayout> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { DrawerProps } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: "questionnaire" });

const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("btt");
const showFirstQuestion = ref(false);
const router = useRouter();
const userStore = useUserStore();
const selectedIntent = ref<"today" | "this-week" | "future" | null>(null);

const handleClose = (done: () => void) => {
  drawer.value = false;
  done();
};

// Abre o drawer automaticamente ao carregar a página
onMounted(() => {
  console.log("onMounted executado");

  const alreadyStarted = sessionStorage.getItem("questionnaireStarted");
  const savedIntent = sessionStorage.getItem("selectedIntent");

  if (savedIntent) {
    selectedIntent.value = savedIntent as "today" | "this-week" | "future";
  }

  if (!alreadyStarted) {
    console.log("Drawer deve abrir pela primeira vez");
    drawer.value = true; // Exibe o drawer se nunca foi iniciado
  } else {
    console.log("Questionário já iniciado, não exibe o drawer");
    drawer.value = false; // Não abre se já foi iniciado
  }
});

async function startQuestionnaire() {
  drawer.value = false;
  showFirstQuestion.value = true;

  //TODO: nao deveria subir se eu recarregar a página?
  //session?
  sessionStorage.setItem("questionnaireStarted", "true");

  try {
    const response = await userStore.createFormResponse();
    if (response && response._id) {
      userStore.setFormResponse(response);
      console.log("FormResponse created:", response);
    } else {
      console.error("FormResponse creation failed:", response);
    }
  } catch (error) {
    console.error("Error during formResponse creation:", error);
  }
}

async function selectIntent(intent: "today" | "this-week" | "future") {
  console.log(`Selecionando a intenção: ${intent}`);
  selectedIntent.value = intent; // Atualiza a intenção selecionada
  sessionStorage.setItem("selectedIntent", intent); // Salva no sessionStorage

  userStore.setDonationIntent(intent);
  await userStore.updateDonationIntent(intent);

  const firstQuestionSlug = userStore.formQuestions[0]?.slug;
  if (firstQuestionSlug) {
    router.push(`/questions/${firstQuestionSlug}`);
  } else {
    console.error("No questions found for the selected intent.");
  }
}
</script>

<style scoped>
.start-button {
  background-color: #b44236;
  color: #fff;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  max-width: 300px;
  width: 100%;
  margin-top: 20px;
}

.first-question {
  margin-top: 20px;
  text-align: center;
  height: 100%;
  padding: 20px;
  color: var(--hemo-color-primary-less-dark);
  left: 50%;
}

.fixed-buttons {
  display: flex;
  flex-direction: column; /* Alinha os botões verticalmente */
  align-items: center; /* Centraliza os botões horizontalmente */
  gap: 15px; /* Espaçamento vertical entre os botões */
  padding: 20px 0; /* Espaçamento interno */
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.intention-buttons {
  display: flex;
  flex-direction: column; /* Alinha os botões verticalmente */
  gap: 15px; /* Espaçamento vertical entre os botões */
  width: 90%; /* Largura responsiva dos botões */
  max-width: 400px; /* Largura máxima */
}

.intention-button {
  background-color: var(--hemo-color-white); /* Fundo padrão branco */
  color: #b44236; /* Texto vermelho */
  font-weight: bold;
  width: 100%; /* O botão ocupa 100% da largura do contêiner pai */
  height: 48px; /* Altura fixa */
  border-radius: 8px; /* Bordas arredondadas */
  cursor: pointer;
  padding: 12px 0; /* Altura do botão */
  text-align: center; /* Centraliza o texto */
  font-size: 1rem;
  border: 2px solid #b44236; /* Borda vermelha */
  transition: all 0.3s ease; /* Transição suave */
}

.intention-button:hover {
  background-color: #ffd6d6; /* Fundo mais claro ao passar o mouse */
  color: #b44236; /* Texto permanece vermelho */
  border-color: #b44236; /* Borda permanece vermelha */
}

.intention-button.selected {
  background-color: #b44236; /* Fundo vermelho escuro ao ser selecionado */
  color: #fff; /* Texto branco */
  border-color: #b44236; /* Mesma cor do fundo */
  font-weight: bold; /* Texto em negrito */
}
</style>
