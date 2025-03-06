<template>
  <div class="eligibility-page">
    <header class="header">
      <NuxtImg src="images/logo-horizontal-branca.svg" alt="Logo Hemocione" class="logo" />
    </header>

    <main class="content">
      <h1>Posso doar?</h1>
      <p>
        Responda as perguntas mais frequentes sobre doação de sangue e descubra se você é
        elegível para doar sangue
      </p>

      <NuxtImg src="images/donation-illustration.png" alt="Ilustração de Doação" class="illustration" />
    </main>

    <div class="button-container">
      <button v-if="loggedIn" class="register-button" @click="goRegister" :disabled="loadingLogin">
        Continuar como <b>{{ user?.givenName }}</b>
      </button>
      <button v-else class="register-button" @click="goRegister" :disabled="loadingLogin">
        Acesse sua conta e descubra se pode doar
      </button>

      <button v-if="loggedIn" class="continue-button" @click="handleWrongUser" :disabled="loadingLogin">
        Não é você? Clique aqui para sair da conta
      </button>
      <button v-else class="continue-button" @click="goToIntention" :disabled="loadingLogin">
        Continuar sem conta →
      </button>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { redirectToID } from "~/middleware/auth";

const router = useRouter();
const userStore = useUserStore();
const { user, loadingLogin, loggedIn } = storeToRefs(userStore)

function goToIntention() {
  sessionStorage.setItem("anonymousMode", "true");
  router.push("/intention");
}

onMounted(() => {
  userStore.clearFormResponse();
  sessionStorage.removeItem("selectedIntent")
})

async function goRegister() {
  if (loggedIn.value) {
    sessionStorage.setItem("anonymousMode", "false");
    router.push("/intention");
  } else {
    sessionStorage.setItem("anonymousMode", "false");
    redirectToID("/intention");
  }
}

async function handleWrongUser() {
  redirectToID("/intention");
}
</script>

<style scoped>
.eligibility-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--hemo-color-white);
  height: 100dvh;
}

.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: var(--navbar-height);
  background-color: var(--hemo-color-primary-extra-light);
}

.content {
  background-color: var(--hemo-color-primary-extra-light);
  color: var(--hemo-color-white);
  padding: 20px;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  padding-bottom: 100px;
  width: 100%;
  height: calc((100dvh - var(--navbar-height))*0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 16px;
}

.content h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.content p {
  font-size: 1rem;
  margin: 0;
}

.illustration {
  height: 70%;
  max-width: 500px;
  max-height: 500px;
}

.button-container {
  background-color: var(--hemo-color-white);
  padding: 20px 20px 60px;
  width: 100%;
  height: calc((100dvh - var(--navbar-height))*0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.register-button,
.continue-button {
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  max-width: 400px;
  width: 90%;
  transition: opacity 0.3s ease, cursor 0.3s ease;
}

.register-button {
  background-color: var(--hemo-color-primary-less-light);
  color: var(--hemo-color-white);
  margin-top: 20px;
}

.continue-button {
  background: none;
  color: var(--hemo-color-primary);
  margin-top: 15px;
}

.register-button:disabled,
.continue-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
