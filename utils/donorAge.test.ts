import { describe, expect, it } from "vitest";
import { autoFilledAgeAnswers, hasDonationRecord } from "./donorAge";

describe("autoFilledAgeAnswers", () => {
  it("reprova menor de 16 anos sem perguntar nada", () => {
    expect(autoFilledAgeAnswers(15, true)).toEqual({
      age: "negative",
      priorDonation: "negative",
    });
  });

  it("aprova a idade de 16 a 60 anos", () => {
    expect(autoFilledAgeAnswers(16, false)).toEqual({ age: "positive" });
    expect(autoFilledAgeAnswers(60, false)).toEqual({ age: "positive" });
  });

  it("acima de 60 com doacao registrada: aprova sem perguntar", () => {
    expect(autoFilledAgeAnswers(61, true)).toEqual({
      age: "negative",
      priorDonation: "positive",
    });
    expect(autoFilledAgeAnswers(75, true)).toEqual({
      age: "negative",
      priorDonation: "positive",
    });
  });

  it("acima de 60 sem doacao registrada: deixa priorDonation para a pessoa", () => {
    expect(autoFilledAgeAnswers(61, false)).toEqual({ age: "negative" });
  });
});

describe("hasDonationRecord", () => {
  it("conta doacao confirmada ou pendente", () => {
    expect(hasDonationRecord([{ reviewStatus: "confirmed" }])).toBe(true);
    expect(hasDonationRecord([{ reviewStatus: "pending" }])).toBe(true);
  });

  it("ignora doacao rejeitada e lista vazia", () => {
    expect(hasDonationRecord([{ reviewStatus: "rejected" }])).toBe(false);
    expect(hasDonationRecord([])).toBe(false);
    expect(hasDonationRecord(undefined)).toBe(false);
  });
});
