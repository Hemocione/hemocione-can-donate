<template>
  <div class="splash">
    <img
      src="/images/baseLogo.svg"
      alt="App logo"
      class="logo"
    />
  </div>
</template>

<style>
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
import {
  getIntegrationDefinition,
  type IntegrationPayload,
  type EventsIntegration
} from '~/utils/integrations';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
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

// 1) Qual integration chegou?
const integrationDefinition = getIntegrationDefinition(
  route.params.integrationSlug as string | undefined
);

// 2) Constrói o payload específico
let payload: IntegrationPayload | null = integrationDefinition.buildPayload(route);

if (!payload) {
  console.error('❌ Parâmetros insuficientes para construir o payload');
  // Opcional: router.replace('/erro');
}

// Desestrutura o que você realmente usa
const integrationSlug = payload?.integrationSlug;
const eventSlug  = (payload as EventsIntegration | null)?.eventSlug;
const eventDate  = (payload as EventsIntegration | null)?.eventDate;

// --- Helpers de data / intent ---
function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || dayjs.tz.guess();
}

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
  console.table({ integrationSlug, eventSlug, eventDate });

  // 2. Marca que começou
  sessionStorage.setItem('questionnaireStarted', 'true');

  // 3. Define intenção da doação
  const intent = computeDonationIntent(eventDate as string | undefined);

  // 4. Cria FormResponse já com o payload da integração
  await userStore.createFormResponse(payload);
  sessionStorage.setItem('selectedIntent', intent);
  userStore.setDonationIntent(intent);
  await userStore.updateDonationIntent(intent);

  // 5. Redireciona para a primeira pergunta
  const firstQuestionSlug = userStore.formQuestions[0]?.slug;
  if (firstQuestionSlug) {
    nextQuestionUrl.value = `/questions/${firstQuestionSlug}`;
    router.push(nextQuestionUrl.value);
  } else {
    console.error('❌ Nenhuma pergunta encontrada para iniciar o questionário.');
  }
}

onMounted(() => {
  initializeQuestionnaire().catch(err =>
    console.error('❌ Erro ao inicializar questionário:', err)
  );
});
</script>
