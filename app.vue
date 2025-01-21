<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useServerSeoMeta({
  description: "Responda ao questionário e descubra se pode doar",
  ogDescription: "Responda ao questionário e descubra se pode doar.",
  ogImage:
    "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
  twitterCard: "summary_large_image",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
  title: "Posso Doar?"
});

useHead({
  title: "Posso doar sangue?",
})
</script>
