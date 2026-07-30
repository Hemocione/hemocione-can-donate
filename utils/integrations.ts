import dayjs from 'dayjs';
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from "vue-router";
import type { FormResponseSchema, IntegrationSlug } from "~/server/models/formResponse";
import { integrationSlugs } from "~/server/models/formResponse";
import { buildAllowedUrl } from "~/utils/allowedHosts";

export function isIntegrationSlug(value: unknown): value is IntegrationSlug {
  return typeof value === "string" && (integrationSlugs as readonly string[]).includes(value);
}

export interface EventsIntegration {
  eventSlug: string;
  eventDate: string | Date; // ISO string no front, Date no back
  /**
   * Slug da copa relacionada ao evento, derivado do registerDonationUrl do
   * evento no digital-event. Opcional: evento sem copa relacionada nao ganha o
   * botao de registrar participacao, e o fluxo segue identico ao anterior.
   */
  competitionSlug?: string;
}

export interface CompetitionParticipationIntegration {
  competitionSlug: string;
  /** Path RELATIVO. Resolvido sobre runtimeConfig.public.yduqsSite. */
  returnPath: string;
}

/** Union de todos os payloads existentes. */
export type IntegrationPayload =
  | EventsIntegration
  | CompetitionParticipationIntegration;

export type ButtonConfig = {
  label: string;
  type: "primary" | "secondary";
  onClick?: () => void; // para ações internas
  url?: string; // para navegação externa
  visible?: boolean;
};

type PayloadWithIntent = IntegrationPayload & { intent: "today" | "soon" };

export interface IntegrationDefinition {
  /** Constroi o payload que deve ser criado em << FormResponse.integration >>. */
  buildPayload: (
    route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
  ) => Promise<PayloadWithIntent | null>;

  getButtonConfig?: (formResponse: FormResponseSchema) => Promise<ButtonConfig[]>;

  getRedirectURL?: (formResponse: FormResponseSchema) => Promise<RouteLocationRaw>;
}

/** "event-flow-schedule" e "event-ticket-adhoc" compartilham a mesma lógica. */
const buildEventsPayload = async (
  route: Pick<RouteLocationNormalizedLoaded, "params" | "query">
): Promise<PayloadWithIntent | null> => {
  const eventSlug = route.query.eventSlug as string | undefined;
  const eventDate = route.query.eventDate as string | undefined;
  if (!eventSlug || !eventDate) return null;

  const competitionSlug = route.query.competitionSlug as string | undefined;

  const tz = getUserTimeZone();
  const eventDay = dayjs.utc(eventDate).tz(tz).startOf("day");
  const today = dayjs().tz(tz).startOf("day");

  const intent: "today" | "soon" = today.isBefore(eventDay) ? "soon" : "today";

  return {
    intent,
    eventSlug,
    eventDate,
    ...(competitionSlug ? { competitionSlug } : {}),
  };
};

/**
 * URL de registro na copa.
 *
 * `kind` vem pre-selecionado mas permanece editavel no formulario da copa: o
 * campo e autodeclarado, entao mentir pelo query param equivale a mentir
 * clicando no radio — nao ha garantia perdida.
 */
export function buildCompetitionRegisterUrl(
  competitionSlug: string,
  opts: { kind?: "donation" | "participation"; proofUrl?: string } = {},
): string | null {
  const config = useRuntimeConfig();
  const base = (config.public.copaHemocione as string) ?? "";
  if (!base) return null;

  try {
    const url = new URL(
      `/competition/${encodeURIComponent(competitionSlug)}/register`,
      base,
    );
    if (opts.kind) url.searchParams.set("kind", opts.kind);
    if (opts.proofUrl) url.searchParams.set("proofUrl", opts.proofUrl);
    return url.toString();
  } catch {
    return null;
  }
}

/** URL publica do comprovante desta pre-triagem, usada como prova na copa. */
export function buildComprovanteUrl(
  formResponse: FormResponseSchema,
): string | null {
  const config = useRuntimeConfig();
  const token = (formResponse as { publicToken?: string }).publicToken;
  if (!token) return null;

  const base = (config.public.siteUrl as string) ?? "";
  if (!base) return null;

  try {
    return new URL(`/comprovante/${token}`, base).toString();
  } catch {
    return null;
  }
}

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

  // Evento com copa relacionada: quem foi reprovado na pre-triagem ainda tem a
  // participacao contada na campanha. Sem copa este botao nao existe e a lista
  // fica identica a de antes.
  const competitionSlug = (
    formResponse.integration?.payload as EventsIntegration | undefined
  )?.competitionSlug;

  const registerUrl = competitionSlug
    ? buildCompetitionRegisterUrl(competitionSlug, {
        kind: "participation",
        proofUrl: buildComprovanteUrl(formResponse) ?? undefined,
      })
    : null;

  if (!registerUrl) {
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

  return [
    {
      label: "Registrar participação",
      type: "primary",
      url: registerUrl,
    },
    {
      label: config.fail.secondary.label,
      type: "secondary",
      url: config.fail.secondary.url,
    },
    {
      label: config.fail.primary.label,
      type: "secondary",
      url: config.fail.primary.url,
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
  "event-flow-schedule": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string =
        (config.public.eventosHemocione as string) ?? "";
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

    async getRedirectURL(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string = (config.public.eventosHemocione as string) ?? "";

      const url = new URL(`/event/${encodeURIComponent(eventSlug)}/pre-screening`, eventosHemocioneUrl);
      return url.toString();
    },
  },

  "event-ticket-adhoc": {
    buildPayload: buildEventsPayload,
    async getButtonConfig(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string =
        (config.public.eventosHemocione as string) ?? "";
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

    async getRedirectURL(formResponse) {
      const config = useRuntimeConfig();
      const eventSlug = formResponse.integration?.payload?.eventSlug;
      const eventosHemocioneUrl: string = (config.public.eventosHemocione as string) ?? "";

      const url = new URL(`/event/${encodeURIComponent(eventSlug)}/ticket`, eventosHemocioneUrl);
      return url.toString();
    },
  },

  /**
   * Pre-triagem FORA de evento: a pessoa vai doar num banco de sangue por
   * conta propria, vindo de uma campanha de parceiro.
   *
   * Deliberadamente generica, nao especifica de YDUQS: a campanha do semestre
   * que vem nao deve precisar de codigo novo.
   */
  "competition-participation": {
    async buildPayload(route) {
      const competitionSlug = route.query.competitionSlug as string | undefined;
      if (!competitionSlug) return null;

      const returnPath = (route.query.returnPath as string | undefined) ?? "/apto";

      // Fora de evento nao ha data marcada: a pessoa vai doar por conta
      // propria, hoje.
      return { intent: "today", competitionSlug, returnPath };
    },

    async getButtonConfig(formResponse) {
      const config = useRuntimeConfig();
      const payload = (formResponse.integration?.payload ??
        {}) as Partial<CompetitionParticipationIntegration>;
      const competitionSlug = payload.competitionSlug;
      const returnPath = payload.returnPath ?? "/apto";

      if (!competitionSlug) return [];

      const isFailed = formResponse.status === "unable-to-donate";

      if (!isFailed) {
        const buttons: ButtonConfig[] = [];
        const aptoUrl = buildAllowedUrl(
          (config.public.yduqsSite as string) ?? "",
          returnPath,
        );
        if (aptoUrl) {
          buttons.push({
            label: "Ver os próximos passos",
            type: "primary",
            url: aptoUrl,
          });
        }
        buttons.push({
          label: "Encontrar um banco de sangue",
          type: aptoUrl ? "secondary" : "primary",
          url: (config.public.ondeDoarHemocione as string) ?? "",
        });
        return buttons;
      }

      const buttons: ButtonConfig[] = [];
      const registerUrl = buildCompetitionRegisterUrl(competitionSlug, {
        kind: "participation",
        proofUrl: buildComprovanteUrl(formResponse) ?? undefined,
      });
      if (registerUrl) {
        buttons.push({
          label: "Registrar participação",
          type: "primary",
          url: registerUrl,
        });
      }
      buttons.push({
        label: "Ajudar a causa de outra forma",
        type: registerUrl ? "secondary" : "primary",
        url: (config.public.apoieHemocione as string) ?? "",
      });
      return buttons;
    },

    async getRedirectURL(formResponse) {
      // Destino do botao VOLTAR — nao do resultado.
      const config = useRuntimeConfig();
      const yduqsSite = (config.public.yduqsSite as string) ?? "/";
      const returnPath = (
        formResponse.integration?.payload as
          | Partial<CompetitionParticipationIntegration>
          | undefined
      )?.returnPath;

      if (!returnPath) return yduqsSite;
      return buildAllowedUrl(yduqsSite, returnPath) ?? yduqsSite;
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
