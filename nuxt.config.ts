const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === undefined) {
    const nuxtDevConfig = process.env.__NUXT_DEV__;
    let networkAddress;
    if (nuxtDevConfig) {
      const parsedConfig = JSON.parse(nuxtDevConfig);
      networkAddress = parsedConfig?.proxy?.urls?.find(
        (addr: any) => addr.type === "network"
      )?.url;
    }

    return networkAddress || "http://localhost:3000";
  }

  if (process.env.VERCEL_ENV !== "production") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://possodoar.hemocione.com.br";
};

const getCurrentEnv = () => {
  if (process.env.VERCEL_ENV === "preview") {
    return "dev";
  }

  if (process.env.VERCEL_ENV === "production") {
    return "prod";
  }

  return "dev";
};

const siteUrl = getSiteUrl();
const currentEnv = getCurrentEnv();
export default defineNuxtConfig({
  // Habilitar ferramentas de desenvolvimento
  devtools: { enabled: true },

  // Variáveis de ambiente (runtime)
  runtimeConfig: {
    mongodbUri:
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/canDonate?authSource=admin&directConnection=true",
    dbName: process.env.DB_NAME || "canDonate",
    public: {
      bugsnagApiKey: process.env.BUGSNAG_API_KEY || "",
      authCookieKey: process.env.HEMOCIONE_AUTH_COOKIE_KEY || "devHemocioneId",
      hemocioneIdApiUrl:
        process.env.HEMOCIONE_ID_API_URL ||
        "https://hemocione-id-dev.cpt.hemocione.com.br",
      hemocioneIdUrl:
        process.env.HEMOCIONE_ID_URL ?? "https://id.d.hemocione.com.br",
      siteUrl,
      eventosHemocione: process.env.EVENTOS_HEMOCIONE || "https://eventos.hemocione.com.br/",
      apoieHemocione: process.env.APOIE_HEMOCIONE || "https://apoie.hemocione.com.br/",
      ondeDoarHemocione: process.env.ONDE_DOAR_HEMOCIONE || "https://ondedoar.hemocione.com.br/",
    },
    hemocioneIdJwtSecretKey:
      process.env.HEMOCIONE_ID_JWT_SECRET_KEY ?? "secret",
  },

  // Configurações de rotas
  routeRules: {
    "/": { prerender: true }, // Prerenderizar a página inicial
  },

  pages: true, // Ativa o sistema de páginas para rotas automáticas

  // Módulos utilizados no projeto
  modules: [
    "nuxt-bugsnag",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@nuxt/image",
    "@element-plus/nuxt",
    "@formkit/auto-animate/nuxt",
  ],

  css: ["~/assets/css/global.css", "~/assets/css/transitions.css"],

  // Configuração do Nitro (ferramenta de execução do Nuxt)
  nitro: {
    preset: "vercel", // Deploy no Vercel
    plugins: ["~/server/plugins/mongoose.ts"], // Plugin do MongoDB
  },

  app: {
    pageTransition: {
      name: "slide-left",
      mode: "out-in",
    },
    layoutTransition: {
      name: "slide-left",
      mode: "out-in",
    },
  },

  bugsnag: {
    publishRelease: true,
    disableLog: false, // might activate later
    baseUrl: siteUrl,
    config: {
      apiKey: process.env.BUGSNAG_API_KEY ?? "",
      enabledReleaseStages: ["prod", "dev"],
      releaseStage: currentEnv,
      appVersion: `${currentEnv}-${process.env.VERCEL_GIT_COMMIT_SHA}`,
    },
  },

  ssr: false,

  compatibilityDate: "2024-10-17",
});
