<template>
  <div class="splash">
    <img
      src="/images/baseLogo.svg"
      alt="App logo"
      class="logo"
    />
  </div>
</template>

<style scoped>
.splash {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes zoom-in-zoom-out {
  0% { transform: scale(0.5); }
  50% { transform: scale(1); }
  100% { transform: scale(0.5); }
}
.logo {
  animation: zoom-in-zoom-out 5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    infinite;
}
</style>

<script setup lang="ts">
// --- Imports (externos e internos) ---
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { evaluateCurrentLogin } from '~/middleware/auth';
import { getIntegrationDefinition } from '~/utils/integrations';

import type { IntegrationPayload } from '~/utils/integrations'; 
import type { IntegrationSlug } from '~/server/models/formResponse';

definePageMeta({
  middleware: ['auth'],   // arquivo middleware/auth.ts
});

// --- Instâncias de rota/estado ---
const route  = useRoute();
const router = useRouter();
const userStore = useUserStore();

const integrationSlug = route.params.integrationSlug as IntegrationSlug | undefined;

if (!isIntegrationSlug(integrationSlug)) {
  navigateTo('/');
}

// 1) Qual integration chegou?
const integrationDefinition = getIntegrationDefinition(
  route.params.integrationSlug as string | undefined
);
if (!integrationDefinition) {
  navigateTo('/');
}

// 2) Constrói o payload específico
let payload: IntegrationPayload | null = null;
let intent: 'today' | 'soon' | null = null;
if (integrationDefinition) {
  const result = await integrationDefinition.buildPayload(route);

  if (result) {
    intent = result.intent;

    const { intent: _discard, ...rest } = result;
    payload = rest;
  }
}

if (!payload) {
  navigateTo('/');
}

// --- Controle de fluxo ---
const nextQuestionUrl = ref<string>('');

async function initializeQuestionnaire() {
  console.log('🔵 Iniciando página de integração...');

  // 2. Marca que começou
  sessionStorage.setItem('questionnaireStarted', 'true');

  // 4. Cria FormResponse já com o payload da integração
  await userStore.createFormResponse(integrationSlug, payload, intent);

  // 5. Integração que NÃO sabe a data da doação (ex.: ida a um banco de sangue
  //    por conta própria) deixa a pergunta para a própria pessoa: sem isso o
  //    questionário assumiria um contexto errado e faria perguntas que só valem
  //    para quem doa hoje.
  if (!intent) {
    router.replace('/intention');
    return;
  }

  sessionStorage.setItem('selectedIntent', intent);
  userStore.setDonationIntent(intent);

  // 6. Redireciona para a primeira pergunta
  const firstQuestionSlug = userStore.formQuestions[0]?.slug;
  if (firstQuestionSlug) {
    nextQuestionUrl.value = `/questions/${firstQuestionSlug}`;
    router.replace(nextQuestionUrl.value);
  } else {
    console.error('❌ Nenhuma pergunta encontrada para iniciar o questionário.');
  }
}

onMounted(async () => {
  const isLoggedIn = await evaluateCurrentLogin()
  if (isLoggedIn) {
    initializeQuestionnaire().catch(err =>
      console.error('❌ Erro ao inicializar questionário:', err)
    );
  }
});

onBeforeMount(async () => {
  console.log("onBeforeMount: formResponse");
  console.log(userStore.formResponse);
});
</script>
