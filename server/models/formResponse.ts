import { InferSchemaType, Schema, model } from "mongoose";
import { evaluateAnswers } from "~/utils/questions";

/**
 * 16 bytes em hex (32 chars).
 *
 * Usa a Web Crypto API global, disponivel tanto no Node 18+ quanto no browser,
 * em vez de importar `randomBytes` de `node:crypto`. Este arquivo e importado
 * pelo client — `utils/integrations.ts` consome `integrationSlugs` daqui —,
 * entao um import Node-only faz o Vite resolver para
 * `__vite-browser-external` e o build de producao quebra.
 */
const generatePublicToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

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
        // Slug da copa relacionada ao evento. SEM esta linha o Mongoose
        // descarta o campo em strict mode, e o botao "Registrar participacao"
        // nunca aparece para quem e reprovado na pre-triagem vindo de evento.
        competitionSlug: { type: String, required: false },
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
        // Slug da copa relacionada ao evento. SEM esta linha o Mongoose
        // descarta o campo em strict mode, e o botao "Registrar participacao"
        // nunca aparece para quem e reprovado na pre-triagem vindo de evento.
        competitionSlug: { type: String, required: false },
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
    // Slugs das respostas que o servidor preencheu pelo cadastro do Hemocione
    // ID na criacao. O front nao mostra essas perguntas.
    autoFilledAnswers: {
      type: [String],
      default: [],
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
      default: generatePublicToken,
    },

  },
  {
    timestamps: true,
  }
);

FormResponseSchema.pre("save", function () {
  const answers = this.answers ?? new Map();
  const evaluation = evaluateAnswers(
    Object.fromEntries(answers),
    this.donationIntent ?? null
  );

  if (!evaluation.finished) {
    // Uma resposta alterada pode abrir uma pergunta condicional nova (ex.:
    // idade "Nao" abre `priorDonation`); o formulario volta a ficar em aberto.
    this.finishedAt = undefined;
    this.status = "ongoing";
    this.failedQuestions = [];
    return;
  }

  this.finishedAt = new Date();
  // Remove as respostas que não são relevantes para o contexto atual
  this.answers = new Map(
    evaluation.relevantSlugs
      .filter((slug) => answers.has(slug))
      .map((slug) => [slug, answers.get(slug)!])
  );
  this.status = evaluation.failedQuestions.length
    ? "unable-to-donate"
    : "able-to-donate";
  this.failedQuestions = evaluation.failedQuestions;
});

export type FormResponseSchema = InferSchemaType<typeof FormResponseSchema>;

export const FormResponse = model<FormResponseSchema>(
  "FormResponse",
  FormResponseSchema
);
export { FormResponseSchema };
