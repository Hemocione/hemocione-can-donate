<template>
  <div class="intro-page">
    <header class="header">
      <NuxtImg
        src="images/logo-horizontal-branca.svg"
        alt="Logo Hemocione"
        class="logo"
      />
    </header>

    <header class="second-header">
      <button class="go-back-button" @click="goBack">
        <ElIconArrowLeftBold />
      </button>

      <span>Posso doar?</span>
    </header>

    <main class="content"></main>

    <!-- Drawer com conteúdo informativo -->
    <el-drawer
      v-model="drawer"
      :with-header="false"
      :direction="direction"
      :before-close="handleClose"
    >
      <p>
        Este questionário serve como uma orientação inicial com perguntas
        frequentes sobre a doação, mas não substitui a triagem realizada por
        profissionais de saúde no dia e no local da doação.
      </p>

      <el-button class="start-button"> Quero responder </el-button>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { DrawerProps } from "element-plus";

const drawer = ref(false);
const direction = ref<DrawerProps["direction"]>("btt");

const handleClose = (done: () => void) => {
  done();
};

onMounted(() => {
  drawer.value = true;
});

function goBack() {
  navigateTo("/");
}
</script>

<style scoped>
.intro-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #f8f8f8;
  color: #333;
  min-height: 100vh;
}

.header {
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: fit-content;
  background-color: var(--hemo-color-black-100);
}

.second-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  height: fit-content;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
}

.logo {
  width: 130px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.content p {
  font-size: 1rem;
  margin-bottom: 20px;
  padding: 0 20px;
}

.second-header p {
  font-size: 1.2rem;
}

.start-button {
  background-color: #b44236;
  color: #fff;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  max-width: 300px;
  width: 100%;
  margin-top: 20px;
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
</style>
