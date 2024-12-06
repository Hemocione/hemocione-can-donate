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
    <p>Qual é a sua intenção de doação?</p>
    <div class="intention-buttons">
      <el-button class="intention-button" @click="selectIntent('today')">
        Hoje
      </el-button>
      <el-button class="intention-button" @click="selectIntent('this-week')">
        Esta Semana
      </el-button>
      <el-button class="intention-button" @click="selectIntent('future')">
        Futuro
      </el-button>
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

const handleClose = (done: () => void) => {
  drawer.value = false;
  done();
};

// Abre o drawer automaticamente ao carregar a página
onMounted(async () => {
  drawer.value = true;

  // Cria a form response ao iniciar a intenção de doar
  // Trocar para criar só quando clicar no botão de começar? (Colocaria dentro de starQuestionnaire)
  // await userStore.createFormResponse();
});

async function startQuestionnaire() {
  drawer.value = false;
  showFirstQuestion.value = true;

  const response = await userStore.createFormResponse();
  userStore.setFormResponse(response);
  //DESCOMENTAR
  console.log("FormResponse created in startQuestionnaire");
}

//TODO - ir para a primeira pergunta
function selectIntent(intent: "today" | "this-week" | "future") {
  userStore.setDonationIntent(intent);
  userStore.updateDonationIntent(intent);
  router.push("/questions/[questionSlug]");
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
}

.intention-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 20px;
  justify-content: center;
}

.intention-button {
  background-color: #b44236;
  color: #fff;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
