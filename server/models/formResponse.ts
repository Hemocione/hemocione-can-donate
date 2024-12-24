import { InferSchemaType, Schema, Types, model } from "mongoose";

export const formModes = ["anonymous", "logged-in"] as const;

export const donationIntents = ["today", "this-week", "future"] as const;

export type DonationIntent = typeof donationIntents[number];

export const formStatuses = [
  "able-to-donate",
  "unable-to-donate",
  "unknown",
  "ongoing",
] as const;

export const answerValues = ["positive", "negative", "unknown"] as const;

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
      weight: AnswerSchema,
      age: AnswerSchema,
      ateToday: AnswerSchema,
      sleptOk: AnswerSchema,
      drankYesterday: AnswerSchema,
      medicine: AnswerSchema,
      sexRisk: AnswerSchema,
      tattooOrPiercing: AnswerSchema,
      mouthPiercing: AnswerSchema,
      medicalTreatmentOrSurgery: AnswerSchema,
      seriousDisease: AnswerSchema,
      traveled: AnswerSchema,
      vaccine: AnswerSchema,
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
  },
  {
    timestamps: true,
  }
);

export type FormResponseSchema = InferSchemaType<typeof FormResponseSchema>;

export const FormResponse = model<FormResponseSchema>(
  "FormResponse",
  FormResponseSchema
);
export { FormResponseSchema };
