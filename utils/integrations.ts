import dayjs from 'dayjs';
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { FormResponseSchema, IntegrationSlug } from "~/server/models/formResponse";
import { integrationSlugs } from "~/server/models/formResponse";

export function isIntegrationSlug(value: unknown): value is IntegrationSlug {
  return typeof value === "string" && (integrationSlugs as readonly string[]).includes(value);
}

export interface EventsIntegration {
  eventSlug: string;
  eventDate: string | Date; // ISO string no front, Date no back
}

/** Union de todos os payloads existentes. */
export type IntegrationPayload = EventsIntegration;

export interface IntegrationDefinition {
  /** Constroi o payload que deve ser criado em << FormResponse.integration >>. */
  buildPayload: (
    route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
  ) => Promise<EventsPayloadWithIntent | null>;

  getButtonConfig?: (formResponse: FormResponseSchema) => Promise<any>;
}

type EventsPayloadWithIntent = EventsIntegration & { intent: "today" | "soon" };

/** "events-flow-schedule" e "events-adhoc-ticket" compartilham a mesma lógica. */
const buildEventsPayload = async (
  route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
): Promise<EventsPayloadWithIntent | null> => {
  const eventSlug = route.query.eventSlug as string | undefined;
  const eventDate = route.query.eventDate as string | undefined;
  if (!eventSlug || !eventDate) return null;

  const tz = getUserTimeZone();
  const eventDay = dayjs.utc(eventDate).tz(tz).startOf("day");
  const today = dayjs().tz(tz).startOf("day");

  const intent: "today" | "soon" = today.isBefore(eventDay) ? "soon" : "today";

  return { intent, eventSlug, eventDate };
};

export const integrations: Record<IntegrationSlug, IntegrationDefinition> = {
  "events-flow-schedule": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      // TODO: implement
    },
  },

  "events-adhoc-ticket": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      // TODO: implement
    },
  },
};

/** A partir de qualquer slug, pega a IntegrationDefinition correspondente */
export function getIntegrationDefinition(
  slug: string | undefined
): IntegrationDefinition | null {
  if (!isIntegrationSlug(slug)) return null;
  const def = integrations[slug];
  if (!def) return null;
  return def;
}