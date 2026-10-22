import type { DonationIntent } from "~/server/models/formResponse";
import {
  getApplicableQuestions,
  getFilteredQuestions,
  getQuestionsFromContext,
  type Answers,
  type WaitingPeriod,
} from "./questions";

export type QuestionDTO = {
  slug: string;
  question: string;
  description: string;
  image: string;
};
export type FailedQuestionDTO = {
  slug: string;
  question: string;
  failingReason: string;
  waitingPeriod: WaitingPeriod | null;
};
export type NextStep =
  | { kind: "needs-intent" }
  | { kind: "pending-evaluation" }
  | { kind: "question"; question: QuestionDTO; progress: { answered: number; total: number } }
  | {
      kind: "finished";
      status: "able-to-donate" | "unable-to-donate";
      failedQuestions: FailedQuestionDTO[];
      publicToken: string | null;
    };

export function getNextStep(form: {
  donationIntent: DonationIntent | null;
  answers: Answers;
  autoFilledAnswers: string[];
  status: string;
  failedQuestions: string[];
  publicToken?: string | null;
}): NextStep {
  if (!form.donationIntent) return { kind: "needs-intent" };

  if (form.status !== "ongoing") {
    const found = getFilteredQuestions(form.failedQuestions);
    const failedQuestions = form.failedQuestions.flatMap((slug) => {
      const q = found.find((item) => item.slug === slug);
      return q
        ? [{ slug: q.slug, question: q.question, failingReason: q.failingReason, waitingPeriod: q.waitingPeriod ?? null }]
        : [];
    });
    return {
      kind: "finished",
      status: form.status === "able-to-donate" ? "able-to-donate" : "unable-to-donate",
      failedQuestions,
      publicToken: form.publicToken ?? null,
    };
  }

  const toStep = (list: ReturnType<typeof getApplicableQuestions>): NextStep | null => {
    const next = list.find((q) => !form.answers[q.slug]);
    if (!next) return null;
    return {
      kind: "question",
      question: { slug: next.slug, question: next.question, description: next.description, image: next.image },
      progress: {
        answered: list.filter((q) => Boolean(form.answers[q.slug])).length,
        total: list.length,
      },
    };
  };

  const pending = getQuestionsFromContext(form.donationIntent, form.answers, form.autoFilledAnswers);
  // Estado inconsistente (ongoing sem pendentes): nunca declara apto, cai nas aplicaveis.
  const applicable = getApplicableQuestions(form.donationIntent, form.answers);
  return toStep(pending) ?? toStep(applicable) ?? { kind: "pending-evaluation" };
}
