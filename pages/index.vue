<template>
  <div class="eligibility-page">
    <header class="header">
      <NuxtImg src="images/logo-horizontal-branca.svg" alt="Logo Hemocione" class="logo" />
    </header>

    <main class="content">
      <h1>Posso doar?</h1>
      <p>
        Responda as perguntas mais frequentes sobre doação de sangue e descubra se você é
        elegível para doar 😀
      </p>

      <NuxtImg src="images/donation-illustration.png" alt="Ilustração de Doação" class="illustration" />
    </main>

    <div class="button-container">
      <button v-if="isLoggedIn" class="register-button" @click="goRegister">
        Continuar como {{ userStore.user?.givenName }}
      </button>
      <button v-else class="register-button" @click="goRegister">
        Cadastre-se e descubra se pode doar
      </button>

      <button v-if="isLoggedIn" class="continue-button" @click="logOut">
        Não sou {{ userStore.user?.givenName }}
      </button>
      <button v-else class="continue-button" @click="goToIntention">
        Continuar sem cadastro →
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
const isLoggedIn = computed(() => userStore.loggedIn);

function goToIntention() {
  // User chooses to continue without registering
  sessionStorage.setItem("anonymousMode", "true");
  router.push("/intention");
}

onMounted(() => {
  userStore.clearFormResponse();
  sessionStorage.removeItem("selectedIntent")
})

async function goRegister() {
  if (isLoggedIn.value) {
    // ✅ If the user is logged in, update the form mode
    sessionStorage.setItem("anonymousMode", "false");

    if (userStore.formResponse?._id) {
      await userStore.updateFormMode("logged-in");
    }

    router.push("/intention");
  } else {
    // ✅ User is not logged in, trigger login redirect
    sessionStorage.setItem("anonymousMode", "false");
    redirectToID("/intention");
  }
}

async function logOut() {
  await userStore.logOut();
  sessionStorage.setItem("anonymousMode", "true");
  router.push("/");

}
</script>

<style scoped>
.eligibility-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--hemo-color-white);
  height: 100vh;
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

/* Seção de conteúdo com fundo colorido */
.content {
  background-color: var(--hemo-color-primary-extra-light);
  color: var(--hemo-color-white);
  padding: 20px;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  padding-bottom: 100px;
  width: 100%;
  height: calc((100vh - var(--navbar-height))*0.7);
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
  height: calc((100vh - var(--navbar-height))*0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.register-button {
  background-color: var(--hemo-color-primary-less-light);
  color: var(--hemo-color-white);
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  max-width: 400px;
  width: 90%;
}

.continue-button {
  background: none;
  color: var(--hemo-color-primary);
  font-size: 1rem;
  margin-top: 15px;
  border: none;
  cursor: pointer;
}
</style>
