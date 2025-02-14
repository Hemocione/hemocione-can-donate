<template>
  <div class="result-container">
    <div v-if="isFailed" class="result-failed">
      <NuxtImg src="images/hemofalha.png" alt="Falha" class="result-image" />
      <h2 class="result-title">
        Infelizmente, você não pode doar neste momento.
      </h2>
      <p class="result-reason">
        {{ userStore.failingReasons }}
      </p>
      <p class="result-subtext">
        Você pode colaborar com o Hemocione e ajudar a salvar ainda mais vidas.
      </p>
      <div class="fixed-buttons">
        <el-button class="action-button">Seja um Irmão de Sangue</el-button>
        <el-button class="secondary-button" @click="goBack"
          >Voltar ao início</el-button
        >
      </div>
    </div>

    <div v-else class="result-success">
      <NuxtImg
        src="images/hemosucesso.png"
        alt="Sucesso"
        class="result-image"
      />
      <h2 class="result-title">Ótimo, você pode doar!</h2>
      <p class="result-reason">
        Suas respostas indicam que você pode ser elegível para doar sangue. No
        entanto, a triagem final será realizada por profissionais de saúde no
        dia e no local da doação.
      </p>
      <div class="fixed-buttons">
        <el-button class="action-button">Agendar doação em evento</el-button>
        <el-button class="secondary-button"
          >Encontrar bancos de sangue</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: "questionnaire", resultPage: true });

const userStore = useUserStore();
const router = useRouter();

// Computed properties para verificar o estado do formulário
const isFailed = computed(() => userStore.isFormFailed());
// const failingReason = computed(() => userStore.failingReason);

// Função para voltar à tela anterior
function goBack() {
  router.push("/");
}
</script>

<style scoped>
.result-container {
  padding: 20px;
  height: 100%;
}

.result-image {
  width: 150px;
  margin: 20px auto;
}

.result-title {
  color: var(--hemo-color-primary-medium);
  font-size: 1.5rem;
  margin: 10px 0;
}

.result-reason {
  color: var(--hemo-color-black-70);
  font-size: 1rem;
  margin: 10px 0;
}

.result-subtext {
  color: var(--hemo-color-black-60);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.action-button {
  background-color: var(--hemo-color-primary-medium);
  /* Vermelho do botão principal */
  color: white;
  font-weight: bold;
  width: 90%;
  /* Define a largura dos botões */
  max-width: 400px;
  /* Largura máxima para evitar distorção em telas grandes */
  height: 48px;
  border-radius: 8px;
  /* Bordas arredondadas */
  padding: 12px 0;
  /* Altura do botão */
  text-align: center;
  /* Centraliza o texto */
  font-size: 1rem;
  /* Tamanho do texto */
}

.fixed-buttons {
  display: flex;
  flex-direction: column;
  /* Alinha os botões verticalmente */
  align-items: center;
  /* Centraliza os botões horizontalmente */
  gap: 15px;
  /* Espaçamento vertical entre os botões */
  padding: 20px 0;
  /* Espaçamento interno */
  background-color: white;
  border-top: 1px solid var(--hemo-color-black-15);
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: var(--hemo-page-max-width);
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
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
</style>
