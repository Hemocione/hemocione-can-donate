import type { AnswerValue } from "~/server/models/formResponse";

// Portaria GM/MS nº 11.685/2026: idade minima de 16 anos, primeira doacao ate
// 60 anos, 11 meses e 29 dias (60 anos completos) e sem idade maxima para quem
// ja doou antes.
export const MIN_DONOR_AGE = 16;
export const MAX_FIRST_DONATION_AGE = 60;

/**
 * Respostas de `age` e `priorDonation` deduzidas do cadastro no Hemocione ID.
 *
 * Acima de 60 anos sem doacao registrada, `priorDonation` fica sem resposta: a
 * pessoa pode ter doado fora do Hemocione, entao ela mesma responde.
 */
export function autoFilledAgeAnswers(
  age: number,
  hasDonationRecord: boolean
): Record<string, AnswerValue> {
  if (age < MIN_DONOR_AGE) return { age: "negative", priorDonation: "negative" };
  if (age <= MAX_FIRST_DONATION_AGE) return { age: "positive" };
  if (hasDonationRecord) return { age: "negative", priorDonation: "positive" };
  return { age: "negative" };
}

// Doacao rejeitada na revisao nao conta como doacao anterior.
const COUNTED_REVIEW_STATUSES = ["confirmed", "pending"];

export function hasDonationRecord(
  donations: { reviewStatus?: string | null }[] | undefined
): boolean {
  return (donations ?? []).some((donation) =>
    COUNTED_REVIEW_STATUSES.includes(donation.reviewStatus ?? "")
  );
}
