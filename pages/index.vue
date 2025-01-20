<template>
  <div class="eligibility-page">
    <header class="header">
      <NuxtImg
        src="images/logo-horizontal-branca.svg"
        alt="Logo Hemocione"
        class="logo"
      />
    </header>

    <main class="content">
      <h1>Posso doar?</h1>
      <p>
        Responda as perguntas mais frequentes sobre doação e descubra se você é
        elegível para doar sangue
      </p>

      <NuxtImg
        src="images/donation-illustration.png"
        alt="Ilustração de Doação"
        class="illustration"
      />
    </main>

    <div class="button-container">
      <button class="register-button" @click="goRegister">
        Cadastre-se e descubra se pode doar
      </button>
      <button class="continue-button" @click="goToIntention">
        Continuar sem cadastro →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { redirectToID } from "~/middleware/auth";

const router = useRouter();

function goToIntention() {
  router.push("/intention");
}

function goRegister() {
  // const redirectPath = "/register";
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
}
.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}
.header {
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: fit-content;
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
}

.content h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 20px 0;
}

.content p {
  font-size: 1rem;
  margin-bottom: 30px;
}

.illustration {
  width: 100%;
  max-width: 300px;
  /* margin: 20px 0; */
}

.button-container {
  background-color: var(--hemo-color-white);
  padding: 20px 20px 60px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
