//quando doar
import { defineEventHandler } from "h3";
import z from "zod";
import { FormResponse } from "~/server/models/formResponse";
import { readBody, createError } from "h3";

const intentionSchema = z.object({
  donationIntent: z.enum(["today", "this-week", "future"]),
});

export default defineEventHandler(async (event) => {
  const formId = event.context.params?.formId;

  const body = await readBody(event);
  const parsed = intentionSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid donation intent",
      data: parsed.error.errors,
    });
  }

  const formResponse = await FormResponse.findById(formId);
  if (!formResponse) {
    throw createError({
      statusCode: 404,
      statusMessage: "FormResponse not found",
    });
  }

  // Atualiza o campo donationIntent com o valor validado
  formResponse.donationIntent = parsed.data.donationIntent;
  await formResponse.save();

  return { success: true, updatedIntent: formResponse.donationIntent };
});
