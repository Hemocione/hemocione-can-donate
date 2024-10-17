import { InferSchemaType, Schema, Types, model } from "mongoose";

const ResponsesSchema = new Schema({
  value: {
    type: String,
    enum: ["positive", "negative", "unknown"],
    required: true,
  },
  horaResposta: {
    type: Date,
    required: true,
  },
});

const FormResponseSchema = new Schema({
  client: {
    ip: {
      type: String,
      required: true,
    },
    geolocation: {
      type: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      required: false,
    },
    browser: {
      type: String,
      required: true,
    },
    idUser: {
      type: String,
      required: false,
    },
    nameUser: {
      type: String,
      required: false,
    },
  },
  donationIntent: {
    type: String,
    enum: ["today", "this week", "future"],
    required: true,
  },
  responses: {
    weight: {
      value: {
        type: ResponsesSchema,
        required: true,
      },
    },
    age: {
      value: {
        type: ResponsesSchema,
        required: true,
      },
    },
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "incomplete", "error"],
    required: true,
  },
});

export type FormResponseSchema = InferSchemaType<typeof FormResponseSchema>;

export const FormResponse = model<FormResponseSchema>(
  "FormResponse",
  FormResponseSchema
);
