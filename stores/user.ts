import { defineStore } from "pinia";
import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
    formResponse: null as any, // To be replaced with a specific type if available
    donationIntent: null as "today" | "this-week" | "future" | null,
  }),
  getters: {
    formQuestions: (state) => {
      console.log("Getting formQuestions for intent:", state.donationIntent);

      const baseQuestions = [
        {
          question: "Você tem 50kg ou mais?",
          slug: "weight",
          description:
            "O peso mínimo para doar sangue é 50kg para garantir a sua segurança.",
        },
      ];

      let questions = [...baseQuestions];

      // Add questions for anonymous users
      if (!state.user) {
        console.log("Adding questions for anonymous users.");
        questions.push({
          question: "Você tem 16 anos ou mais?",
          slug: "age",
          description: "É importante saber sua idade",
        });
      }

      // Add questions based on donation intent
      if (state.donationIntent === "today") {
        console.log("Adding questions for 'today' intent.");
        questions = [
          ...questions,
          {
            question: "Se alimentou bem hoje?",
            slug: "ateToday",
            description: "É importante estar bem alimentado",
          },
          {
            question: "Teve uma boa noite de sono?",
            slug: "sleptOk",
            description: "É importante ter dormido bem",
          },
          {
            question: "Ingeriu bebidas alcoólicas nas últimas 12 horas?",
            slug: "alcohol",
            description:
              "É importante não usar quantidades industriais de droga",
          },
          {
            question:
              "Participou de alguma atividade sexual de risco nos últimos 3 meses?",
            slug: "sexRisk",
            description: "Descricao sexual",
          },
          {
            question: "Fez tatuagem ou piercing nos últimos 6 meses?",
            slug: "tattooOrPiercing",
            description: "Descricao piercing",
          },
          {
            question: "Possui piercing na boca ou genital?",
            slug: "mouthPiercing",
            description: "LALALLLALLAL piercing na boca",
          },
          {
            question: "Fez algum tratamento médico nos últimos 6 meses?",
            slug: "medicalTreatmentOrSurgery",
            description: "Tratamento médico",
          },
        ];
      } else if (state.donationIntent === "this-week") {
        console.log("Adding questions for 'this-week' intent.");
        questions = [
          ...questions,
          {
            question: "Participou de atividade sexual de risco?",
            slug: "sexRisk",
            description: "É importante sex",
          },
          {
            question: "Fez tatuagem ou piercing recente?",
            slug: "tattooOrPiercing",
            description: "É importante piercing",
          },
          {
            question: "Possui piercing na boca ou genital?",
            slug: "mouthPiercing",
            description: "É importante piercicng boca",
          },
          {
            question: "Fez tratamento médico recente?",
            slug: "medicalTreatmentOrSurgery",
            description: "É importante médicoe",
          },
        ];
      } else if (state.donationIntent === "future") {
        console.log("Adding questions for 'future' intent.");
        questions = [
          ...questions,
          {
            question: "Are you open to donate in the next month?",
            slug: "futureAvailability",
            description: "É importante proximo mes",
          },
          {
            question: "Do you have any planned medical treatments?",
            slug: "plannedTreatments",
            description: "É importante tratamentos",
          },
        ];
      }

      console.log("Final question list:", questions);
      return questions;
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
    setDonationIntent(intent: "today" | "this-week" | "future") {
      this.donationIntent = intent;
    },

    async createFormResponse() {
      try {
        const userStore = useUserStore(); // Use caso tenha informações do usuário
        const formResponse = await $fetch("/api/v1/formResponse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: userStore.user ? "logged-in" : "anonymous",
            client: {
              ip: "123.456.789.123", // Isso pode ser recuperado do servidor, se possível
              geolocation: {
                latitude: -22.9068,
                longitude: -43.1729,
              },
              browser: navigator.userAgent, // Pega o user agent do navegador
            },
            user: userStore.user
              ? {
                  id: userStore.user.id,
                  name: userStore.user.surName,
                  email: userStore.user.email,
                }
              : null,
            donationIntent: userStore.donationIntent, // A intenção inicial se estiver disponível
            status: "ongoing",
            async createFormResponse() {
              try {
                const userStore = useUserStore(); // Use caso tenha informações do usuário
                const formResponse = await $fetch("/api/v1/formResponse", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    mode: userStore.user ? "logged-in" : "anonymous",
                    client: {
                      ip: "123.456.789.123", // Isso pode ser recuperado do servidor, se possível
                      geolocation: {
                        latitude: -22.9068,
                        longitude: -43.1729,
                      },
                      browser: navigator.userAgent, // Pega o user agent do navegador
                    },
                    user: userStore.user
                      ? {
                          id: userStore.user.id,
                          name: userStore.user.surName,
                          email: userStore.user.email,
                        }
                      : null,
                    donationIntent: userStore.donationIntent, // A intenção inicial se estiver disponível
                    status: "ongoing", // Status inicial
                  }),
                });

                this.setFormResponse(formResponse); // Armazena a resposta no estado da store

                return formResponse;
              } catch (error) {
                console.error("Error creating form response:", error);
              }
            },
          }),
        });

        this.setFormResponse(formResponse); // Armazena a resposta no estado da store

        return formResponse;
      } catch (error) {
        console.error("Error creating form response:", error);
      }
    },

    async updateDonationIntent(intent: "today" | "this-week" | "future") {
      try {
        const updatedIntentResponse = await $fetch(
          `/api/v1/formResponse/${this.formResponse._id}/intention`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: { donationIntent: intent },
          }
        );

        this.donationIntent = intent; // Update the donation intent in the store

        // Merge the updated intent response with the existing formResponse data
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
      // Verify that `answerSlug` and `formResponse._id` are defined
      if (!answerSlug || !this.formResponse || !this.formResponse._id) {
        console.error("answerSlug or formResponse._id is missing:", {
          answerSlug,
          formResponseId: this.formResponse?._id,
        });
        return;
      }

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

        // Merge the updated answer into the existing formResponse.answers without replacing the whole formResponse
        this.setFormResponse({
          ...this.formResponse,
          answers: {
            ...this.formResponse.answers,
            [answerSlug]: updatedAnswerResponse.updatedAnswer,
          },
        });
      } catch (error) {
        console.error("Error updating answer:", error);
      }
    },

    async fetchFormResponse() {
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
