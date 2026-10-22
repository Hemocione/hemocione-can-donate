import { createError } from "h3";
import type { H3Event } from "h3";
import type { FormResponse } from "../models/formResponse";

type FormResponseDocument = NonNullable<
  Awaited<ReturnType<typeof FormResponse.findById>>
>;

// Formulario com dono so aceita o dono; formulario anonimo segue aberto
export function canAccessForm(
  formUserId: string | null | undefined,
  requesterId: string | null
): boolean {
  if (!formUserId) return true;
  return formUserId === requesterId;
}

function notFound() {
  return createError({
    statusCode: 404,
    statusMessage: "FormResponse not found",
  });
}

export async function loadAccessibleForm(
  event: H3Event,
  formId: string,
  projection?: string
): Promise<FormResponseDocument> {
  if (!/^[a-f\d]{24}$/i.test(formId)) {
    throw notFound();
  }

  // imports dinamicos: auth.ts le runtimeConfig e o model usa o alias ~ ao carregar, o que quebra o teste unitario
  const { FormResponse } = await import("../models/formResponse");
  const { useOptionalHemocioneUserAuth } = await import("../services/auth");
  const requester = useOptionalHemocioneUserAuth(event);

  const query = FormResponse.findById(formId);
  const doc = await (projection ? query.select(projection) : query);

  if (!doc || !canAccessForm(doc.user?.id, requester?.id ?? null)) {
    throw notFound();
  }
  return doc;
}
