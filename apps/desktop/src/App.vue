<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider } from "naive-ui";
import { useTheme } from "./composables/useTheme";

const { currentTheme, themeOverrides } = useTheme();
</script>

<template>
  <NConfigProvider :theme="currentTheme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
/* Global Tabs Fix */
.n-tabs .n-tabs-rail {
  /* Use variable for background to support both light and dark modes */
  background-color: var(--color-bg-segment) !important;
}
</style>
