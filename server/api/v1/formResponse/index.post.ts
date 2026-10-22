import { useHemocioneUserAuth } from "~/server/services/auth";
import { createFormResponse } from "~/server/services/formResponse";
import { isIntegrationSlug } from "~/utils/integrations";
import { formChannels } from "~/server/models/formResponse";

export default defineEventHandler(async (event) => {
  let user: ReturnType<typeof useHemocioneUserAuth> | undefined = undefined;
  try {
    user = useHemocioneUserAuth(event);
    console.log("✅ User detected in request:", user);
  } catch (e) {
    console.warn("⚠️ No user detected, defaulting to anonymous.");
  }

  const body = await readBody(event);

  if (body?.integration && !isIntegrationSlug(body?.integration.integrationSlug)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid integrationSlug" });
  }

  const channel = body?.channel ?? "site";
  if (!(formChannels as readonly unknown[]).includes(channel)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid channel" });
  }

  const formResponse = await createFormResponse(
    user ?? null,
    event.headers.get("Authorization") ?? undefined,
    body.integration,
    body.donationIntent,
    channel,
  );
  console.log("🛠 Created form response:", formResponse);

  return formResponse;
});
