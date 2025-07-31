<template>
  <div
    class="intro-page"
    :style="{
      '--flex-navbar-height':
        iframeValidated && iframed ? '0px' : 'var(--navbar-height)',
    }"
  >
    <header :class="{ header: true, hide: !iframeValidated }" v-if="!iframed">
      <div class="logo-and-badge">
        <NuxtImg
          src="images/logo-horizontal-branca.svg"
          alt="Logo Hemocione"
          class="logo"
        />

        <div class="hemo-badge">POSSO DOAR</div>
      </div>

      <ClientOnly>
        <ElButton v-if="loggedIn" type="primary" size="small" @click="logOut">
          {{ buttonText }}
          <el-icon class="el-icon--right">
            <NuxtImg
              :src="loggedIn ? '/images/logout.svg' : '/images/login.svg'"
              alt="ícone de autenticação"
              height="10"
            />
          </el-icon>
        </ElButton>
        <ElButton v-else type="primary" size="small" @click="goRegister">
          {{ buttonText }}
          <el-icon class="el-icon--right">
            <NuxtImg
              :src="loggedIn ? '/images/logout.svg' : '/images/login.svg'"
              alt="ícone de autenticação"
              height="10"
            />
          </el-icon>
        </ElButton>
      </ClientOnly>
    </header>

    <header class="second-header" v-auto-animate>
      <button
        class="go-back-button"
        key="go-back"
        @click="goBack"
        v-if="!isResultPage"
      >
        <ElIconArrowLeftBold />
      </button>
      <span key="header-text">Posso doar?</span>
      <button
        key="close"
        class="close-button"
        @click="close"
        v-if="!isResultPage"
      >
        <ElIconClose />
      </button>
    </header>

    <el-drawer
      v-model="drawer"
      :with-header="false"
      :direction="direction"
      :before-close="handleClose"
      :size="'fit-content'"
    >
      <div class="drawer-content">
        <p style="padding: 0 0 16px; margin: 0; text-align: left">
          Deseja sair do questionário? Suas respostas não serão salvas, mas você
          pode voltar e refazer em outro momento.
        </p>
        <el-button class="exit-button" @click="exitQuestionnaire">
          Sair do questionário
        </el-button>
        <el-button class="continue-button" @click="closeDrawer">
          Continuar questionário
        </el-button>
      </div>
    </el-drawer>

    <main class="content">
      <Transition name="slide-fade-down" mode="out-in" appear>
        <div v-if="isQuestionsRoute" class="progress-bar">
          <div
            v-for="(question, index) in questions"
            :key="index"
            class="progress-dot"
            :class="{
              active: index === currentQuestionIndex,
              completed: isQuestionAnswered(index),
              finalSuccess: isFormCompleted && !isFormFailed,
              finalFailed: isFormCompleted && isFormFailed,
            }"
            :style="{ width: `${100 / questions.length}%` }"
            @click="goToQuestion(index)"
          ></div>
        </div>
      </Transition>
      <div
        :class="{ 'route-wrapper': true, 'question-route': isQuestionsRoute }"
      >
        <slot />
      </div>
      <!-- Espaço para conteúdo específico -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";
import { redirectToID } from "~/middleware/auth";
import type { DrawerProps } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { user, loadingLogin, loggedIn, iframed, iframeValidated } =
  storeToRefs(userStore);
const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("btt");
const selectedIntent = ref<"today" | "soon" | null>(null);

const buttonText = computed(() => {
  return user.value ? `Sair (${user.value?.givenName?.trim()})` : "Entrar";
});

const handleClose = (done: () => void) => {
  drawer.value = false;
  done();
};

async function goRegister() {
  if (loggedIn.value) {
    sessionStorage.setItem("anonymousMode", "false");
    router.push("/intention");
  } else {
    sessionStorage.setItem("anonymousMode", "false");
    redirectToID(`/`);
  }
}

async function logOut() {
  await userStore.logOut();
  sessionStorage.setItem("anonymousMode", "true");
  router.push("/");
}

const { isFormFailed } = storeToRefs(userStore);

const isFormCompleted = computed(() => {
  return currentQuestionIndex.value === -1;
});

const isQuestionsRoute = computed(() => {
  return route.path.startsWith("/questions");
});

const isIntentionRoute = computed(() => {
  return route.path.startsWith("/intention");
});

const currentQuestionSlug = computed(() => {
  return route.params.questionSlug;
});

const isResultPage = computed(() => {
  return route.meta.resultPage;
});

const questions = computed(() => {
  console.log(
    "Recomputing questions based on donationIntent:",
    userStore.donationIntent
  );
  return userStore.formQuestions;
});

const currentQuestionIndex = computed(() => {
  return questions.value.findIndex((question) => {
    return question.slug == currentQuestionSlug.value;
  });
});

const questionsLength = computed(() => {
  return questions.value.length;
});

async function goBack() {
  // Verifica se existe integration no formResponse
  const hasIntegration = userStore.formResponse?.integration != null;
  
  if (isIntentionRoute.value || isResultPage.value) {
    if (hasIntegration) {
      try {
        const formResponse = userStore.formResponse;
        const integrationSlug = formResponse?.integration?.integrationSlug;
        
        if (integrationSlug) {
          const integrationDef = getIntegrationDefinition(integrationSlug);
          
          if (integrationDef?.getRedirectURL) {
            const url = await integrationDef.getRedirectURL(formResponse);
            
            if (url) {
              await navigateTo(url, { external: true });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao redirecionar para integração:', error);
      }
      
      // Fallback: se algo der errado, vai para a página inicial
      router.push("/");
    } else {
      router.push("/");
    }
  } else if (hasIntegration && currentQuestionIndex.value == 0) {
      try {
        const formResponse = userStore.formResponse;
        const integrationSlug = formResponse?.integration?.integrationSlug;
        
        if (integrationSlug) {
          const integrationDef = getIntegrationDefinition(integrationSlug);
          
          if (integrationDef?.getRedirectURL) {
            const url = await integrationDef.getRedirectURL(formResponse);
            
            if (url) {
              await navigateTo(url, { external: true });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao redirecionar para integração:', error);
      }
  } else {
    router.back();
  }
}

// onMounted(() => {
//   window.addEventListener('popstate', goBack, false)
// })

// onUnmounted(() => {
//   window.removeEventListener('popstate', goBack, false)
// })

function close() {
  // Lógica para fechar
  drawer.value = true;
}

function closeDrawer() {
  drawer.value = false; // Fecha o drawer
}

function resetSelection() {
  selectedIntent.value = null; // Reseta a intenção selecionada
}

async function exitQuestionnaire() {
  console.log("Saindo do questionário...");

  const hasIntegration = userStore.formResponse?.integration != null;
  const currentFormResponse = userStore.formResponse; // Salva referência antes de limpar

  // Limpa o sessionStorage
  sessionStorage.removeItem("questionnaireStarted");
  sessionStorage.removeItem("selectedIntent");

  // Reseta o estado no userStore
  userStore.setFormResponse(null);
  userStore.setDonationIntent(null);

  resetSelection();

  if (hasIntegration && currentFormResponse) {
    try {
      const integrationSlug = currentFormResponse.integration?.integrationSlug;
      
      if (integrationSlug) {
        const integrationDef = getIntegrationDefinition(integrationSlug);
        
        if (integrationDef?.getRedirectURL) {
          const url = await integrationDef.getRedirectURL(currentFormResponse);
          
          if (url) {
            await navigateTo(url, { external: true });
            return;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao redirecionar para integração:', error);
    }
  }
}

watchEffect(() => {
  console.log("✅ isFormCompleted:", isFormCompleted.value);
  console.log("❌ isFormFailed:", isFormFailed.value);
  console.log("🔢 currentQuestionIndex:", currentQuestionIndex.value);
  console.log("📊 Total Questions:", questionsLength.value);
});

function isQuestionAnswered(index: number): boolean {
  if (index < 0 || index >= questions.value.length) {
    return false;
  }

  const questionSlug = questions.value[index]?.slug;
  if (!questionSlug) return false;

  return !!userStore.formResponse?.answers?.[questionSlug];
}

async function goToQuestion(index: number) {
  if (index < 0 || index >= questions.value.length) return;

  const answeredIndices = questions.value
    .map((_, i) => (isQuestionAnswered(i) ? i : -1))
    .filter((i) => i !== -1);

  const highestAnsweredIndex = answeredIndices.length
    ? Math.max(...answeredIndices)
    : -1;

  const isGoingBackwardToAnswered =
    index <= highestAnsweredIndex && isQuestionAnswered(index);

  const isNextQuestion = index === highestAnsweredIndex + 1;

  if (!isGoingBackwardToAnswered && !isNextQuestion) {
    console.warn("⚠️ Not allowed to jump to that question yet.");
    return;
  }

  const questionSlug = questions.value[index].slug;
  await router.push(`/questions/${questionSlug}`);
}
</script>

<style scoped>
.intro-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--hemo-color-black-5);
  color: var(--hemo-color-black-90);
  height: 100dvh;
}

.route-wrapper {
  width: 100%;
  height: 100%;
}

.question-route {
  height: calc(100% - 2rem);
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--flex-navbar-height);
  background-color: var(--hemo-color-black-100);
  padding-right: 1rem;
  padding-left: 1rem;
}

.logo-and-badge {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.hemo-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 9999px;
  font-size: 8px;
  letter-spacing: 0.05rem;
  text-align: center;
  background-color: var(--hemo-color-primary);
  color: var(--hemo-color-white);
  margin-top: 6.5px;
}

.second-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-width: var(--hemo-page-max-width);
  height: 53px;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
  background-color: var(--hemo-color-white);
}

.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.content {
  width: 100%;
  max-width: var(--hemo-page-max-width);
  background-color: var(--hemo-color-white);
  height: calc(
    100% - var(--flex-navbar-height) - var(--secondary-header-height)
  );
}

.content p {
  font-size: 1rem;
  margin-bottom: 20px;
  padding: 0 20px;
}

.second-header p {
  font-size: 1.2rem;
}

.go-back-button {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-items: center;
}

.go-back-button svg {
  width: 1rem;
  height: 1rem;
}

.close-button {
  all: unset;
  /* Remove estilos padrão */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  /* Alinha o botão no extremo direito */
}

.close-button svg {
  width: 1.2rem;
  height: 1.2rem;
}

.exit-button {
  background-color: var(--hemo-color-primary-medium);
  color: var(--hemo-color-white);
  font-weight: bold;
  border-radius: 8px;
  padding: 10px 20px;
  width: 100%;
  height: 48px;
}

.drawer-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.continue-button {
  background: none;
  color: var(--hemo-color-primary-medium);
  font-weight: bold;
  border: none;
  cursor: pointer;
  padding: 10px;
  padding-top: 20px;
  margin-top: 15px;
  height: 48px;
  width: 100%;
}

.progress-bar {
  display: flex;
  /* Define layout em linha */
  justify-content: center;
  /* Centraliza a barra */
  align-items: center;
  /* Alinha verticalmente */
  flex-wrap: nowrap;
  /* Evita que os itens quebrem de linha */
  gap: 10px;
  /* Define espaçamento fixo entre os elementos */
  padding: 0 1rem;
  height: 2rem;
  overflow-x: auto;
  /* Adiciona rolagem horizontal se necessário */
}

.progress-dot {
  width: calc(100% / var(--questions-length));
  height: 8px;
  border-radius: 20px;
  background-color: var(--hemo-color-black-15);
  transition: background-color 0.4s ease-in-out, transform 0.3s ease,
    box-shadow 0.3s ease;
}

.progress-dot.active {
  background-color: var(--hemo-color-primary-medium) !important;
  transform: scale(1.1);
  box-shadow: 0 0 5px rgba(var(--hemo-color-primary-medium), 0.6);
}

.progress-dot.completed {
  background-color: var(--hemo-color-primary-ultra-light);
}

.progress-dot.finalSuccess {
  background-color: var(--hemo-color-success) !important;
  box-shadow: 0 0 8px rgba(var(--hemo-color-success), 0.8);
}

.progress-dot.finalFailed {
  background-color: var(--hemo-color-light-yellow) !important;
  box-shadow: 0 0 8px rgba(var(--hemo-color-light-yellow), 0.8);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
