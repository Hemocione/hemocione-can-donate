import { describe, expect, it } from "vitest";
import {
  getFailingQuestionsForContext,
  getQuestionsFromContext,
} from "./questions";

const slugs = (...args: Parameters<typeof getQuestionsFromContext>) =>
  getQuestionsFromContext(...args).map((q) => q.slug);

describe("getQuestionsFromContext: pergunta de idade", () => {
  it("aparece no modo anonimo", () => {
    expect(slugs("today", true)).toContain("age");
  });

  it("some no modo logado quando o cadastro preencheu a idade", () => {
    expect(slugs("today", false, true)).not.toContain("age");
    expect(slugs("today", false)).not.toContain("age");
  });

  it("aparece no modo logado quando o cadastro nao preencheu (mais de 60 anos)", () => {
    expect(slugs("today", false, false)).toContain("age");
  });
});

describe("getFailingQuestionsForContext", () => {
  it("reprova quem responde nao na pergunta de idade", () => {
    const failing = getFailingQuestionsForContext(
      { age: { value: "negative" } },
      "soon",
      false
    ).map((q) => q.slug);
    expect(failing).toEqual(["age"]);
  });

  it("aprova quem responde sim na pergunta de idade", () => {
    expect(
      getFailingQuestionsForContext({ age: { value: "positive" } }, "soon", true)
    ).toEqual([]);
  });
});
