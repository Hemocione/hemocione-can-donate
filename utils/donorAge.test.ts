import { describe, expect, it } from "vitest";
import { autoFilledAgeAnswer } from "./donorAge";

describe("autoFilledAgeAnswer", () => {
  it("reprova menor de 16 anos", () => {
    expect(autoFilledAgeAnswer(15)).toBe("negative");
  });

  it("aprova de 16 a 60 anos", () => {
    expect(autoFilledAgeAnswer(16)).toBe("positive");
    expect(autoFilledAgeAnswer(60)).toBe("positive");
  });

  it("nao preenche acima de 60 anos: depende de doacao anterior", () => {
    expect(autoFilledAgeAnswer(61)).toBeNull();
    expect(autoFilledAgeAnswer(69)).toBeNull();
    expect(autoFilledAgeAnswer(75)).toBeNull();
  });
});
