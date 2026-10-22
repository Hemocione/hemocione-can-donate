const OBJECT_ID = /^[0-9a-f]{24}$/i;

// Sem id valido (24 hex) nao ha contexto: o botao nao aparece.
export function resultAskContext(
  formResponse: { _id?: unknown } | null | undefined,
): Record<string, unknown> | null {
  const id = formResponse?._id;
  if (typeof id !== "string" || !OBJECT_ID.test(id)) return null;
  return { product: "possodoar", screen: "result", formResponseId: id };
}
