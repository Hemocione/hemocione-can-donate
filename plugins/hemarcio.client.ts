import {
  hemarcioContextFor,
  isIframedContext,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";

const SDK_URL = "https://chat.hemocione.com.br/sdk/0.1.0/hemocione-sdk.js";

let sdkPromise: Promise<NonNullable<Window["HemocioneSDK"]>> | undefined;

const loadSdk = () => {
  sdkPromise ??= new Promise((resolve, reject) => {
    if (window.HemocioneSDK) return resolve(window.HemocioneSDK);
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () =>
      window.HemocioneSDK
        ? resolve(window.HemocioneSDK)
        : reject(new Error("HemocioneSDK ausente"));
    script.onerror = () => {
      sdkPromise = undefined;
      reject(new Error("falha ao carregar o SDK do Hemarcio"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
};

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();
  const insideFrame = window.self !== window.top;
  let chat: ReturnType<
    NonNullable<Window["HemocioneSDK"]>["createHemocioneChat"]
  > | null = null;
  let creating = false;

  const visible = () => {
    const route = router.currentRoute.value;
    return shouldShowHemarcioBubble({
      enabled: config.hemarcioEnabled as string,
      iframed: isIframedContext(insideFrame, route.query),
      path: route.path,
    });
  };

  const sync = async () => {
    if (!visible()) {
      chat?.destroy();
      chat = null;
      return;
    }
    const context = hemarcioContextFor(router.currentRoute.value.path);
    if (chat) return chat.setContext(context);
    if (creating) return;
    creating = true;
    try {
      const sdk = await loadSdk();
      // a rota pode ter mudado durante o carregamento do script
      if (!visible()) return;
      chat = sdk.createHemocioneChat({
        chatUrl: config.hemarcioChatUrl as string,
        context: hemarcioContextFor(router.currentRoute.value.path),
        // sobe a bolha acima do rodape de botoes do questionario no celular
        offset: { x: 16, y: 140 },
      });
    } catch (error) {
      console.warn("[hemarcio]", error);
    } finally {
      creating = false;
    }
  };

  nuxtApp.hook("app:mounted", sync);
  router.afterEach(() => {
    if (nuxtApp.isHydrating) return;
    void sync();
  });
});
