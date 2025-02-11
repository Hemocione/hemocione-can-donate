import type { LocationQuery } from "#vue-router";
import { useUserStore } from "~/stores/user";
import { currentUserTokenDecoder } from "~/utils/currentUserTokenDecoder";
import { getHemocioneIdUrl } from "~/utils/getHemocioneIdUrl";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return;

  const isLoggedIn = await evaluateCurrentLogin(from.query);
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
  if (query?.token) {
    return String(query.token);
  }

  const { token } = useUserStore();
  if (token) {
    return token;
  }

  const config = useRuntimeConfig();
  const cookieToken = useCookie(config.public.authCookieKey).value as string;
  return cookieToken;
}

export function redirectToID(fullPath: string) {
  const config = useRuntimeConfig();
  const redirectUrl = `${config.public.siteUrl}${fullPath}`;
  navigateTo(getHemocioneIdUrl(redirectUrl), { external: true });
}
