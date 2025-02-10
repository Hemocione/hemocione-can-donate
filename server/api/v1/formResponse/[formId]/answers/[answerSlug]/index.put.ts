//atualiza a cada resposta por aqui
// Atualiza cada resposta individualmente
import { defineEventHandler, readBody, createError } from "h3";
import z from "zod";
import { FormResponse } from "~/server/models/formResponse";

// Define o esquema de validação com zod
const answerSchema = z.object({
  value: z.enum(["positive", "negative", "unknown"]),
  answeredAt: z.string().transform((date) => new Date(date)),
});

export default defineEventHandler(async (event) => {
  const { formId, answerSlug } = event.context.params as {
    formId: string;
    answerSlug: string;
  };

  // Lê o corpo da requisição diretamente e valida com o zod
  const body = await readBody(event);
  const parsed = answerSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid answer data",
      data: parsed.error.errors,
    });
  }

  const formResponse = await FormResponse.findById(formId);
  if (!formResponse) {
    throw createError({
      statusCode: 404,
      statusMessage: "FormResponse not found",
    });
  }

  // Inicializa `answers` se estiver undefined e atualiza a resposta
  if (!formResponse.answers) {
    formResponse.answers = new Map(); // Inicializa como um objeto vazio
  }

  formResponse.answers.set(answerSlug, parsed.data);
  await formResponse.save();

  return {
    success: true,
    updatedAnswer: formResponse.answers.get(answerSlug),
  };
});
