import { evaluateCurrentLogin } from "~/middleware/auth";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vue:setup", () => {
    const route = useRoute();
    const router = useRouter(); 

    console.log("Acessando bloqueio")
    console.log(route)

    if (route.meta.blockDirectAccess) {
        router.push("/"); 
      }
  });
});