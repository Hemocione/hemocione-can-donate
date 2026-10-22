import { describe, expect, it } from "vitest";
import { buildOpenFormFilter } from "./openForm";

describe("buildOpenFormFilter", () => {
  it("filtra por dono, em aberto, sem integracao e nas ultimas 24h", () => {
    const now = new Date("2026-10-21T12:00:00Z");
    expect(buildOpenFormFilter("user-a", now)).toEqual({
      "user.id": "user-a",
      status: "ongoing",
      integration: null,
      startedAt: { $gte: new Date("2026-10-20T12:00:00Z") },
    });
  });
});
