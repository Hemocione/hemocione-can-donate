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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { evaluateCurrentLogin, redirectToID } from "~/middleware/auth";

// Captura da rota e store
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// Captura dos parâmetros da rota
const integrationSlug = route.params.integrationSlug as string;
const eventSlug = route.query.eventSlug as string | undefined;
const eventDate = route.query.eventDate as string | undefined;

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const integration = {
  slug: integrationSlug,
  params: { eventSlug, eventDate },
};

function getUserTimeZone(): string {
  // Fallback para dayjs.tz.guess() quando a API do browser falha
  return Intl.DateTimeFormat().resolvedOptions().timeZone || dayjs.tz.guess();
}

function computeDonationIntent(eventDateISO?: string): 'today' | 'soon' {
  if (!eventDateISO) return 'soon';

  const tz = getUserTimeZone();

  // Convertendo a data recebida em UTC para TimeZone do usuário
  const eventDay = dayjs.utc(eventDateISO).tz(tz).startOf('day');
  const today = dayjs().tz(tz).startOf('day');

  // Se hoje for antes da data recebida → "soon"
  return today.isBefore(eventDay) ? 'soon' : 'today';
}

// Variável que vai guardar a URL para a próxima pergunta
const nextQuestionUrl = ref<string>("");

// Função que inicializa o questionário
async function initializeQuestionnaire() {
  console.log("🔵 Iniciando página de integração...");
  console.log("🔹 integrationSlug:", integrationSlug);
  console.log("🔹 eventSlug:", eventSlug);
  console.log("🔹 eventDate:", eventDate);

  // Verifica se usuário está logado
  const isLoggedIn = await evaluateCurrentLogin();
  if (!isLoggedIn) {
    console.warn("⚠️ Usuário não autenticado. Deveria ser redirecionado para login.");
    redirectToID(window.location.pathname + window.location.search);
    return;
  }
  console.log("✅ Usuário autenticado:", userStore.user);

  // Marca que o questionário foi iniciado
  sessionStorage.setItem("questionnaireStarted", "true");
  console.log("📌 questionnaireStarted salvo na sessionStorage");

  // Define a intenção de doação ("today" ou "soon")
  const intent = computeDonationIntent(eventDate);

  await userStore.createFormResponse(integration);
  sessionStorage.setItem("selectedIntent", intent);
  userStore.setDonationIntent(intent);
  await userStore.updateDonationIntent(intent);
  console.log(`📌 selectedIntent salvo como: '${intent}'`);

  // Recupera a primeira pergunta disponível
  const firstQuestionSlug = userStore.formQuestions[0]?.slug;
  if (firstQuestionSlug) {
    nextQuestionUrl.value = `/questions/${firstQuestionSlug}`;
    console.log("➡️ Próxima URL para onde o usuário será redirecionado:", nextQuestionUrl.value);

    // Faz o redirecionamento de fato
    router.push(nextQuestionUrl.value);
  } else {
    console.error("❌ Nenhuma pergunta encontrada para iniciar o questionário.");
  }
}

// Inicializa no momento em que a página montar
onMounted(() => {
initializeQuestionnaire().catch(error => {
  console.error("❌ Erro ao inicializar questionário:", error);
  });
});

</script>
