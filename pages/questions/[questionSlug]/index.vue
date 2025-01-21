<template>
  <div class="question-container">
    <!-- Pergunta Atual -->

    <div class="question-content">
      <div v-if="!isLastQuestion" :key="`question-${currentQuestionIndex}`">
        <NuxtImg
          :src="questions[currentQuestionIndex]?.image"
          alt="Foto celebrativa"
          class="bolo"
        />
        <h2 class="question-title">
          {{ questions[currentQuestionIndex]?.question }}
        </h2>
        <p class="why">Por que essa pergunta?</p>
        <p class="question-description">
          {{ questions[currentQuestionIndex]?.description }}
        </p>
      </div>

      <!-- Mensagem de Conclusão -->
      <div v-else :key="'completion'" class="completion-message">
        <p>Você completou o questionário. Obrigado!</p>
      </div>
    </div>

    <!-- Botões fixos na parte inferior -->
    <div class="fixed-buttons">
      <el-button
        class="answer-button"
        :class="{ selected: selectedAnswer === 'positive' }"
        @click="answerQuestion('positive')"
      >
        Sim
      </el-button>
      <el-button
        class="answer-button"
        :class="{ selected: selectedAnswer === 'negative' }"
        @click="answerQuestion('negative')"
      >
        Não
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";

// Define o layout do questionário
definePageMeta({ layout: "questionnaire" });

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const selectedAnswer = ref<string | null>(null); // Armazena a resposta selecionada para a pergunta atual
// const dropdown = ref();

// Obtemos as perguntas ordenadas da store
const questions = computed(() => {
  console.log(
    "Recomputing questions based on donationIntent:",
    userStore.donationIntent
  );
  return userStore.formQuestions;
});

// Encontramos o índice da pergunta atual com base no slug da rota
const currentQuestionIndex = computed(() => {
  const currentSlug = route.params.questionSlug;
  return questions.value.findIndex((question) => question.slug === currentSlug);
});

// Atualizamos sempre que as perguntas mudarem
watch(
  () => userStore.formQuestions,
  (newQuestions) => {
    console.log("Questions updated:", newQuestions);
  }
);

watch(
  () => currentQuestionIndex.value,
  (newIndex, oldIndex) => {
    console.log(`Transição de ${oldIndex} para ${newIndex}`);
  }
);

const isLastQuestion = computed(
  () => currentQuestionIndex.value >= questions.value.length
);

let answerlock = false; 

// Função chamada ao responder uma pergunta
async function answerQuestion(answer: string) {

  if (answerlock) return;
  answerlock = true;  

  const currentIndex = currentQuestionIndex.value;

  selectedAnswer.value = answer;

  console.log("Current Question Index:", currentQuestionIndex.value);

  // Obtemos a pergunta atual e o ID dela
  const questionId = String(questions.value[currentIndex]?.slug);
  console.log("Answer Slug (Question ID):", questionId);

  if (!userStore.formResponse || !userStore.formResponse._id) {
    console.error("Form response ID is missing.");
    return;
  }

  const answerData = {
    value: answer,
    answeredAt: new Date(),
  };

  console.log(
    `Resposta para "${questions.value[currentIndex].question}": ${answer}`
  );

  // Atualizamos a resposta na store e no banco de dados
  await userStore.updateAnswer(questionId, answerData);

  const updatedAnswers = {
    ...userStore.formResponse.answers,
    [questionId]: { value: answer, answeredAt: new Date() },
  };

  userStore.setFormResponse({
    ...userStore.formResponse,
    answers: updatedAnswers,
  });

  console.log("Resposta atualizada:", updatedAnswers);

  setTimeout(() => {
    const nextIndex = currentIndex + 1;
  if (nextIndex < questions.value.length) {
    const nextQuestionSlug = questions.value[nextIndex]?.slug;

    if (nextQuestionSlug) {
      router.push(`/questions/${nextQuestionSlug}`);
    } else {
      console.error(
        "Próxima pergunta não encontrada. Finalizando o questionário."
      );
      finishQuestionnaire();
    }
  } else {
    finishQuestionnaire();
  }
  answerlock = false; 
  }, 300);
}

await nextTick(); // Aguarda o Vue atualizar o DOM

// Finaliza o questionário após a última pergunta
function finishQuestionnaire() {
  const isFailed = userStore.isFormFailed();
  if (isFailed) {
    router.push("/questions/result?status=failed");
  } else {
    router.push("/questions/result?status=success");
  }
}

// Log para depuração no carregamento da página
onMounted(() => {
  const currentIndex = currentQuestionIndex.value;
  const currentQuestionSlug = String(questions.value[currentIndex]?.slug);

  // Garante que answers existe antes de tentar acessá-lo
  const existingAnswer =
    userStore.formResponse?.answers?.[currentQuestionSlug]?.value || null;

  selectedAnswer.value = existingAnswer;

  // console.log("Questions on mount:", questions.value);
  // console.log("Current Question Index:", currentQuestionIndex.value);
  console.log("Resposta existente ao carregar:", existingAnswer);
});
</script>

<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  /* height: 100vh; */
}

.question {
  /* flex-grow: 1; */
  /* padding: 20px; */
  /* overflow-y: auto; */
  color: var(--hemo-color-primary-less-dark);
  left: 50%;
}

.question-title {
  color: var(--hemo-color-primary-less-dark);
  text-align: left;
  /* margin-left: 20px; */
  margin: 0;
  padding-bottom: 15px;
}

.fixed-buttons {
  display: flex;
  gap: 8px;
  /* justify-content: space-around; */
  /* justify-content: center; */
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: var(--hemo-page-max-width);
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
}

.answer-button {
  background-color: var(--hemo-color-white); /* Fundo padrão branco */
  color: #b44236; /* Texto vermelho */
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  height: 48px;
  border: 2px solid #b44236; /* Borda vermelha */
  transition: all 0.3s ease; /* Transição suave */
}

.answer-button:hover {
  background-color: #ffd6d6; /* Fundo mais claro ao passar o mouse */
  color: #b44236; /* Texto permanece vermelho */
  border-color: #b44236; /* Borda permanece vermelha */
}

.answer-button.selected {
  background-color: #b44236; /* Fundo vermelho escuro ao ser selecionado */
  color: #fff; /* Texto branco */
  border-color: #b44236; /* Mesma cor do fundo */
}

.why {
  color: var(--hemo-color-black-80);
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
  text-align: left;
  /* margin-left: 20px; */
}

.question-subtext {
  color: #555;
  font-size: 0.9rem;
  margin-top: 10px;
}

.question-description {
  text-align: left;
  /* margin-left: 20px; */
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

/* .progress-dot {
  width: calc(
    100% / v-bind(questionsLength)
  ); 
  height: 8px; 
  border-radius: 20px; 
  background-color: #e0e0e0;  */
/* transition: background-color 0.3s; */
/* } */

.progress-dot {
  flex: 1; /* Cada dot ocupa o mesmo espaço proporcional */
  max-width: 40px; /* Define um limite máximo para a largura */
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

.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
