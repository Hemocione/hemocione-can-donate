import { describe, expect, it } from "vitest";
import {
  hemarcioContextFor,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";

const base = { enabled: "true", iframed: false, path: "/intention" };

describe("shouldShowHemarcioBubble", () => {
  it("mostra no questionario com flag ligada", () => {
    expect(shouldShowHemarcioBubble(base)).toBe(true);
    expect(shouldShowHemarcioBubble({ ...base, enabled: true })).toBe(true);
    expect(shouldShowHemarcioBubble({ ...base, path: "/" })).toBe(true);
  });
  it("esconde com flag desligada ou ausente", () => {
    expect(shouldShowHemarcioBubble({ ...base, enabled: "false" })).toBe(false);
    expect(shouldShowHemarcioBubble({ ...base, enabled: "" })).toBe(false);
    expect(shouldShowHemarcioBubble({ ...base, enabled: undefined })).toBe(false);
  });
  it("esconde dentro de iframe", () => {
    expect(shouldShowHemarcioBubble({ ...base, iframed: true })).toBe(false);
  });
  it("esconde no comprovante", () => {
    for (const p of ["/comprovante", "/comprovante/abc", "/comprovante/abc/"]) {
      expect(shouldShowHemarcioBubble({ ...base, path: p })).toBe(false);
    }
  });
  it("nao confunde rota parecida com comprovante", () => {
    expect(shouldShowHemarcioBubble({ ...base, path: "/comprovantes-x" })).toBe(true);
  });
});

describe("hemarcioContextFor", () => {
  it("monta o contexto do posso doar", () => {
    expect(hemarcioContextFor("/intention")).toEqual({
      product: "can-donate",
      page: "/intention",
    });
  });
});
