//pegar o tempo de termino e o forms completo
import { defineEventHandler } from "h3";
import { FRONTEND_FIELDS } from "~/server/utils/formResponseFields";

export default defineEventHandler(async (event) => {
  const formId = event.context.params?.formId;

  const formResponse = await loadAccessibleForm(
    event,
    formId as string,
    FRONTEND_FIELDS
  );

  return { success: true, formResponse };
});
