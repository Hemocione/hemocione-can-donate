import { InferSchemaType } from "mongoose";
import { FormResponse, FormResponseSchema } from "../models/formResponse";
import { HemocioneUserAuthTokenData } from "./auth";
import { getMe } from "./hemocioneId";
import { calculateAge } from "~/utils/calculateAge";
import type { Answer } from "~/server/api/v1/formResponse/[formId]/answers/[answerSlug]/index.put";

// Função para criar uma resposta de formulário e salvar no banco de dados
export async function createFormResponse(
  user: HemocioneUserAuthTokenData | null,
  token?: string,
  integration?: { slug: string; params?: Record<string, unknown> } | null
) {
  const mode = user ? "logged-in" : "anonymous";

  const userData = user
    ? { id: user.id, name: user.givenName, email: user.email }
    : {};

  try {
    const extraFormInitialData = token
      ? { answers: await getInitialAnswerMap(token) }
      : {};

    const formResponse = new FormResponse({
      mode,
      user: userData,
      integration,
      ...extraFormInitialData,
    });

    await formResponse.save();

    console.log("✅ Form response saved:", formResponse.toObject());

    return formResponse.toObject();
  } catch (error) {
    console.error("❌ Error saving form response:", error);
    throw error;
  }
}

type FormResponse = InferSchemaType<typeof FormResponseSchema>;

export async function updateFormResponse(
  formId: string,
  updates: Partial<FormResponse>
) {
  const formResponse = await FormResponse.findById(formId);
  if (!formResponse) {
    throw createError({
      statusCode: 404,
      statusMessage: "FormResponse not found",
    });
  }

  Object.assign(formResponse, updates); // Atualiza apenas os campos que estão em `updates`
  await formResponse.save();

  return formResponse;
}

export async function getInitialAnswerMap(
  token: string
): Promise<Map<string, Answer>> {
  const { birthDate } = await getMe(token);
  const age = calculateAge(new Date(birthDate));

  const response: Answer = {
    value: "positive",
    answeredAt: new Date(),
  };

  if (age < 16 || age > 69) {
    response.value = "negative";
  }

  return new Map([["age", response]]);
}
