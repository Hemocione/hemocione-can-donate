<template>
  <div class="result-container" ref="result">
    <div v-if="isFormFailed" class="result-failed">
      <NuxtImg
        src="/images/hemofalha.svg"
        alt="Falha"
        class="result-image"
        width="150"
        height="150"
      />
      <h2 class="result-title">Parece que você não pode doar neste momento.</h2>

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
      <ResultButtons
        :isFormFailed="isFormFailed"
        :iframeValidated="iframeValidated"
        :iframed="iframed"
        :onIrmaoDeSangue="goIrmaoDeSangue"
        :onBack="goBack"
        :buttonConfig="buttonConfig"
      />
    </div>

    <div v-else class="result-success">
      
      <NuxtImg
        src="/images/hemosucesso.svg"
        alt="Sucesso"
        class="result-image"
        width="150"
        height="150"
      />
      <h2 class="result-title">Ótimo, você pode doar!</h2>
      <p class="result-reason">
        Suas respostas indicam que você pode ser elegível para doar sangue. No
        entanto, a triagem final será realizada por profissionais de saúde no
        dia e no local da doação.
      </p>
      <ResultButtons
        :isFormFailed="isFormFailed"
        :iframeValidated="iframeValidated"
        :iframed="iframed"
        :onAgendarDoacao="goAgendarDoacao"
        :onOndeDoar="goOndeDoar"
        :onBack="goBack"
        :buttonConfig="buttonConfig"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { useRuntimeConfig } from "#app";
import party from "party-js";
import ResultButtons from "~/components/ResultButtons.vue";
import { ref, onMounted, computed } from 'vue';
import { getIntegrationDefinition, type ButtonConfig } from '~/utils/integrations';
party.settings.gravity = 600;

definePageMeta({
  layout: "questionnaire",
  resultPage: true,
  blockDirectAccess: true,
});

const userStore = useUserStore();
const router = useRouter();
const config = useRuntimeConfig();
const result = ref<HTMLDivElement | null>(null);
const buttonConfig = ref<ButtonConfig[]>([]);

const { isFormFailed, iframed, iframeValidated } = storeToRefs(userStore);

const handleSecondarySuccessClick = () => {
  if (iframed.value) {
    goBack();
  } else {
    goOndeDoar();
  }
};

const eventosHemocione: string =
  (config.public.eventosHemocione as string) ?? "";
const apoieHemocione: string = (config.public.apoieHemocione as string) ?? "";
const ondeDoarHemocione: string =
  (config.public.ondeDoarHemocione as string) ?? "";

const failingReasons = computed(() => {
  if (!userStore.failingReasons) return [];
  return userStore.failingReasons.split(". ").filter(Boolean);
});

onBeforeMount(async () => {
  const formResponse = userStore.formResponse;
  const integrationSlug = formResponse?.integration?.integrationSlug;
  if (integrationSlug) {
    const integrationDef = getIntegrationDefinition(integrationSlug);
    if (integrationDef?.getButtonConfig) {
      buttonConfig.value = await integrationDef.getButtonConfig(formResponse);
    }
  }
})

onMounted(async () => {
  setTimeout(() => {
    if (isFormFailed.value || !result.value) return;

    const isLowPerfDevice = window.navigator.hardwareConcurrency <= 4;
    party.confetti(result.value, {
      count: party.variation.range(
        isLowPerfDevice ? 50 : 150,
        isLowPerfDevice ? 150 : 400
      ),
      size: party.variation.range(0.8, 2),
      speed: party.variation.range(200, 700),
    });
  }, 300);
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
</script>

<style scoped>
.result-container {
  padding: 20px;
  min-height: calc(100% - 120px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 20px;
  flex: 1;
  max-width: 100%;
}

.result-failed,
.result-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: flex-start;
  width: 100%;
}

.result-image {
  width: 150px;
  margin: 20px auto;
  flex-shrink: 0;
}

.result-title {
  color: var(--hemo-color-primary-medium);
  font-size: 1.5rem;
  margin: 10px 0;
  max-width: 600px;
  line-height: 1.3;
}

.result-reason {
  color: var(--hemo-color-black-70);
  font-size: 1rem;
  margin: 10px 0;
  max-width: 600px;
  line-height: 1.5;
}

.result-subtext {
  color: var(--hemo-color-black-60);
  font-size: 0.9rem;
  margin-bottom: 20px;
  max-width: 600px;
}

.result-reason-container {
  background-color: var(--hemo-color-light-yellow);
  padding: 12px 16px;
  border-radius: 8px;
  display: inline-block;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.result-reason-list {
  padding-left: 20px;
  list-style-position: inside;
  color: var(--hemo-color-black-70);
  font-size: 1rem;
  margin: 0;
  text-align: left;
}

.result-reason-list li {
  margin-bottom: 5px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
}

.result-reason-list li::before {
  content: "•";
  margin-right: 5px;
  font-weight: bold;
  color: var(--hemo-color-primary-medium);
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .result-container {
    padding: 16px;
  }
  
  .result-title {
    font-size: 1.3rem;
  }
  
  .result-reason,
  .result-subtext {
    font-size: 0.95rem;
  }
  
  .result-reason-container {
    max-width: 100%;
    margin: 0 10px;
  }
}

@media (max-width: 480px) {
  .result-container {
    padding: 12px;
  }
  
  .result-title {
    font-size: 1.2rem;
  }
  
  .result-image {
    width: 120px;
    margin: 15px auto;
  }
}
</style>
