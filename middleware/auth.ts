import type { LocationQuery } from "#vue-router";
import { useUserStore } from "~/stores/user";
import { currentUserTokenDecoder } from "~/utils/currentUserTokenDecoder";
import { getHemocioneIdUrl } from "~/utils/getHemocioneIdUrl";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return;

  // O token chega na URL de destino (to.query) quando o usuário entra na
  // integração vindo do digital-event ou retorna do login. Lemos to.query
  // primeiro e mantemos from.query como rede de segurança. Depender do cookie
  // .hemocione.com.br quebra no Safari (ITP segura o cookie cross-subdomínio
  // no primeiro hit), por isso a URL é a fonte primária de auth aqui.
  const isLoggedIn = await evaluateCurrentLogin({ ...from.query, ...to.query });
  if (!isLoggedIn) {
    redirectToID(to.fullPath);
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, document.title, url.toString());
  const userStore = useUserStore();
  userStore.setLoadingLogin(false);
});

export async function evaluateCurrentLogin(query?: LocationQuery) {
  const userStore = useUserStore();
  const config = useRuntimeConfig();

  if (userStore.user) return true; // Already logged in

  const token = getCurrentToken(query);

  if (!token) return false;
  let tokenIsValid = true;

  try {
    await useFetch(`${config.public.hemocioneIdApiUrl}/users/validate-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onRequestError: (_error) => {
        tokenIsValid = false;
      },
      onResponseError: (_error) => {
        tokenIsValid = false;
      },
    });
  } catch (error) {
    tokenIsValid = false;
  }

  if (!tokenIsValid) {
    userStore.setUser(null);
    userStore.setToken(null);
    return false;
  }

  const currentUser = currentUserTokenDecoder(token);

  if (!currentUser) {
    return false;
  }

  userStore.setUser(currentUser);
  userStore.setToken(token);

  console.log("User logged in:", currentUser);

  return true;
}

export function getCurrentToken(query?: LocationQuery): string | null {
  const queryToken = normalizeQueryToken(query?.token);
  if (queryToken) {
    return queryToken;
  }

  const { token } = useUserStore();
  if (token) {
    return token;
  }

  const config = useRuntimeConfig();
  const cookieToken = useCookie(config.public.authCookieKey).value as string;
  return cookieToken;
}

// A URL pode chegar com mais de um `token`: o hemocione-id faz append do token
// recém-emitido numa URL que já carregava o token do goToCanDonate, e o
// vue-router transforma isso num array. Pega o último valor não-vazio, que é o
// mais recente.
function normalizeQueryToken(
  token: LocationQuery[string] | undefined,
): string | null {
  if (token == null) return null;
  if (Array.isArray(token)) {
    const last = token.filter(Boolean).pop();
    return last ? String(last) : null;
  }
  return String(token);
}

export function redirectToID(fullPath: string) {
  const config = useRuntimeConfig();
  const redirectUrl = `${config.public.siteUrl}${fullPath}`;
  navigateTo(getHemocioneIdUrl(redirectUrl), { external: true });
}
