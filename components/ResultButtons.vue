<template>
  <div class="fixed-buttons">
    <!-- NOVO: Renderização dinâmica se buttonConfig existir e tiver itens -->
    <template v-if="buttonConfig && buttonConfig.length">
      <template v-for="(btn, idx) in buttonConfig" :key="idx">
        <el-button
          :class="btn.type === 'primary' ? 'action-button' : 'secondary-button'"
          v-if="btn.visible !== false"
          @click="handleButtonClick(btn)"
        >
          {{ btn.label }}
        </el-button>
      </template>
    </template>
    <!-- Fluxo antigo como fallback -->
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
import { useRuntimeConfig } from "#app";

const props = defineProps<{
  isFormFailed: boolean;
  iframeValidated: boolean;
  iframed: boolean;
  onAgendarDoacao?: () => void;
  onIrmaoDeSangue?: () => void;
  onOndeDoar?: () => void;
  onBack?: () => void;
  buttonConfig?: Array<{
    label: string;
    type: "primary" | "secondary";
    onClick?: () => void;
    url?: string;
    visible?: boolean;
  }>;
}>();

const userStore = useUserStore();
const router = useRouter();
const config = useRuntimeConfig();

const { isFormFailed, iframed, iframeValidated } = storeToRefs(userStore);

function onSecondarySuccessClick() {
  if (props.iframed) {
    props.onBack && props.onBack();
  } else {
    props.onOndeDoar && props.onOndeDoar();
  }
}

const eventosHemocione: string =
  (config.public.eventosHemocione as string) ?? "";
const apoieHemocione: string = (config.public.apoieHemocione as string) ?? "";
const ondeDoarHemocione: string =
  (config.public.ondeDoarHemocione as string) ?? "";

function onAgendarDoacao() {
  props.onAgendarDoacao && props.onAgendarDoacao();
}

function onIrmaoDeSangue() {
  props.onIrmaoDeSangue && props.onIrmaoDeSangue();
}

function onOndeDoar() {
  props.onOndeDoar && props.onOndeDoar();
}

function onBack() {
  props.onBack && props.onBack();
}

// Handler para botões dinâmicos
function handleButtonClick(btn: {
  onClick?: () => void;
  url?: string;
}) {
  if (btn.onClick) {
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