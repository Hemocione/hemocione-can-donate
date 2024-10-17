import { useHemocioneUserAuth } from "~/server/services/auth";
import { createFormResponse } from "~/server/services/formResponse";

export default defineEventHandler(async (event) => {
  // Verifica se o usuário está logado
  const user = useHemocioneUserAuth(event);

  // Extrai os dados do formulário do corpo da requisição
  const body = await readBody(event);

  const {
    ip,
    geolocation,
    browser,
    idUser,
    nameUser,
    donationIntent,
    responses,
    startTime,
    endTime,
    status,
  } = body;

  // Se o usuário estiver logado, use o nome e a idade automaticamente
  const formData = {
    ip,
    geolocation,
    browser,
    idUser: user ? user.id : idUser, // Pega o id do usuário logado ou o id fornecido
    nameUser: user ? user.name : nameUser, // Pega o nome do usuário logado ou o nome fornecido
    donationIntent,
    responses,
    startTime,
    endTime,
    status,
  };

  // Cria a resposta do formulário
  const formResponse = await createFormResponse(user, formData);

  // Retorna a resposta criada
  return formResponse;
});
