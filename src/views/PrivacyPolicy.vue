<template>
  <div class="h-screen overflow-y-auto bg-[var(--color-bg-body)] flex flex-col">
    <!-- Header -->
    <header
      class="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-between px-6 sticky top-0 z-50"
    >
      <div class="text-xl font-bold text-[var(--color-brand-primary)]">
        STONKS ONLY
      </div>
      <div class="flex gap-4">
        <n-button secondary @click="handlePrint">
          <template #icon><n-icon :component="PrintOutline" /></template>
          {{ t("auth.privacyPolicy.print") }}
        </n-button>
        <n-button ghost @click="router.push('/')">
          <template #icon><n-icon :component="CloseOutline" /></template>
        </n-button>
      </div>
    </header>

    <div class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex gap-12">
      <!-- Sidebar TOC (Desktop) -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto no-print"
      >
        <div
          class="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4"
        >
          {{ t("auth.privacyPolicy.toc") }}
        </div>
        <n-anchor :show-rail="true" :show-background="true">
          <n-anchor-link title="1. Introduction" href="#intro" />
          <n-anchor-link title="2. Data Collection" href="#collection" />
          <n-anchor-link title="3. Data Usage" href="#usage" />
          <n-anchor-link title="4. Data Sharing" href="#sharing" />
          <n-anchor-link title="5. Data Security" href="#security" />
          <n-anchor-link title="6. Your Rights" href="#rights" />
          <n-anchor-link title="7. Cookies" href="#cookies" />
          <n-anchor-link title="8. Contact Us" href="#contact" />
        </n-anchor>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 max-w-3xl prose prose-slate dark:prose-invert">
        <h1 class="text-4xl font-bold mb-4">
          {{ t("auth.privacyPolicy.title") }}
        </h1>
        <p class="text-[var(--color-text-secondary)] mb-8">
          {{ t("auth.privacyPolicy.lastUpdated", { date: "2024-03-15" }) }}
        </p>

        <section id="intro" class="mb-12 scroll-mt-24">
          <h2>1. {{ t("auth.privacyPolicy.sections.intro") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.intro") }}</p>
        </section>

        <section id="collection" class="mb-12 scroll-mt-24">
          <h2>2. {{ t("auth.privacyPolicy.sections.collection") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.collection.intro") }}</p>
          <ul class="list-disc pl-5 mt-4 space-y-2">
            <li
              v-html="t('auth.privacyPolicy.content.collection.items.identity')"
            ></li>
            <li
              v-html="t('auth.privacyPolicy.content.collection.items.contact')"
            ></li>
            <li
              v-html="
                t('auth.privacyPolicy.content.collection.items.financial')
              "
            ></li>
            <li
              v-html="
                t('auth.privacyPolicy.content.collection.items.transaction')
              "
            ></li>
          </ul>
        </section>

        <section id="usage" class="mb-12 scroll-mt-24">
          <h2>3. {{ t("auth.privacyPolicy.sections.usage") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.usage.intro") }}</p>
          <ul class="list-disc pl-5 mt-4 space-y-2">
            <li>{{ t("auth.privacyPolicy.content.usage.items.contract") }}</li>
            <li>
              {{ t("auth.privacyPolicy.content.usage.items.legitimate") }}
            </li>
            <li>{{ t("auth.privacyPolicy.content.usage.items.legal") }}</li>
          </ul>
        </section>

        <section id="sharing" class="mb-12 scroll-mt-24">
          <h2>4. {{ t("auth.privacyPolicy.sections.sharing") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.sharing.p1") }}</p>
          <p>{{ t("auth.privacyPolicy.content.sharing.p2") }}</p>
        </section>

        <section id="security" class="mb-12 scroll-mt-24">
          <h2>5. {{ t("auth.privacyPolicy.sections.security") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.security") }}</p>
        </section>

        <section id="rights" class="mb-12 scroll-mt-24">
          <h2>6. {{ t("auth.privacyPolicy.sections.rights") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.rights") }}</p>
        </section>

        <section id="cookies" class="mb-12 scroll-mt-24">
          <h2>7. {{ t("auth.privacyPolicy.sections.cookies") }}</h2>
          <p>{{ t("auth.privacyPolicy.content.cookies") }}</p>
        </section>

        <section id="contact" class="mb-12 scroll-mt-24">
          <h2>8. {{ t("auth.privacyPolicy.sections.contact") }}</h2>
          <p v-html="t('auth.privacyPolicy.content.contact')"></p>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { NButton, NIcon, NAnchor, NAnchorLink } from "naive-ui";
import { PrintOutline, CloseOutline } from "@vicons/ionicons5";

const router = useRouter();
const { t } = useI18n();

function handlePrint() {
  window.print();
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none;
  }
  header {
    display: none;
  }
}
</style>
