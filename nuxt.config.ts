const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

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
  return "https://eventos.hemocione.com.br";
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
    mongodbUri: process.env.MONGO_URI || "mongodb://localhost:27017/canDonate",
    dbName: process.env.DB_NAME || "canDonate",
    public: {
      bugsnagApiKey: process.env.NUXT_PUBLIC_BUGSNAG_API_KEY || "",
      authCookieKey: process.env.NUXT_PUBLIC_AUTH_COOKIE_KEY || "auth_token",
    },
  },

  // Configurações de rotas
  routeRules: {
    "/": { prerender: true }, // Prerenderizar a página inicial
  },

  // Módulos utilizados no projeto
  modules: [
    "nuxt-bugsnag",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@nuxt/image",
    "@element-plus/nuxt",
  ],

  // Configuração do Nitro (ferramenta de execução do Nuxt)
  nitro: {
    preset: "vercel", // Deploy no Vercel
    plugins: ["~/server/plugins/mongoose.ts"], // Plugin do MongoDB
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

  compatibilityDate: "2024-10-17",
});
