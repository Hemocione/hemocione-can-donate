import { useHemocioneUserAuth } from "~/server/services/auth";
import { createFormResponse } from "~/server/services/formResponse";

export default defineEventHandler(async (event) => {
  let user: ReturnType<typeof useHemocioneUserAuth> | undefined = undefined;
  try {
    user = useHemocioneUserAuth(event);
    console.log("✅ User detected in request:", user);
  } catch (e) {
    console.warn("⚠️ No user detected, defaulting to anonymous.");
  }

  const body = await readBody(event);
  const integration = body?.integration ?? null;

  const formResponse = await createFormResponse(
    user ?? null,
    event.headers.get("Authorization") ?? undefined,
    integration
  );
  console.log("🛠 Created form response:", formResponse);

  return formResponse;
});
