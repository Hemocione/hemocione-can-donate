import { InferSchemaType } from "mongoose";
import { FormResponse, FormResponseSchema } from "../models/formResponse";
import { HemocioneUserAuthTokenData } from "./auth";

// Função para criar uma resposta de formulário e salvar no banco de dados
export async function createFormResponse(
  user: HemocioneUserAuthTokenData | null
) {
  const mode = user ? "logged-in" : "anonymous";

  const userData = user
    ? { id: user.id, name: user.givenName, email: user.email }
    : {};

  const formResponse = new FormResponse({
    mode,
    user: userData,
  });

  await formResponse.save();

  console.log("✅ Form response saved:", formResponse.toObject());

  return formResponse.toObject();
}

type FormResponseType = InferSchemaType<typeof FormResponseSchema>;

export async function updateFormResponse(
  formId: string,
  updates: Partial<FormResponseType>
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
