import type { CurrentUserData } from "~/utils/currentUserTokenDecoder";

interface Subscription {
  eventSlug: string;
  hemocioneId: string;
  name: string;
  code: string;
  schedule: {
    _id: unknown;
    startAt: string;
    endAt: string;
  };
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as CurrentUserData | null,
    token: null as string | null,
  }),
  actions: {
    setUser(user: CurrentUserData | null) {
      this.user = user;
    },
    setToken(token: string | null) {
      this.token = token;
    },
  },
});
