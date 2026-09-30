import type { AnswerValue } from "~/server/models/formResponse";

// Portaria GM/MS nº 11.685/2026: idade minima de 16 anos, primeira doacao ate
// 60 anos, 11 meses e 29 dias (60 anos completos) e sem idade maxima para quem
// ja doou antes.
export const MIN_DONOR_AGE = 16;
export const MAX_FIRST_DONATION_AGE = 60;

/**
 * Resposta da pergunta de idade deduzida so pela idade do cadastro.
 *
 * Devolve `null` acima de 60 anos: nesse caso a resposta depende de a pessoa
 * ja ter doado antes, e o cadastro nao sabe disso (doacoes fora do Hemocione
 * nao ficam registradas). A propria pessoa responde a pergunta.
 */
export function autoFilledAgeAnswer(age: number): AnswerValue | null {
  if (age < MIN_DONOR_AGE) return "negative";
  if (age <= MAX_FIRST_DONATION_AGE) return "positive";
  return null;
}
