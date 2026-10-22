import { describe, expect, it } from "vitest";
import { authHeaders } from "./authHeaders";

describe("authHeaders", () => {
  it("com token devolve Authorization Bearer", () => {
    expect(authHeaders("x")).toEqual({ Authorization: "Bearer x" });
  });

  it("sem token devolve objeto vazio", () => {
    expect(authHeaders(null)).toEqual({});
  });

  it("token vazio devolve objeto vazio", () => {
    expect(authHeaders("")).toEqual({});
  });
});
