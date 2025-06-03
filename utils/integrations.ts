import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { FormResponseSchema, IntegrationSlug } from "~/server/models/formResponse";
import { integrationSlugs } from "~/server/models/formResponse";

export function isIntegrationSlug(value: unknown): value is IntegrationSlug {
  return (
    typeof value === "string" &&
    (integrationSlugs as readonly string[]).includes(value)
  );
}

/** Interface-base: todo objeto salvo em `formResponse.integration` precisa dela */
export interface BaseIntegration {
  /** Discriminador usado pelo Mongoose (`integrationSlug`) */
  integrationSlug: IntegrationSlug;
}

/** Integrações vindas do módulo “Eventos” */
export interface EventsIntegration extends BaseIntegration {
  integrationSlug: "events-flow-schedule" | "events-adhoc-ticket";
  eventSlug: string;
  /** ISO string no front; `Date` no back-end depois do cast do Mongoose */
  eventDate: string | Date;
}

/** Adicionar novos tipos de integração aqui quando surgirem */
export type IntegrationPayload = EventsIntegration;

/**
 * Constrói um objeto que pode ser salvo direto em
 * `FormResponse.integration` a partir da rota /integration/[slug].
 *
 * Retorna `null` quando o slug não é reconhecido ou se faltarem params.
 */
export function buildIntegrationPayload(
  route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
): IntegrationPayload | null {
  const slug = route.params.integrationSlug as IntegrationSlug | undefined;
  if (!slug) return null;

  if (slug === "events-flow-schedule" || slug === "events-adhoc-ticket") {
    const eventSlug = route.query.eventSlug as string | undefined;
    const eventDate = route.query.eventDate as string | undefined;
    if (!eventSlug || !eventDate) return null;

    return {
      integrationSlug: slug,
      eventSlug,
      eventDate,
    };
  }

  /* slug existe no type system, mas ainda não foi mapeado aqui */
  return null;
}

export interface IntegrationDefinition {
  getConfig: (formResponse: FormResponseSchema) => Promise<any>;
}

/**
 * Mapa central de integrações — o compilador obriga que todos os
 * `IntegrationSlug` tenham uma entrada aqui.
 */
export const integrations: Record<IntegrationSlug, IntegrationDefinition> = {
  "events-flow-schedule": {
    async getConfig(formResponse) {
      // TODO: definição do getConfig aqui
    },
  },

  "events-adhoc-ticket": {
    async getConfig(formResponse) {
      // TODO: definição do getConfig aqui
    },
  },
};

/**
 * Pequeno utilitário para pegar rapidamente o “driver” correto
 * a partir de um `FormResponse`.
 */
export function getIntegrationDefinition(
  formResponse: FormResponseSchema
): IntegrationDefinition {
  const slug = (formResponse.integration as BaseIntegration | null)
    ?.integrationSlug;
  if (!slug) throw new Error("FormResponse não possui integrationSlug");
  const def = integrations[slug];
  if (!def)
    throw new Error(`Nenhum IntegrationDefinition registrado para '${slug}'`);
  return def;
}
