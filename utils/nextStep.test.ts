import { describe, expect, it } from "vitest";
import { getNextStep } from "./nextStep";
import questions, { type Answers } from "./questions";

const toAnswers = (values: Record<string, string>): Answers =>
  Object.fromEntries(
    Object.entries(values).map(([slug, value]) => [slug, { value: value as any }])
  );

describe("getNextStep", () => {
  it("sem intencao: needs-intent", () => {
    expect(
      getNextStep({ donationIntent: null, answers: {}, autoFilledAnswers: [], status: "ongoing", failedQuestions: [] })
    ).toEqual({ kind: "needs-intent" });
  });
  it("primeira pergunta pulando as preenchidas pelo cadastro", () => {
    const step = getNextStep({ donationIntent: "soon", answers: toAnswers({ age: "positive" }), autoFilledAnswers: ["age"], status: "ongoing", failedQuestions: [] });
    expect(step).toMatchObject({ kind: "question", question: { slug: "weight" }, progress: { answered: 0, total: 6 } });
  });
  it("idade Nao abre priorDonation logo depois", () => {
    const step = getNextStep({ donationIntent: "soon", answers: toAnswers({ weight: "positive", age: "negative" }), autoFilledAnswers: [], status: "ongoing", failedQuestions: [] });
    expect(step).toMatchObject({ kind: "question", question: { slug: "priorDonation" } });
  });
  it("terminado inapto traz motivo e prazo copiado do texto", () => {
    const step = getNextStep({ donationIntent: "soon", answers: toAnswers({}), autoFilledAnswers: [], status: "unable-to-donate", failedQuestions: ["traveledAbroad", "weight"], publicToken: "abc" });
    expect(step).toMatchObject({ kind: "finished", status: "unable-to-donate", publicToken: "abc" });
    if (step.kind !== "finished") throw new Error();
    expect(step.failedQuestions.map((q) => q.slug)).toEqual(["traveledAbroad", "weight"]);
    expect(step.failedQuestions.find((q) => q.slug === "traveledAbroad")?.waitingPeriod).toEqual({ value: 30, unit: "days", startsFrom: "a saída da área com risco de malária" });
    expect(step.failedQuestions.find((q) => q.slug === "weight")?.waitingPeriod).toBeNull();
  });
  it("DTOs nao vazam showIf nem failingResponses", () => {
    const step = getNextStep({ donationIntent: "soon", answers: {}, autoFilledAnswers: [], status: "ongoing", failedQuestions: [] });
    if (step.kind !== "question") throw new Error();
    expect(Object.keys(step.question).sort()).toEqual(["description", "image", "question", "slug"]);
  });
  it("ongoing sem pendentes mas com autopreenchida sem resposta: pergunta, nunca apto", () => {
    const step = getNextStep({ donationIntent: "soon", answers: toAnswers({ weight: "positive", sexRisk: "negative", tattooOrPiercing: "negative", traveledAbroad: "negative", mouthPiercing: "negative", medicalTreatmentOrSurgery: "negative" }), autoFilledAnswers: ["age"], status: "ongoing", failedQuestions: [] });
    expect(step).toMatchObject({ kind: "question", question: { slug: "age" } });
  });
  it("ongoing com tudo respondido: pending-evaluation", () => {
    const step = getNextStep({ donationIntent: "soon", answers: toAnswers({ age: "positive", weight: "positive", sexRisk: "negative", tattooOrPiercing: "negative", traveledAbroad: "negative", mouthPiercing: "negative", medicalTreatmentOrSurgery: "negative" }), autoFilledAnswers: [], status: "ongoing", failedQuestions: [] });
    expect(step).toEqual({ kind: "pending-evaluation" });
  });
  it("apenas 3 perguntas tem prazo", () => {
    expect(questions.filter((q) => q.waitingPeriod).map((q) => q.slug).sort()).toEqual(["mouthPiercing", "tattooOrPiercing", "traveledAbroad"]);
  });
});
