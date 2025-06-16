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
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import type { IntegrationPayload, EventsIntegration } from '~/utils/integrations'; 
import { getIntegrationDefinition } from '~/utils/integrations';
import { evaluateCurrentLogin } from '~/middleware/auth';
import { getUserTimeZone } from '~/utils/getUserTimeZone';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { IntegrationSlug } from '~/server/models/formResponse';
dayjs.extend(utc);
dayjs.extend(timezone);

definePageMeta({
  middleware: ['auth'],   // arquivo middleware/auth.ts
  ssr: false              // client-only page
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

// 2) Constrói o payload específico
let payload: IntegrationPayload | null = null;
if (integrationDefinition) {
  payload = await integrationDefinition.buildPayload(route);
}

if (!payload) {
  navigateTo('/');
}

// Desestrutura o que você realmente usa
const eventDate  = (payload as EventsIntegration | null)?.eventDate;

function computeDonationIntent(
  isoDate?: string | Date
): 'today' | 'soon' {
  if (!isoDate) return 'soon';

  const tz = getUserTimeZone();
  const eventDay = dayjs.utc(isoDate).tz(tz).startOf('day');
  const today    = dayjs().tz(tz).startOf('day');

  return today.isBefore(eventDay) ? 'soon' : 'today';
}

// --- Controle de fluxo ---
const nextQuestionUrl = ref<string>('');

async function initializeQuestionnaire() {
  console.log('🔵 Iniciando página de integração...');

  // 2. Marca que começou
  sessionStorage.setItem('questionnaireStarted', 'true');

  // 3. Define intenção da doação
  const intent = computeDonationIntent(eventDate as string | undefined);

  // 4. Cria FormResponse já com o payload da integração
  await userStore.createFormResponse(integrationSlug, payload, intent);
  sessionStorage.setItem('selectedIntent', intent);
  userStore.setDonationIntent(intent);
  // await userStore.updateDonationIntent(intent);

  // 5. Redireciona para a primeira pergunta
  const firstQuestionSlug = userStore.formQuestions[0]?.slug;
  if (firstQuestionSlug) {
    nextQuestionUrl.value = `/questions/${firstQuestionSlug}`;
    router.push(nextQuestionUrl.value);
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
</script>
