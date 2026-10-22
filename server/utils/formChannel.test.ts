import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormResponse, formChannels } from "../models/formResponse";

const created: Record<string, unknown>[] = [];
const state: { body: unknown; form: any } = { body: {}, form: null };

vi.mock("h3", () => ({
  defineEventHandler: (fn: unknown) => fn,
  readBody: async () => state.body,
  createError: (e: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(e.statusMessage), e),
}));
vi.mock("~/server/services/auth", () => ({
  useHemocioneUserAuth: () => {
    throw new Error("no user");
  },
}));
vi.mock("~/server/services/formResponse", () => ({
  createFormResponse: async (...args: unknown[]) => {
    const channel = args[4];
    created.push({ channel });
    return new FormResponse({ channel }).toObject();
  },
}));

beforeEach(() => {
  created.length = 0;
  vi.stubGlobal("defineEventHandler", (fn: unknown) => fn);
  vi.stubGlobal("readBody", async () => state.body);
  vi.stubGlobal("createError", (e: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(e.statusMessage), e)
  );
  vi.stubGlobal("loadAccessibleForm", async () => state.form);
});

const fakeEvent = (params: Record<string, string> = {}) => ({
  headers: new Headers(),
  context: { params },
});

describe("channel no modelo", () => {
  it("expoe os canais validos", () => {
    expect([...formChannels]).toEqual(["site", "hemarcio"]);
  });

  it("default site no formulario e na resposta", () => {
    const doc = new FormResponse({
      answers: { age: { value: "positive" } },
    });
    expect(doc.channel).toBe("site");
    expect(doc.answers!.get("age")!.channel).toBe("site");
  });

  it("rejeita canal invalido", () => {
    const doc = new FormResponse({ channel: "whatsapp" });
    expect(doc.validateSync()?.errors.channel).toBeDefined();
  });
});

describe("POST /api/v1/formResponse", () => {
  it("guarda channel hemarcio", async () => {
    const handler = (await import("../api/v1/formResponse/index.post")).default as any;
    state.body = { donationIntent: "today", channel: "hemarcio" };
    const result = await handler(fakeEvent());
    expect(created[0].channel).toBe("hemarcio");
    expect(result.channel).toBe("hemarcio");
  });

  it("canal invalido retorna 400", async () => {
    const handler = (await import("../api/v1/formResponse/index.post")).default as any;
    state.body = { donationIntent: "today", channel: "whatsapp" };
    await expect(handler(fakeEvent())).rejects.toMatchObject({ statusCode: 400 });
    expect(created).toHaveLength(0);
  });

  it("sem channel vira site", async () => {
    const handler = (await import("../api/v1/formResponse/index.post")).default as any;
    state.body = { donationIntent: "today" };
    const result = await handler(fakeEvent());
    expect(created[0].channel).toBe("site");
    expect(result.channel).toBe("site");
  });
});

describe("PUT /api/v1/formResponse/:formId/answers/:answerSlug", () => {
  const makeForm = () => {
    const form = new FormResponse({ donationIntent: "today" });
    form.save = vi.fn(async () => form) as any;
    return form;
  };

  it("guarda channel por resposta", async () => {
    const handler = (await import("../api/v1/formResponse/[formId]/answers/[answerSlug]/index.put")).default as any;
    state.form = makeForm();
    state.body = { value: "positive", answeredAt: "2026-10-22T10:00:00Z", channel: "hemarcio" };
    await handler(fakeEvent({ formId: "f1", answerSlug: "age" }));
    expect(state.form.answers.get("age").channel).toBe("hemarcio");
  });

  it("sem channel a resposta vira site", async () => {
    const handler = (await import("../api/v1/formResponse/[formId]/answers/[answerSlug]/index.put")).default as any;
    state.form = makeForm();
    state.body = { value: "positive", answeredAt: "2026-10-22T10:00:00Z" };
    await handler(fakeEvent({ formId: "f1", answerSlug: "age" }));
    expect(state.form.answers.get("age").channel).toBe("site");
  });

  it("canal invalido retorna 422", async () => {
    const handler = (await import("../api/v1/formResponse/[formId]/answers/[answerSlug]/index.put")).default as any;
    state.form = makeForm();
    state.body = { value: "positive", answeredAt: "2026-10-22T10:00:00Z", channel: "x" };
    await expect(handler(fakeEvent({ formId: "f1", answerSlug: "age" }))).rejects.toMatchObject({ statusCode: 422 });
  });
});
