import { describe, expect, it } from "vitest";
import { buildAllowedUrl } from "./allowedHosts";

describe("buildAllowedUrl", () => {
  const base = "https://yduqs.hemocione.com.br";

  it("resolve path relativo sobre a base", () => {
    expect(buildAllowedUrl(base, "/apto")).toBe(
      "https://yduqs.hemocione.com.br/apto",
    );
  });

  it("aceita path sem barra inicial", () => {
    expect(buildAllowedUrl(base, "apto")).toBe(
      "https://yduqs.hemocione.com.br/apto",
    );
  });

  it("preserva query string do path", () => {
    expect(buildAllowedUrl(base, "/apto?x=1")).toBe(
      "https://yduqs.hemocione.com.br/apto?x=1",
    );
  });

  it("rejeita URL absoluta — seria open redirect", () => {
    expect(buildAllowedUrl(base, "https://evil.com/phish")).toBeNull();
    expect(buildAllowedUrl(base, "http://evil.com")).toBeNull();
  });

  it("rejeita URL protocol-relative", () => {
    expect(buildAllowedUrl(base, "//evil.com")).toBeNull();
  });

  it("rejeita esquemas perigosos", () => {
    expect(buildAllowedUrl(base, "javascript:alert(1)")).toBeNull();
    expect(buildAllowedUrl(base, "data:text/html,<script>")).toBeNull();
  });

  it("rejeita traversal que escaparia da base", () => {
    expect(buildAllowedUrl(base, "/../../etc")).toBeNull();
  });

  it("rejeita entrada vazia ou ausente", () => {
    expect(buildAllowedUrl(base, "")).toBeNull();
    expect(buildAllowedUrl("", "/apto")).toBeNull();
  });

  it("nunca deixa o host da base ser trocado", () => {
    const result = buildAllowedUrl(base, "/apto");
    expect(new URL(result!).host).toBe("yduqs.hemocione.com.br");
  });
});
