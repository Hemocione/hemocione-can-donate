import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";

const { findById, select, optionalAuth } = vi.hoisted(() => ({
  findById: vi.fn(),
  select: vi.fn(),
  optionalAuth: vi.fn(),
}));

vi.mock("~/server/models/formResponse", () => ({
  FormResponse: { findById },
}));
vi.mock("~/server/services/auth", () => ({
  useOptionalHemocioneUserAuth: optionalAuth,
}));

import { loadAccessibleForm } from "./loadAccessibleForm";

const VALID_ID = "507f1f77bcf86cd799439011";
const event = {} as H3Event;

// findById devolve um thenable com .select, como a query do Mongoose
function mockDoc(doc: unknown) {
  select.mockResolvedValue(doc);
  findById.mockReturnValue({
    select,
    then: (resolve: (v: unknown) => unknown) => resolve(doc),
  });
}

async function expect404(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({
    statusCode: 404,
    statusMessage: "FormResponse not found",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadAccessibleForm", () => {
  it("formId que nao e ObjectId: 404 sem consultar o model", async () => {
    await expect404(loadAccessibleForm(event, "nao-e-objectid"));
    expect(findById).not.toHaveBeenCalled();
  });

  it("formulario inexistente: 404", async () => {
    optionalAuth.mockReturnValue(null);
    mockDoc(null);
    await expect404(loadAccessibleForm(event, VALID_ID));
  });

  it("formulario com dono e outro usuario: 404", async () => {
    optionalAuth.mockReturnValue({ id: "user-b" });
    mockDoc({ user: { id: "user-a" } });
    await expect404(loadAccessibleForm(event, VALID_ID));
  });

  it("formulario com dono sem token valido: 404", async () => {
    optionalAuth.mockReturnValue(null);
    mockDoc({ user: { id: "user-a" } });
    await expect404(loadAccessibleForm(event, VALID_ID));
  });

  it("formulario com dono e o dono: devolve o documento", async () => {
    const doc = { user: { id: "user-a" } };
    optionalAuth.mockReturnValue({ id: "user-a" });
    mockDoc(doc);
    await expect(loadAccessibleForm(event, VALID_ID)).resolves.toBe(doc);
  });

  it("formulario anonimo: qualquer requisitante acessa, inclusive sem login", async () => {
    const doc = { user: undefined };
    mockDoc(doc);
    optionalAuth.mockReturnValue(null);
    await expect(loadAccessibleForm(event, VALID_ID)).resolves.toBe(doc);
    optionalAuth.mockReturnValue({ id: "user-b" });
    await expect(loadAccessibleForm(event, VALID_ID)).resolves.toBe(doc);
  });

  it("repassa a projecao para .select quando informada", async () => {
    optionalAuth.mockReturnValue(null);
    mockDoc({ user: { id: "" } });
    await loadAccessibleForm(event, VALID_ID, "mode user.id");
    expect(select).toHaveBeenCalledWith("mode user.id");
  });

  it("nao chama .select sem projecao", async () => {
    optionalAuth.mockReturnValue(null);
    mockDoc({ user: { id: "" } });
    await loadAccessibleForm(event, VALID_ID);
    expect(select).not.toHaveBeenCalled();
  });
});
