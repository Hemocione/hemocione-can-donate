import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { FormResponseSchema, IntegrationSlug } from "~/server/models/formResponse";
import { integrationSlugs } from "~/server/models/formResponse";

export function isIntegrationSlug(value: unknown): value is IntegrationSlug {
  return typeof value === "string" && (integrationSlugs as readonly string[]).includes(value);
}

/** Todo objeto guardado em `formResponse.integration` deve ser um extend disso. */
export interface BaseIntegration {
  integrationSlug: IntegrationSlug;
}

export interface EventsIntegration extends BaseIntegration {
  integrationSlug: "events-flow-schedule" | "events-adhoc-ticket";
  eventSlug: string;
  eventDate: string | Date; // ISO string no front, Date no back
}

/** Union de todos os payloads existentes. */
export type IntegrationPayload = EventsIntegration;

export interface IntegrationDefinition<
  P extends BaseIntegration = BaseIntegration
> {
  /** Constroi o payload que deve ser criado em << FormResponse.integration >>. */
  buildPayload: (
    route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
  ) => P | null;

  getButtonConfig?: (formResponse: FormResponseSchema) => Promise<any>;
}

/** "events-flow-schedule" e "events-adhoc-ticket" compartilham a mesma lógica. */
const buildEventsPayload = (
  route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
): EventsIntegration | null => {
  const slug = route.params.integrationSlug as IntegrationSlug | undefined;
  if (slug !== "events-flow-schedule" && slug !== "events-adhoc-ticket") return null;

  const eventSlug = route.query.eventSlug as string | undefined;
  const eventDate = route.query.eventDate as string | undefined;
  if (!eventSlug || !eventDate) return null;

  return { integrationSlug: slug, eventSlug, eventDate };
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
): IntegrationDefinition {
  if (!isIntegrationSlug(slug)) throw new Error(`Slug inválido: '${slug}'`);
  const def = integrations[slug];
  if (!def) throw new Error(`Nenhum IntegrationDefinition registrado para '${slug}'`);
  return def;
}
