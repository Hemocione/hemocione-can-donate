import { InferSchemaType, Schema, model } from "mongoose";
import {
  getFailingQuestionsForContext,
  getQuestionsFromContext,
} from "~/utils/questions";

export const formModes = ["anonymous", "logged-in"] as const;

export const donationIntents = ["today", "soon", null] as const;

export type DonationIntent = (typeof donationIntents)[number];

export const formStatuses = [
  "able-to-donate",
  "unable-to-donate",
  "ongoing",
] as const;

export const answerValues = ["positive", "negative", "unknown"] as const;
export type AnswerValue = (typeof answerValues)[number];

const AnswerSchema = new Schema({
  value: {
    type: String,
    enum: answerValues,
  },
  answeredAt: {
    type: Date,
  },
});

const FormResponseSchema = new Schema(
  {
    mode: {
      type: String,
      enum: formModes,
    },
    client: {
      ip: {
        type: String,
      },
      geolocation: {
        type: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
      browser: {
        type: String,
      },
    },
    user: {
      id: String,
      name: String,
      email: String,
    },
    donationIntent: {
      type: String,
      enum: donationIntents,
    },
    answers: {
      type: Map,
      of: AnswerSchema,
    },
    startedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    finishedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: formStatuses,
      default: "ongoing",
    },
    failedQuestions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

FormResponseSchema.pre("save", function () {
  // Obtém as perguntas que devem ser respondidas no contexto atual
  const questionsToBeAnsweredSlugs = getQuestionsFromContext(
    this.donationIntent ?? null,
    this.mode === "anonymous"
  ).map((q) => q.slug);

  // Obtém as slugs das perguntas que já foram respondidas
  const answeredQuestionsSlugs = this.answers
    ? Array.from(this.answers.keys())
    : [];

  // Verifica se todas as perguntas necessárias foram respondidas
  const allQuestionsAnswered = questionsToBeAnsweredSlugs.every((slug) =>
    answeredQuestionsSlugs.includes(slug)
  );

  if (allQuestionsAnswered) {
    // Marca o formulário como finalizado
    this.finishedAt = new Date();

    // Remove as respostas que não são relevantes para o contexto atual
    const relevantAnswers = new Map();
    questionsToBeAnsweredSlugs.forEach((slug) => {
      if (this.answers?.has(slug)) {
        relevantAnswers.set(slug, this.answers.get(slug));
      }
    });

    // Atualiza o mapa de respostas com apenas as respostas relevantes
    this.answers = relevantAnswers;

    const answersObj = Object.fromEntries(this.answers);
    const failingQuestions = getFailingQuestionsForContext(
      answersObj,
      this.donationIntent ?? null,
      this.mode === "anonymous"
    );
    this.status = failingQuestions.length
      ? "unable-to-donate"
      : "able-to-donate";
    this.failedQuestions = failingQuestions.map((q) => q.slug);
  }
});

export type FormResponseSchema = InferSchemaType<typeof FormResponseSchema>;

export const FormResponse = model<FormResponseSchema>(
  "FormResponse",
  FormResponseSchema
);
export { FormResponseSchema };
