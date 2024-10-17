import { FormResponse } from "../models/formResponse";
import { HemocioneUserAuthTokenData } from "./auth";

// Função para criar uma resposta de formulário e salvar no banco de dados
export async function createFormResponse(
  user: HemocioneUserAuthTokenData | null,
  formData: {
    ip: string;
    geolocation?: { latitude: number; longitude: number };
    browser: string;
    idUser?: string;
    nameUser?: string;
    donationIntent: "today" | "this week" | "future";
    responses: {
      weight: {
        value: "positive" | "negative" | "unknown";
        horaResposta: Date;
      };
      age: { value: "positive" | "negative" | "unknown"; horaResposta: Date };
    };
    startTime: Date;
    endTime: Date;
    status: "completed" | "incomplete" | "error";
  }
) {
  // Se o usuário estiver logado, preenchemos os campos `idUser` e `nameUser` automaticamente
  const clientData = {
    ip: formData.ip,
    geolocation: formData.geolocation,
    browser: formData.browser,
    idUser: user ? user.id : formData.idUser, // Se o usuário está logado, usa o ID do token
    nameUser: user ? user.givenName : formData.nameUser, // Se o usuário está logado, usa o nome do token
  };

  // Criar uma nova instância de FormResponse com os dados do formulário
  const formResponse = new FormResponse({
    client: clientData,
    donationIntent: formData.donationIntent,
    responses: {
      weight: {
        value: formData.responses.weight,
      },
      age: {
        value: formData.responses.age,
      },
    },
    startTime: formData.startTime,
    endTime: formData.endTime,
    status: formData.status,
  });

  // Salvar a resposta no banco de dados
  await formResponse.save();

  // Retornar o objeto salvo como um JSON
  return formResponse.toObject();
}
