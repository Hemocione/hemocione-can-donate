import { getNextStep } from "~/utils/nextStep";
import { loadAccessibleForm } from "~/server/utils/loadAccessibleForm";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "formId") ?? "";
  const doc = await loadAccessibleForm(event, formId);
  const form = doc.toObject();
  return getNextStep({
    donationIntent: form.donationIntent ?? null,
    answers: Object.fromEntries(form.answers ?? new Map()) as any,
    autoFilledAnswers: form.autoFilledAnswers ?? [],
    status: form.status,
    failedQuestions: form.failedQuestions ?? [],
    publicToken: form.publicToken ?? null,
  });
});
