import { assertSecretAuth, useHemocioneUserAuth } from "~/server/services/auth";
import { createFormResponse } from "~/server/services/formResponse";

export default defineEventHandler(async (event) => {
  // Verificando se o usuário esta logado
  let user: ReturnType<typeof useHemocioneUserAuth> | undefined = undefined;
  try {
    user = useHemocioneUserAuth(event);
  } catch (e) {
    // Do nothing
  }

  const formResponse = await createFormResponse(user ? user : null);

  return formResponse;
});
