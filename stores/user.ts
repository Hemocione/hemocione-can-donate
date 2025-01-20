import { defineStore } from "pinia";
import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";
import questions, { getQuestionsFromContext } from "~/utils/questions";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
    formResponse: null as any, // To be replaced with a specific type if available
    donationIntent: "null" as "today" | "this-week" | "future" | null,
  }),
  getters: {
    formQuestions(state) {
      const isAnonymous = !state.user;
      return getQuestionsFromContext(state.donationIntent, isAnonymous);
    },
    failingReasons: (state) => {
      // Verifica se há respostas no formulário
      if (!state.formResponse?.answers) {
        return "Nenhum motivo registrado.";
      }

      // Itera sobre as respostas e acumula razões de falha
      const reasons = Object.keys(state.formResponse.answers)
        .map((answerSlug) => {
          const question = questions.find((q) => q.slug === answerSlug);
          const answer = state.formResponse.answers[answerSlug];
          if (question && question.failingResponses.includes(answer.value)) {
            return question.failingReason;
          }
          return null;
        })
        .filter((reason) => reason !== null); // Remove valores nulos ou indefinidos

      // Junta as razões com vírgulas
      return reasons.length > 0
        ? reasons.join(" ")
        : "Nenhum motivo registrado.";
    },
  },
  actions: {
    setUser(user: CurrentUserData | null) {
      this.user = user;
    },
    setToken(token: string | null) {
      this.token = token;
    },
    setFormResponse(formResponse: any) {
      this.formResponse = formResponse;
      console.log("Form response set in the store:", this.formResponse);
    },
    setDonationIntent(intent: "today" | "this-week" | "future" | null) {
      this.donationIntent = intent;
    },
    isFormFailed() {
      return this.formResponse?.status === "failed";
    },
    // failingReason() {
    //   return this.formResponse?.failingReason || "Nenhum motivo registrado.";
    // },

    async ensureFormResponse() {
      if (!this.formResponse || !this.formResponse._id) {
        console.log("Form response not found. Creating a new one...");
        const response = await this.createFormResponse();
        if (response) {
          this.setFormResponse(response);
          console.log("New form response created:", response);
        } else {
          console.error("Failed to create a form response.");
          throw new Error("Failed to create form response");
        }
      }
    },
    

    async createFormResponse() {
      try {
        const userStore = useUserStore();
        const formResponse = await $fetch("/api/v1/formResponse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: userStore.user ? "logged-in" : "anonymous",
            client: {
              ip: "123.456.789.123",
              geolocation: {
                latitude: -22.9068,
                longitude: -43.1729,
              },
              browser: navigator.userAgent,
            },
            user: userStore.user
              ? {
                  id: userStore.user.id,
                  name: userStore.user.surName,
                  email: userStore.user.email,
                }
              : null,
            donationIntent: userStore.donationIntent,
            status: "ongoing",
            answers: {}, // Inicializa o campo answers como objeto vazio
          }),
        });

        this.setFormResponse(formResponse);
        return formResponse;
      } catch (error) {
        console.error("Error creating form response:", error);
      }
    },

    async updateDonationIntent(intent: "today" | "this-week" | "future") {
      await this.ensureFormResponse(); // Garante que formResponse está definido
      try {
        const updatedIntentResponse = await $fetch(
          `/api/v1/formResponse/${this.formResponse._id}/intention`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: { donationIntent: intent },
          }
        );

        this.setFormResponse({
          ...this.formResponse,
          donationIntent: updatedIntentResponse.updatedIntent,
        });
      } catch (error) {
        console.error("Error updating donation intent:", error);
      }
    },

    async updateAnswer(
      answerSlug: string,
      answerData: { value: string; answeredAt: Date }
    ) {
      await this.ensureFormResponse(); // Garante que formResponse está definido
      try {
        const updatedAnswerResponse = await $fetch(
          `/api/v1/formResponse/${this.formResponse._id}/answers/${answerSlug}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: answerData,
          }
        );

        console.log("Answer updated successfully:", updatedAnswerResponse);

        const question = questions.find((q) => q.slug === answerSlug);
        if (question && question.failingResponses.includes(answerData.value)) {
          this.setFormResponse({
            ...this.formResponse,
            status: "failed",
            failingReason: question.failingReason,
          });
        } else {
          this.setFormResponse({
            ...this.formResponse,
            answers: {
              ...this.formResponse.answers,
              [answerSlug]: updatedAnswerResponse.updatedAnswer,
            },
          });
        }
      } catch (error) {
        console.error("Error updating answer:", error);
      }
    },

    async fetchFormResponse() {
      await this.ensureFormResponse(); // Garante que formResponse está definido
      try {
        const formResponse = await $fetch(
          `/api/v1/formResponse/${this.formResponse._id}`,
          {
            method: "GET",
          }
        );
        this.setFormResponse(formResponse);
        return formResponse;
      } catch (error) {
        console.error("Error fetching form response:", error);
      }
    },
  },
});
