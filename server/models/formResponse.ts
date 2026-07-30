import { randomBytes } from "node:crypto";
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

export const integrationSlugs = [
  'event-flow-schedule',
  'event-ticket-adhoc',
  'competition-participation',
] as const;

export type IntegrationSlug = typeof integrationSlugs[number];

// Schema “base” (só diz qual é o discriminator key)
export const IntegrationBaseSchema = new Schema(
  {
    integrationSlug: {
      type: String,
      required: true,
      enum: integrationSlugs,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false, discriminatorKey: "integrationSlug" }
);

IntegrationBaseSchema.discriminator(
  "event-flow-schedule",
  new Schema(
    {
      payload: {
        eventSlug: { type: String, required: true },
        eventDate: { type: Date, required: true },
      },
    },
    { _id: false }
  )
);

IntegrationBaseSchema.discriminator(
  "event-adhoc-ticket",
  new Schema(
    {
      payload: {
        eventSlug: { type: String, required: true },
        eventDate: { type: Date, required: true },
      },
    },
    { _id: false }
  )
);

IntegrationBaseSchema.discriminator(
  "competition-participation",
  new Schema(
    {
      payload: {
        competitionSlug: { type: String, required: true },
        // Path RELATIVO sobre a base allowlistada em runtimeConfig.
        // Nunca URL completa — seria open-redirect, ja que o can-donate faz
        // navigateTo(url, { external: true }) com usuario logado.
        returnPath: { type: String, required: true },
      },
    },
    { _id: false }
  )
);

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
    integration: {
      type: IntegrationBaseSchema,
      default: null,          // allows it to be null / omitted
    },

    // Identificador do comprovante publico de pre-triagem.
    //
    // Nao usamos o _id: ObjectId embute timestamp e counter, logo e
    // parcialmente enumeravel — e do outro lado do link ha veredito de
    // triagem de pessoa identificavel.
    //
    // sparse e OBRIGATORIO: os documentos que ja existem na colecao nao tem
    // este campo, e num indice unique nao-sparse o Mongo trata ausente como
    // null — mais de um documento sem o campo colidiria e a criacao do indice
    // falharia.
    publicToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => randomBytes(16).toString("hex"), // 16 bytes -> 32 chars hex
    },

  },
  {
    timestamps: true,
  }
);

FormResponseSchema.pre("save", function () {
  // Obtém as perguntas que devem ser respondidas no contexto atual
  const questionsToBeAnsweredSlugs = Array.from(
    new Set(
      getQuestionsFromContext(
        this.donationIntent ?? null,
        this.mode === "anonymous"
      )
        .map((q) => q.slug)
        .concat(["age"]) // age is always required in the formResponse
    )
  );

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
