import { describe, expect, it } from "vitest";
import {
  autoFilledAgeAnswers,
} from "./donorAge";
import {
  evaluateAnswers,
  getQuestionsFromContext,
  type Answers,
} from "./questions";

const toAnswers = (values: Record<string, string>): Answers =>
  Object.fromEntries(
    Object.entries(values).map(([slug, value]) => [slug, { value: value as any }])
  );

const slugs = (...args: Parameters<typeof getQuestionsFromContext>) =>
  getQuestionsFromContext(...args).map((q) => q.slug);

// Respostas aptas para todas as perguntas de "soon", menos idade.
const passingSoon = {
  weight: "positive",
  sexRisk: "negative",
  tattooOrPiercing: "negative",
  traveledAbroad: "negative",
  mouthPiercing: "negative",
  medicalTreatmentOrSurgery: "negative",
};

describe("pergunta condicional priorDonation", () => {
  it("nao aparece antes da resposta de idade nem com idade Sim", () => {
    expect(slugs("soon")).not.toContain("priorDonation");
    expect(slugs("soon", toAnswers({ age: "positive" }))).not.toContain(
      "priorDonation"
    );
  });

  it("aparece logo depois da idade quando a idade e Nao", () => {
    const list = slugs("soon", toAnswers({ age: "negative" }));
    expect(list[list.indexOf("age") + 1]).toBe("priorDonation");
  });

  it("some da tela quando o servidor preencheu", () => {
    expect(
      slugs("soon", toAnswers({ age: "negative" }), ["age", "priorDonation"])
    ).not.toContain("priorDonation");
    expect(slugs("soon", toAnswers({ age: "negative" }), ["age"])).toContain(
      "priorDonation"
    );
  });
});

describe("evaluateAnswers", () => {
  it("16 a 60 anos: apto", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "positive" }),
      "soon"
    );
    expect(result).toMatchObject({ finished: true, failedQuestions: [] });
  });

  it("idade Nao sem priorDonation: formulario em aberto", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "negative" }),
      "soon"
    );
    expect(result.finished).toBe(false);
  });

  it("mais de 60 e ja doou: apto", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "negative", priorDonation: "positive" }),
      "soon"
    );
    expect(result).toMatchObject({ finished: true, failedQuestions: [] });
  });

  it("menos de 16 ou nunca doou: inapto por priorDonation", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "negative", priorDonation: "negative" }),
      "soon"
    );
    expect(result).toMatchObject({
      finished: true,
      failedQuestions: ["priorDonation"],
    });
  });

  it("idade Nao sei: inapto por age", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "unknown" }),
      "soon"
    );
    expect(result.failedQuestions).toEqual(["age"]);
  });

  it("descarta priorDonation quando a idade volta para Sim", () => {
    const result = evaluateAnswers(
      toAnswers({ ...passingSoon, age: "positive", priorDonation: "negative" }),
      "soon"
    );
    expect(result.relevantSlugs).not.toContain("priorDonation");
    expect(result.failedQuestions).toEqual([]);
  });

  it("logado com menos de 16: inapto sem ver as perguntas de idade", () => {
    const auto = toAnswers(autoFilledAgeAnswers(15, false));
    expect(slugs("soon", auto, Object.keys(auto))).not.toContain("age");
    expect(slugs("soon", auto, Object.keys(auto))).not.toContain("priorDonation");
    const result = evaluateAnswers({ ...toAnswers(passingSoon), ...auto }, "soon");
    expect(result.failedQuestions).toEqual(["priorDonation"]);
  });

  it("logado com 70 anos e doacao registrada: apto sem ver as perguntas de idade", () => {
    const auto = toAnswers(autoFilledAgeAnswers(70, true));
    expect(slugs("soon", auto, Object.keys(auto))).not.toContain("priorDonation");
    const result = evaluateAnswers({ ...toAnswers(passingSoon), ...auto }, "soon");
    expect(result).toMatchObject({ finished: true, failedQuestions: [] });
  });
});
