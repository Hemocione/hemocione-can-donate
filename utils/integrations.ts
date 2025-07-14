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

export type ButtonConfig = {
  label: string;
  type: "primary" | "secondary";
  onClick?: () => void; // para ações internas
  url?: string; // para navegação externa
  visible?: boolean;
};

export interface IntegrationDefinition {
  /** Constroi o payload que deve ser criado em << FormResponse.integration >>. */
  buildPayload: (
    route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
  ) => Promise<EventsPayloadWithIntent | null>;

  getButtonConfig?: (formResponse: FormResponseSchema) => Promise<ButtonConfig[]>;
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

/** Função auxiliar para construir os botões das integrações de eventos */
function buildEventButtonConfig(
  formResponse: FormResponseSchema,
  config: {
    main: { label: string; url: string };
    fail: {
      primary: { label: string; url: string };
      secondary: { label: string; url: string };
    };
  }
): ButtonConfig[] {
  const isFailed = formResponse.status === "unable-to-donate";
  if (!isFailed) {
    return [
      {
        label: config.main.label,
        type: "primary",
        url: config.main.url,
      },
    ];
  }
  return [
    {
      label: config.fail.primary.label,
      type: "primary",
      url: config.fail.primary.url,
    },
    {
      label: config.fail.secondary.label,
      type: "secondary",
      url: config.fail.secondary.url,
    },
  ];
}

/** Função auxiliar para construir URLs de eventos */
function buildEventUrls(
  eventSlug: string | undefined,
  formResponseId: string,
  status: string,
  baseUrl: string
) {
  const queryParams = `formResponseId=${formResponseId}&status=${status}`;
  return {
    schedule: `${baseUrl}/event/${eventSlug}/schedules?${queryParams}`,
    ticket: `${baseUrl}/event/${eventSlug}/ticket?${queryParams}`,
    cancel: `${baseUrl}/event/${eventSlug}/ticket?${queryParams}&shouldCancel=true`,
  };
}

export const integrations: Record<IntegrationSlug, IntegrationDefinition> = {
  "events-flow-schedule": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string =
        (config.public.eventosHemocioneUrl as string) ?? "";
      const formResponseId = (formResponse as any)._id?.toString?.() ?? "";
      const status = formResponse.status;
      const urls = buildEventUrls(eventSlug, formResponseId, status, eventosHemocioneUrl);
      const apoieHemocione: string = (config.public.apoieHemocione as string) ?? "";
      return buildEventButtonConfig(formResponse, {
        main: {
          label: "Selecionar horário para Doação",
          url: urls.schedule,
        },
        fail: {
          primary: {
            label: "Ajudar causa de outra forma",
            url: apoieHemocione,
          },
          secondary: {
            label: "Continuar mesmo assim",
            url: urls.schedule,
          },
        },
      });
    },
  },

  "events-adhoc-ticket": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string =
        (config.public.eventosHemocioneUrl as string) ?? "";
      const formResponseId = (formResponse as any)._id?.toString?.() ?? "";
      const status = formResponse.status;
      const urls = buildEventUrls(eventSlug, formResponseId, status, eventosHemocioneUrl);
      return buildEventButtonConfig(formResponse, {
        main: {
          label: "Voltar para ingresso",
          url: urls.ticket,
        },
        fail: {
          primary: {
            label: "Cancelar inscrição",
            url: urls.cancel,
          },
          secondary: {
            label: "Continuar mesmo assim",
            url: urls.ticket,
          },
        },
      });
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