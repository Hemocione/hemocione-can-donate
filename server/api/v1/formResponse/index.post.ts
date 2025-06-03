import { useHemocioneUserAuth } from "~/server/services/auth";
import { createFormResponse } from "~/server/services/formResponse";
import { isIntegrationSlug } from "~/utils/integrations";
import type { IntegrationPayload } from "~/utils/integrations";

export default defineEventHandler(async (event) => {
  let user: ReturnType<typeof useHemocioneUserAuth> | undefined = undefined;
  try {
    user = useHemocioneUserAuth(event);
    console.log("✅ User detected in request:", user);
  } catch (e) {
    console.warn("⚠️ No user detected, defaulting to anonymous.");
  }

  const body = await readBody(event);
  let integration: IntegrationPayload | null = null;
  if (body?.integration && isIntegrationSlug(body.integration.integrationSlug)) {
    integration = body.integration as IntegrationPayload;
  }

  const formResponse = await createFormResponse(
    user ?? null,
    event.headers.get("Authorization") ?? undefined,
    integration
  );
  console.log("🛠 Created form response:", formResponse);

  return formResponse;
});
