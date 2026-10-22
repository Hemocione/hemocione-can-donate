export const OPEN_FORM_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function buildOpenFormFilter(
  userId: string,
  now: Date
): Record<string, unknown> {
  return {
    "user.id": userId,
    status: "ongoing",
    integration: null,
    startedAt: { $gte: new Date(now.getTime() - OPEN_FORM_MAX_AGE_MS) },
  };
}
