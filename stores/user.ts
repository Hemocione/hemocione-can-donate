import { defineStore } from "pinia";
import { redirectToID } from "~/middleware/auth";
import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";
import { getQuestionsFromContext, type Question } from "~/utils/questions";
import type { IntegrationPayload } from "~/utils/integrations";
import type { IntegrationSlug } from "~/server/models/formResponse";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
    formResponse: null as any, // To be replaced with a specific type if available
    donationIntent: null as "today" | "soon" | null,
    loadingLogin: true as boolean,
    iframed: false as boolean,
    iframeValidated: false as boolean,
  }),
  getters: {
    formQuestions(state) {
      const isAnonymous = !state.user;
      return getQuestionsFromContext(state.donationIntent, isAnonymous);
    },
    failedQuestions(state): Question[] {
      if (!state.formResponse?.failedQuestions) {
        return [];
      }

      return getFilteredQuestions(state.formResponse.failedQuestions);
    },
    failingReasons(): string {
      // Verifica se há respostas no formulário
      const reasons = this.failedQuestions
        .map((q) => q?.failingReason)
        .filter(Boolean);

      // Junta as razões com vírgulas
      return reasons.length > 0
        ? reasons.join(" ")
        : "Nenhum motivo registrado.";
    },
    loggedIn: (state) => Boolean(state.user),
    isFormFailed(state) {
      return state.formResponse?.status === "unable-to-donate";
    },
  },
  actions: {
    setIsIframed(value: boolean) {
      this.iframed = value;
      this.iframeValidated = true;
    },
    setUser(user: CurrentUserData | null) {
      this.user = user;
    },
    setToken(token: string | null) {
      this.token = token;
    },
    setLoadingLogin(val: Boolean) {
      this.loadingLogin = val;
    },
    setFormResponse(formResponse: any) {
      this.formResponse = formResponse;
      console.log("Form response set in the store:", this.formResponse);
    },
    setDonationIntent(intent: "today" | "soon" | null) {
      this.donationIntent = intent;
    },
    // failingReason() {
    //   return this.formResponse?.failingReason || "Nenhum motivo registrado.";
    // },
    clearFormResponse() {
      sessionStorage.removeItem("selectedIntent");
      this.formResponse = null;
    },

    async ensureFormResponse(retryCount = 0) {
      if (!this.formResponse || !this.formResponse._id) {
        console.log("Form response not found. Creating a new one...");
        const response = await this.createFormResponse();
        if (response) {
          this.setFormResponse(response);
          console.log("New form response created:", response);
        } else if (retryCount < 3) {
          await this.ensureFormResponse(retryCount + 1);
        }
      }
    },

    async createFormResponse(integrationSlug: IntegrationSlug | null = null, integrationPayload: IntegrationPayload | null = null) {
    try {
        const formResponse = await $fetch("/api/v1/formResponse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: {
            integration: integrationSlug && integrationPayload
              ? { integrationSlug, payload: integrationPayload }
              : null,
          }       
         });

        this.setFormResponse(formResponse);
        console.log(
          "✅ FormResponse stored with mode:",
          this.formResponse.mode
        );
        return formResponse;
      } catch (error) {
        console.error("🚨 Error creating form response:", error);
      }
    },

    async logOut() {
      try {
        console.log("🚪 Logging out...");

        // await $fetch("/api/v1/logout", {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${this.token}`,
        //   },
        // }).catch((error) => console.warn("⚠️ Logout request failed:", error));

        // Clear user data
        this.setUser(null);
        this.setToken(null);
        this.setFormResponse(null);
        this.setDonationIntent(null);

        // Reset session storage to anonymous mode
        sessionStorage.setItem("anonymousMode", "true");
        const config = useRuntimeConfig();
        redirectToID(config.public.siteUrl);

        console.log("✅ Successfully logged out.");
      } catch (error) {
        console.error("🚨 Error during logout:", error);
      }
    },

    async updateDonationIntent(intent: "today" | "soon") {
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

        this.setFormResponse({
          ...this.formResponse,
          answers: {
            ...this.formResponse.answers,
            [answerSlug]: updatedAnswerResponse.updatedAnswer,
          },
          status: updatedAnswerResponse.status,
          failedQuestions: updatedAnswerResponse.failedQuestions,
        });
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
