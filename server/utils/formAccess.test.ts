import { describe, expect, it } from "vitest";
import { canAccessForm } from "./formAccess";
import { isQuestionSlug } from "../../utils/questions";

describe("canAccessForm", () => {
  it("formulario anonimo: qualquer um acessa", () => {
    expect(canAccessForm(undefined, null)).toBe(true);
    expect(canAccessForm(null, "user-b")).toBe(true);
    expect(canAccessForm("", "user-b")).toBe(true);
  });
  it("formulario com dono: so o dono acessa", () => {
    expect(canAccessForm("user-a", "user-a")).toBe(true);
    expect(canAccessForm("user-a", "user-b")).toBe(false);
    expect(canAccessForm("user-a", null)).toBe(false);
  });
});

describe("isQuestionSlug", () => {
  it("aceita slug conhecido e recusa desconhecido ou com caixa diferente", () => {
    expect(isQuestionSlug("weight")).toBe(true);
    expect(isQuestionSlug("priorDonation")).toBe(true);
    expect(isQuestionSlug("Weight")).toBe(false);
    expect(isQuestionSlug("__proto__")).toBe(false);
  });
});
