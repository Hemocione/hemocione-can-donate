import { InferSchemaType } from "mongoose";
import { FormResponse, FormResponseSchema, IntegrationSlug } from "../models/formResponse";
import { HemocioneUserAuthTokenData } from "./auth";
import { getMe } from "./hemocioneId";
import { calculateAge } from "~/utils/calculateAge";
import { autoFilledAgeAnswer } from "~/utils/donorAge";
import type { Answer } from "~/server/api/v1/formResponse/[formId]/answers/[answerSlug]/index.put";
import type { IntegrationPayload } from "~/utils/integrations";

// Função para criar uma resposta de formulário e salvar no banco de dados
export async function createFormResponse(
  user: HemocioneUserAuthTokenData | null,
  token?: string,
  integrationDoc?: Record<string, unknown> | null,
  intent?: "today" | "soon" | null,
) {
  const mode = user ? "logged-in" : "anonymous";

  // Guarda nome COMPLETO: o comprovante publico de pre-triagem mostra
  // "Primeiro I." e, com apenas o givenName, nunca teria o sobrenome para
  // abreviar — sairia so o primeiro nome, fraco como prova de identidade.
  const userData = user
    ? {
        id: user.id,
        name: [user.givenName, user.surName].filter(Boolean).join(" "),
        email: user.email,
      }
    : {};

  try {
    const initialAnswers = token ? await getInitialAnswerMap(token) : null;
    const extraFormInitialData = initialAnswers
      ? { answers: initialAnswers, ageAutoFilled: initialAnswers.has("age") }
      : {};

    const formResponse = new FormResponse({
      mode,
      user: userData,
      integration: integrationDoc,
      donationIntent: intent,      
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
  const value = autoFilledAgeAnswer(calculateAge(new Date(birthDate)));

  // Sem resposta deduzida (mais de 60 anos), a pergunta de idade aparece para
  // a pessoa responder.
  if (!value) return new Map();

  return new Map([["age", { value, answeredAt: new Date() }]]);
}
