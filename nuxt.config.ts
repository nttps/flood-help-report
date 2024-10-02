// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/fonts',  '@vueuse/nuxt',],
  fonts: {
    google: {
      families: {
        Sarabun: [300, 400, 600, 700]
      }
    }
  },
  colorMode: {
    classSuffix: "",
    preference: "light", // default theme
    fallback: "light", // fallback theme
    storageKey: "ddpm-color-mode",
  },
})