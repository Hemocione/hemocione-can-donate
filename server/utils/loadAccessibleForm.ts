import { createError } from "h3";
import type { H3Event } from "h3";
import { FormResponse } from "~/server/models/formResponse";
import { useOptionalHemocioneUserAuth } from "~/server/services/auth";
import { canAccessForm } from "./formAccess";

type FormResponseDocument = NonNullable<
  Awaited<ReturnType<typeof FormResponse.findById>>
>;

function notFound() {
  return createError({
    statusCode: 404,
    statusMessage: "FormResponse not found",
  });
}

// A checagem de dono le user.id; sem ele um formulario com dono viraria anonimo
function withOwnerField(projection: string): string {
  const fields = projection.split(/\s+/).filter(Boolean);
  return fields.includes("user.id") ? projection : [...fields, "user.id"].join(" ");
}

export async function loadAccessibleForm(
  event: H3Event,
  formId: string,
  projection?: string
): Promise<FormResponseDocument> {
  if (!/^[a-f\d]{24}$/i.test(formId)) {
    throw notFound();
  }

  const requester = useOptionalHemocioneUserAuth(event);

  const query = FormResponse.findById(formId);
  const doc = await (projection
    ? query.select(withOwnerField(projection))
    : query);

  if (!doc || !canAccessForm(doc.user?.id, requester?.id ?? null)) {
    throw notFound();
  }
  return doc;
}
