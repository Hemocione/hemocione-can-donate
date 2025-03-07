<template>
  <div class="result-container" ref="result">
    <div v-if="isFormFailed" class="result-failed">
      <NuxtImg src="/images/hemofalha.svg" alt="Falha" class="result-image" />
      <h2 class="result-title">
        Parece que você não pode doar neste momento.
      </h2>

     <div class="result-reason-container">
  <ul class="result-reason-list">
    <li v-for="reason in failingReasons" :key="reason">
      {{ reason }}
    </li>
  </ul>
</div>

      <p class="result-subtext">
        Você pode colaborar com o Hemocione e ajudar a salvar ainda mais vidas.
      </p>
      <div class="fixed-buttons">
        <el-button class="action-button" @click="goIrmaoDeSangue">Seja um Irmão de Sangue</el-button>
        <el-button class="secondary-button" @click="goBack"
          >Voltar ao início</el-button
        >
      </div>
    </div>

    <div v-else class="result-success">
      <NuxtImg
        src="/images/hemosucesso.svg"
        alt="Sucesso"
        class="result-image"
      />
      <h2 class="result-title">Ótimo, você pode doar!</h2>
      <p class="result-reason">
        Suas respostas indicam que você pode ser elegível para doar sangue. No
        entanto, a triagem final será realizada por profissionais de saúde no
        dia e no local da doação.
      </p>
      <div class="fixed-buttons">
        <el-button class="action-button" @click="goAgendarDoacao">Agendar doação em evento</el-button>
        <el-button class="secondary-button" @click="goOndeDoar"
          >Encontrar bancos de sangue</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useRuntimeConfig } from "#app";
import party from "party-js";
party.settings.gravity = 600

definePageMeta({ layout: "questionnaire", resultPage: true });
const userStore = useUserStore();
const router = useRouter();
const config = useRuntimeConfig();

const result = ref<HTMLDivElement | null>(null);

const { isFormFailed } = storeToRefs(userStore);

const eventosHemocione: string = (config.public.eventosHemocione as string) ?? "";
const apoieHemocione: string = (config.public.apoieHemocione as string) ?? "";
const ondeDoarHemocione: string = (config.public.ondeDoarHemocione as string) ?? "";

const failingReasons = computed(() => {
  if (!userStore.failingReasons) return [];
  return userStore.failingReasons.split(". ").filter(Boolean);
});

function goAgendarDoacao() {
  navigateTo(eventosHemocione, { external: true });
}

function goIrmaoDeSangue() {
  navigateTo(apoieHemocione, { external: true });
}

function goOndeDoar() {
  navigateTo(ondeDoarHemocione, { external: true });
}

function goBack() {
  router.push("/");
}

onMounted(() => {
  // use delay to avoid confetti on page load and transition
  setTimeout(() => {
    if (isFormFailed.value || !result.value) return

    const isLowPerfDevice = window.navigator.hardwareConcurrency <= 4;
    party.confetti(result.value, {
      count: party.variation.range(isLowPerfDevice ? 50 : 150, isLowPerfDevice ? 150 : 400),
      size: party.variation.range(0.8, 2),
      speed: party.variation.range(200, 700),
    });
  }, 300)
})
</script>

<style scoped>
.result-container {
  padding: 20px;
  height: 100%;
}

.result-image {
  width: 150px;
  margin: 20px auto;
}

.result-title {
  color: var(--hemo-color-primary-medium);
  font-size: 1.5rem;
  margin: 10px 0;
}

.result-reason {
  color: var(--hemo-color-black-70);
  font-size: 1rem;
  margin: 10px 0;
}

.result-subtext {
  color: var(--hemo-color-black-60);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.action-button {
  background-color: var(--hemo-color-primary-medium);
  /* Vermelho do botão principal */
  color: white;
  font-weight: bold;
  width: 90%;
  /* Define a largura dos botões */
  max-width: 400px;
  /* Largura máxima para evitar distorção em telas grandes */
  height: 48px;
  border-radius: 8px;
  /* Bordas arredondadas */
  padding: 12px 0;
  /* Altura do botão */
  text-align: center;
  /* Centraliza o texto */
  font-size: 1rem;
  /* Tamanho do texto */
}

.fixed-buttons {
  display: flex;
  flex-direction: column;
  /* Alinha os botões verticalmente */
  align-items: center;
  /* Centraliza os botões horizontalmente */
  gap: 15px;
  /* Espaçamento vertical entre os botões */
  padding: 20px 0;
  /* Espaçamento interno */
  background-color: white;
  border-top: 1px solid var(--hemo-color-black-15);
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: var(--hemo-page-max-width);
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.result-reason-container {
  background-color: var(--hemo-color-light-yellow); /* Light beige background */
  padding: 12px 16px;
  border-radius: 8px; /* Rounded corners */
  display: inline-block; /* Ensures it fits the content width */
  max-width: fit-content; /* Prevents it from stretching */
}

.result-reason-list {
  padding-left: 20px; /* Keeps bullet indentation */
  list-style-position: inside; /* Ensures bullets stay inside the box */
  color: var(--hemo-color-black-70);
  font-size: 1rem;
  margin: 0; /* Prevents extra spacing */
}

.result-reason-list li {
  margin-bottom: 5px;
  display: flex;
  align-items: flex-start;
  gap: 5px; 
  white-space: normal; 
  word-wrap: break-word; 
}

.result-reason-list li::before {
  content: "•"; 
  margin-right: 5px;
  font-weight: bold;
  color: var(--hemo-color-primary-medium);
}

.secondary-button {
  background-color: white;
  /* Fundo branco */
  color: var(--hemo-color-primary-medium);
  /* Texto vermelho */
  border: 2px solid var(--hemo-color-primary-medium);
  /* Borda vermelha */
  font-weight: bold;
  width: 90%;
  height: 48px;
  max-width: 400px;
  border-radius: 8px;
  padding: 12px 0;
  text-align: center;
  font-size: 1rem;
}
</style>
