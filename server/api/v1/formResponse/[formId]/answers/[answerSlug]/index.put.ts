//atualiza a cada resposta por aqui
// Atualiza cada resposta individualmente
import { defineEventHandler, readBody, createError } from "h3";
import z from "zod";
import { isQuestionSlug } from "~/utils/questions";

// Define o esquema de validação com zod
const answerSchema = z.object({
  value: z.enum(["positive", "negative", "unknown"]),
  answeredAt: z.string().transform((date) => new Date(date)),
});

export type Answer = z.infer<typeof answerSchema>;

export default defineEventHandler(async (event) => {
  const { formId, answerSlug } = event.context.params as {
    formId: string;
    answerSlug: string;
  };

  if (!isQuestionSlug(answerSlug)) {
    throw createError({
      statusCode: 422,
      statusMessage: "Unknown question slug",
    });
  }

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

  const formResponse = await loadAccessibleForm(event, formId);

  // O veredito depende da intencao: sem ela nenhuma resposta e aceita.
  if (!formResponse.donationIntent) {
    throw createError({
      statusCode: 409,
      statusMessage: "Donation intent required",
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
    status: formResponse.status,
    failedQuestions: formResponse.failedQuestions,
  };
});
