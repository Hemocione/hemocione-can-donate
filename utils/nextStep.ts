import type { DonationIntent } from "~/server/models/formResponse";
import {
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

  const pending = getQuestionsFromContext(form.donationIntent, form.answers, form.autoFilledAnswers);
  const answered = pending.filter((q) => form.answers[q.slug]?.value).length;
  const next = pending.find((q) => !form.answers[q.slug]?.value);
  if (!next) {
    return { kind: "finished", status: "able-to-donate", failedQuestions: [], publicToken: form.publicToken ?? null };
  }
  return {
    kind: "question",
    question: { slug: next.slug, question: next.question, description: next.description, image: next.image },
    progress: { answered, total: pending.length },
  };
}
