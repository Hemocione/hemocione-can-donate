import { describe, expect, it } from "vitest";
import { buildPublicComprovante, formatDisplayName } from "./publicComprovante";

describe("formatDisplayName", () => {
  it("reduz nome completo a primeiro nome + inicial do sobrenome", () => {
    expect(formatDisplayName("Thiago Guimaraes Alcantara")).toBe("Thiago A.");
  });

  it("usa o sobrenome quando ha exatamente dois nomes", () => {
    expect(formatDisplayName("Thiago Guimaraes")).toBe("Thiago G.");
  });

  it("mantem apenas o primeiro nome quando nao ha sobrenome", () => {
    expect(formatDisplayName("Thiago")).toBe("Thiago");
  });

  it("ignora espacos extras", () => {
    expect(formatDisplayName("  Thiago   Guimaraes  ")).toBe("Thiago G.");
  });

  it("devolve fallback quando o nome esta ausente", () => {
    expect(formatDisplayName(null)).toBe("Doador(a)");
    expect(formatDisplayName("")).toBe("Doador(a)");
    expect(formatDisplayName(undefined)).toBe("Doador(a)");
  });
});

describe("buildPublicComprovante", () => {
  const finishedAt = new Date("2026-07-30T13:42:10.000Z");

  const validDoc = {
    user: { name: "Thiago Guimaraes", email: "thiago@example.com", id: "abc" },
    finishedAt,
    status: "unable-to-donate",
    client: { ip: "1.2.3.4", geolocation: { latitude: -23, longitude: -46 } },
    answers: new Map([["age", { value: "positive" }]]),
    failedQuestions: ["tattoo"],
    publicToken: "deadbeefdeadbeefdeadbeefdeadbeef",
  };

  it("projeta apenas displayName, finishedAt e status", () => {
    expect(buildPublicComprovante(validDoc)).toEqual({
      displayName: "Thiago G.",
      finishedAt,
      status: "unable-to-donate",
    });
  });

  it("nao vaza nenhum campo sensivel", () => {
    const result = buildPublicComprovante(validDoc)!;
    const serialized = JSON.stringify(result);

    expect(Object.keys(result).sort()).toEqual([
      "displayName",
      "finishedAt",
      "status",
    ]);
    expect(serialized).not.toContain("thiago@example.com");
    expect(serialized).not.toContain("1.2.3.4");
    expect(serialized).not.toContain("tattoo");
    expect(serialized).not.toContain("age");
    expect(serialized).not.toContain("Guimaraes");
    expect(serialized).not.toContain("deadbeef");
  });

  it("devolve null quando o formulario nao foi finalizado", () => {
    expect(buildPublicComprovante({ ...validDoc, finishedAt: null })).toBeNull();
    expect(buildPublicComprovante({ ...validDoc, status: "ongoing" })).toBeNull();
  });

  it("devolve null para entrada ausente ou invalida", () => {
    expect(buildPublicComprovante(null)).toBeNull();
    expect(buildPublicComprovante(undefined)).toBeNull();
    expect(buildPublicComprovante("nope")).toBeNull();
  });
});
