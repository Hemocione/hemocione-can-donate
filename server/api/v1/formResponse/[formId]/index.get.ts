//pegar o tempo de termino e o forms completo
import { defineEventHandler } from "h3";
import { FormResponse } from "~/server/models/formResponse";

export default defineEventHandler(async (event) => {
  const formId = event.context.params?.formId;

  const formResponse = await FormResponse.findById(formId);
  if (!formResponse) {
    throw createError({
      statusCode: 404,
      statusMessage: "FormResponse not found",
    });
  }

  return { success: true, formResponse };
});
