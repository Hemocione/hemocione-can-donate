<template>
  <img src="/images/baseLogo.svg" class="logo" />
</template>

<style scoped>
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

const integration = {
  slug: integrationSlug,
  params: { eventSlug, eventDate },
};

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
  let intent: "today" | "soon" = "soon"; // valor padrão

  if (eventDate) {
    try {
      // Separamos manualmente o ano, mês e dia da string
      const [year, month, day] = eventDate.split("-").map(Number);

      // Criamos o Date no timezone local, sem UTC
      const eventDateObj = new Date(year, month - 1, day);
      const today = new Date();

      if (eventDateObj.getDay() === today.getDay()) {
        intent = "today";
        console.log("📆 eventDate é hoje. Definindo intenção como 'today'.");
      } else {
        intent = "soon";
        console.log("📆 eventDate não é hoje. Definindo intenção como 'soon'.");
      }
    } catch (error) {
      console.error("❌ Erro ao interpretar eventDate:", error);
      // fallback: mantém "soon"
    }
  } else {
    console.warn("⚠️ Nenhuma eventDate fornecida. Intenção padrão 'soon' será usada.");
  }

  await userStore.createFormResponse(integration)
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
  initializeQuestionnaire();
});

</script>
