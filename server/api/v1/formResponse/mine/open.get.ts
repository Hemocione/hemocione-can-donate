import { useHemocioneUserAuth } from "~/server/services/auth";
import { FormResponse } from "~/server/models/formResponse";
import { buildOpenFormFilter } from "~/server/utils/openForm";
import { FRONTEND_FIELDS } from "~/server/utils/formResponseFields";

export default defineEventHandler(async (event) => {
  const user = useHemocioneUserAuth(event);

  const formResponse = await FormResponse.findOne(
    buildOpenFormFilter(user.id, new Date())
  )
    .sort({ startedAt: -1 })
    .select(FRONTEND_FIELDS);

  return { formResponse: formResponse ?? null };
});
