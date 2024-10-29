import { InferSchemaType } from "mongoose";
import { FormResponse, FormResponseSchema } from "../models/formResponse";
import { HemocioneUserAuthTokenData } from "./auth";

// Função para criar uma resposta de formulário e salvar no banco de dados
export async function createFormResponse(
  user: HemocioneUserAuthTokenData | null
) {
  // Se o usuário estiver logado, preenchemos os campos `user` automaticamente
  const mode = user ? "logged-in" : "anonymous";

  const userData = user
    ? { id: user.id, name: user.givenName, email: user.email }
    : {};

  // Criar uma nova instância de FormResponse com os dados do formulário
  const formResponse = new FormResponse({
    mode,
    user: userData,
  });

  // Salvar a resposta no banco de dados
  await formResponse.save();

  // Retornar o objeto salvo como um JSON
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
