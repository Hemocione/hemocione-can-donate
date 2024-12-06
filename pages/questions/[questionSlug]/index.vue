<template>
  <div class="question-container">
    <div v-if="currentQuestion < questions.length" class="question">
      <NuxtImg
        src="images/hemocioneCake.png"
        alt="Foto celebrativa"
        class="bolo"
      />
      <h2 class="question">{{ questions[currentQuestion].question }}</h2>
      <p class="why">Por que essa pergunta?</p>
      <p class="question-subtext">
        {{ questions[currentQuestion].description }}
      </p>
      <!-- <a href="#" class="learn-more">Saiba mais</a> -->
    </div>
    <div v-else class="completion-message">
      <p>Você completou o questionário. Obrigado!</p>
    </div>

    <!-- Fixed button container at the bottom -->
    <div class="fixed-buttons">
      <el-button class="answer-button" @click="answerQuestion('positive')">
        Sim
      </el-button>
      <el-button class="answer-button" @click="answerQuestion('negative')">
        Não
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: "questionnaire" });

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const question = route.params.questionSlug;

//depois que a pessoa responder o sim ou não, eu vou mandar router.push para a proxima pergunta
//tenho a lista ordenada já na store

onMounted(() => {
  console.log("Questions on mount:", questions.value);
});

const questions = computed(() => {
  console.log(
    "Recomputing questions based on donationIntent:",
    userStore.donationIntent
  );
  return userStore.formQuestions;
});

const questionsLength = computed(() => {
  return questions.value.length;
});

// Watch for updates to formQuestions
watch(
  () => userStore.formQuestions,
  (newQuestions) => {
    console.log("Questions updated:", newQuestions);
  }
);
const currentQuestion = ref(0); // Controla a pergunta

// Avança para a próxima pergunta
async function answerQuestion(answer: string) {
  const questionId = questions.value[currentQuestion.value]?.id;

  console.log("Answer Slug (Question ID):", questionId);

  if (!userStore.formResponse || !userStore.formResponse._id) {
    console.error("Form response ID is missing in intro.vue.");
    return;
  }

  const answerData = {
    value: answer,
    answeredAt: new Date(),
  };

  console.log(
    `Resposta para "${
      questions.value[currentQuestion.value].question
    }": ${answer}`
  );

  // Chama a ação da store para atualizar a resposta no banco
  await userStore.updateAnswer(questionId, answerData);
  //DESCOMENTAR

  // Avança para a próxima pergunta
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value += 1;
  } else {
    finishQuestionnaire();
  }
}

// Finaliza o questionário
function finishQuestionnaire() {
  router.push("/"); // Navega para a página de término ou home, ajuste conforme necessário
}
</script>

<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.question {
  /* flex-grow: 1; */
  padding: 20px;
  /* overflow-y: auto; */
  color: var(--hemo-color-primary-less-dark);
  left: 50%;
}

.fixed-buttons {
  display: flex;
  justify-content: space-around;
  /* justify-content: center; */
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.answer-button {
  background-color: var(--hemo-color-white);
  color: #b44236;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  width: 160px;
  height: 48px;
  border: 2px solid #b44236;
}

.question-subtext {
  color: #555;
  font-size: 0.9rem;
  margin-top: 10px;
}

.learn-more {
  color: #b44236;
  text-decoration: underline;
  cursor: pointer;
}

.bolo {
  width: 208px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.progress-bar {
  display: flex; /* Define layout em linha */
  justify-content: center; /* Centraliza a barra */
  align-items: center; /* Alinha verticalmente */
  flex-wrap: nowrap; /* Evita que os itens quebrem de linha */
  gap: 10px; /* Define espaçamento fixo entre os elementos */
  margin: 20px 0;
  padding: 0 5px;
  overflow-x: auto; /* Adiciona rolagem horizontal se necessário */
}

.progress-dot {
  width: calc(
    100% / v-bind(questionsLength)
  ); /* Largura maior para o formato de pílula */
  height: 8px; /* Altura menor para deixar achatado */
  border-radius: 20px; /* Border-radius grande para o formato arredondado */
  background-color: #e0e0e0; /* Cor padrão (não ativa) */
  transition: background-color 0.3s;
}

.progress-dot.active {
  background-color: #b44236; /* Cor da pergunta atual */
}

.progress-dot.completed {
  background-color: #ffcccc; /* Cor das perguntas já respondidas */
}
</style>
