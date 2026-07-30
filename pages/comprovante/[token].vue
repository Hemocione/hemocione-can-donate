<template>
  <div class="card" v-if="comprovante">
    <NuxtImg
      src="/images/baseLogo.svg"
      alt="Hemocione"
      class="logo"
      width="120"
      height="40"
    />

    <h1 class="title">Comprovante de pré-triagem</h1>

    <p class="name">{{ comprovante.displayName }}</p>
    <p class="date">{{ formattedDate }}</p>

    <div class="verdict" :class="verdictClass">
      <span class="verdict-label">Resultado</span>
      <strong class="verdict-value">{{ verdictText }}</strong>
    </div>

    <p class="disclaimer">
      Esta pré-triagem é uma orientação e <strong>não substitui</strong> a
      triagem oficial feita por profissional de saúde no local da doação.
    </p>

    <p class="code">cód: {{ shortCode }}</p>
  </div>

  <div class="card" v-else>
    <h1 class="title">Comprovante não encontrado</h1>
    <p class="disclaimer">
      Este link não corresponde a nenhuma pré-triagem concluída. Confira se você
      copiou o endereço completo.
    </p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const token = String(route.params.token);

definePageMeta({ layout: "comprovante" });

// O endpoint devolve 404 para token invalido; nao queremos que isso derrube a
// pagina, e sim que caia no estado "nao encontrado".
const { data: comprovante } = await useFetch<{
  displayName: string;
  finishedAt: string;
  status: "able-to-donate" | "unable-to-donate";
}>(`/api/v1/formResponse/public/${token}`, {
  key: `comprovante-${token}`,
  default: () => null,
});

const formattedDate = computed(() => {
  if (!comprovante.value?.finishedAt) return "";
  return new Date(comprovante.value.finishedAt).toLocaleString("pt-BR", {
    // Fuso fixo: um comprovante e documento de evidencia, entao a hora nele nao
    // pode mudar conforme o fuso de quem abre o link. Quem confere a
    // participacao pode estar em outro fuso que quem fez a pre-triagem.
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const isAble = computed(() => comprovante.value?.status === "able-to-donate");

const verdictText = computed(() =>
  isAble.value ? "APTO NESTE MOMENTO" : "NÃO APTO NESTE MOMENTO",
);

const verdictClass = computed(() =>
  isAble.value ? "verdict--able" : "verdict--unable",
);

const shortCode = computed(() => `${token.slice(0, 4)}…${token.slice(-2)}`);

useHead({ title: "Comprovante de pré-triagem — Hemocione" });
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px 24px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  color: #3c4043;
  box-sizing: border-box;
}

.logo {
  margin: 0 auto 16px;
}

.title {
  font-size: 1.25rem;
  margin: 0 0 24px;
  color: var(--hemo-color-primary-medium, #d32f2f);
}

.name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.date {
  font-size: 0.9rem;
  color: #6b6f73;
  margin: 4px 0 24px;
}

.verdict {
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.verdict--unable {
  background-color: var(--hemo-color-light-yellow, #fff8e1);
}

.verdict--able {
  background-color: #e8f5e9;
}

.verdict-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b6f73;
}

.verdict-value {
  font-size: 1.1rem;
}

.disclaimer {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #6b6f73;
  margin: 0 0 16px;
}

.code {
  font-size: 0.7rem;
  color: #9aa0a6;
  margin: 0;
  font-family: monospace;
}
</style>
