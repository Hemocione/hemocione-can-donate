<template>
  <div class="fixed-buttons">
    <!-- Fluxo com integração -->
    <template v-if="buttonConfig && buttonConfig.length">
      <template v-for="(btn, idx) in buttonConfig" :key="idx">
        <el-button
          :class="btn.type === 'primary' ? 'action-button' : 'secondary-button'"
          v-if="btn.visible !== false"
          @click="handleBtnClick(btn)"
        >
          {{ btn.label }}
        </el-button>
      </template>
    </template>

    <!-- Fluxo sem integração -->
    <template v-else>
      <!-- Falha no formulário -->
      <template v-if="isFormFailed">
        <el-button
          class="action-button"
          v-if="iframeValidated && !iframed"
          @click="onIrmaoDeSangue"
        >
          Seja um Irmão de Sangue
        </el-button>
        <el-button class="secondary-button" @click="onBack">
          Voltar ao início
        </el-button>
      </template>
      <!-- Sucesso no formulário -->
      <template v-else>
        <el-button
          class="action-button"
          v-if="iframeValidated && !iframed"
          @click="onAgendarDoacao"
        >
          Agendar doação em evento
        </el-button>
        <el-button
          class="secondary-button"
          v-if="iframeValidated"
          @click="onSecondarySuccessClick"
        >
          {{ iframed ? "Voltar ao início" : "Encontrar bancos de sangue" }}
        </el-button>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";
import { navigateTo } from "#app";
import { getIntegrationDefinition } from "~/utils/integrations";
import type { ButtonConfig } from "~/utils/integrations";

const props = defineProps<{
  isFormFailed: boolean;
  iframeValidated: boolean;
  iframed: boolean;
  onAgendarDoacao?: () => void;
  onIrmaoDeSangue?: () => void;
  onOndeDoar?: () => void;
  onBack?: () => void;
  buttonConfig?: ButtonConfig[];
}>();

const userStore = useUserStore();
const router = useRouter();

const { isFormFailed, iframed, iframeValidated } = storeToRefs(userStore);

// Helper function to add query parameters for hemocione.com.br domains
function addHemocioneQueryParams(url: string): string {
  try {
    const urlObj = new URL(url);

    // Check if domain includes hemocione.com.br
    if (urlObj.hostname.includes("hemocione.com.br")) {
      // Add iframed parameter if iframed is true
      if (iframed.value) {
        urlObj.searchParams.set("iframed", "true");
      }

      // Add token parameter if user has a token
      if (userStore.token) {
        urlObj.searchParams.set("token", userStore.token);
      }
    }

    return urlObj.toString();
  } catch (error) {
    console.error("Error modifying URL:", error);
    return url;
  }
}

function onSecondarySuccessClick() {
  if (props.iframed) {
    props.onBack && props.onBack();
  } else {
    props.onOndeDoar && props.onOndeDoar();
  }
}

function handleBtnClick(btn: ButtonConfig) {
  if (btn.url) {
    const modifiedUrl = addHemocioneQueryParams(btn.url);
    navigateTo(modifiedUrl, { external: true });
  } else if (btn.onClick) {
    btn.onClick();
  }
}
</script>

<style scoped>
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
