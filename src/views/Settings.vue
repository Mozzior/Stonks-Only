<template>
  <div class="w-full max-w-7xl mx-auto space-y-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        {{ t("settings.title") }}
      </h1>
      <p class="text-[var(--color-text-secondary)]">
        {{ t("settings.subtitle") }}
      </p>
    </div>

    <n-tabs
      type="segment"
      animated
      size="large"
      class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6"
    >
      <!-- General Settings -->
      <n-tab-pane name="general" :tab="t('settings.general')">
        <div class="space-y-8 py-4">
          <!-- Appearance -->
          <section class="space-y-4">
            <h3
              class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2"
            >
              <n-icon :component="ColorPaletteOutline" />
              {{ t("settings.appearance") }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all duration-200"
                :class="
                  themeMode === 'dark'
                    ? 'border-[var(--color-brand-primary)] bg-slate-900'
                    : 'border-transparent bg-slate-900 opacity-50 hover:opacity-100'
                "
                @click="setTheme('dark')"
              >
                <div
                  v-if="themeMode === 'dark'"
                  class="absolute top-2 right-2 text-[var(--color-brand-primary)]"
                >
                  <n-icon :component="CheckmarkCircle" size="20" />
                </div>
                <div
                  class="h-20 bg-slate-800 rounded-lg mb-3 border border-slate-700"
                ></div>
                <div class="font-medium text-white text-center">
                  {{ t("settings.darkMode") }}
                </div>
              </div>
              <div
                class="border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all duration-200"
                :class="
                  themeMode === 'light'
                    ? 'border-[var(--color-brand-primary)] bg-slate-100'
                    : 'border-transparent bg-slate-100 opacity-50 hover:opacity-100'
                "
                @click="setTheme('light')"
              >
                <div
                  v-if="themeMode === 'light'"
                  class="absolute top-2 right-2 text-[var(--color-brand-primary)]"
                >
                  <n-icon :component="CheckmarkCircle" size="20" />
                </div>
                <div
                  class="h-20 bg-white rounded-lg mb-3 shadow-sm border border-slate-200"
                ></div>
                <div class="font-medium text-slate-900 text-center">
                  {{ t("settings.lightMode") }}
                </div>
              </div>
              <div
                class="border-2 rounded-xl p-4 cursor-pointer relative overflow-hidden transition-all duration-200"
                :class="
                  themeMode === 'system'
                    ? 'border-[var(--color-brand-primary)] bg-slate-800'
                    : 'border-[var(--color-border)] bg-slate-800 opacity-50 hover:opacity-100'
                "
                @click="setTheme('system')"
              >
                <div
                  v-if="themeMode === 'system'"
                  class="absolute top-2 right-2 text-[var(--color-brand-primary)]"
                >
                  <n-icon :component="CheckmarkCircle" size="20" />
                </div>
                <div
                  class="h-20 bg-gradient-to-r from-slate-200 to-slate-800 rounded-lg mb-3 border border-slate-600"
                ></div>
                <div
                  class="font-medium text-[var(--color-text-primary)] text-center"
                >
                  {{ t("settings.systemMode") }}
                </div>
              </div>
            </div>

            <n-divider />

            <div class="flex items-center justify-between">
              <div>
                <div class="text-[var(--color-text-primary)] font-medium">
                  {{ t("settings.candleColor") }}
                </div>
                <div class="text-xs text-[var(--color-text-secondary)]">
                  {{ t("settings.candleColorDesc") }}
                </div>
              </div>
              <n-select
                :value="candleColorMode"
                :options="candleOptions"
                class="w-64"
                @update:value="setCandleColorMode"
              />
            </div>
          </section>

          <n-divider />

          <!-- Localization -->
          <section class="space-y-4">
            <h3
              class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2"
            >
              <n-icon :component="GlobeOutline" /> Localization
            </h3>
            <n-form-item
              :label="t('settings.language')"
              label-placement="left"
              :show-feedback="false"
            >
              <n-select
                v-model:value="currentLanguage"
                :options="languageOptions"
                class="w-64"
                @update:value="setLanguage"
              />
            </n-form-item>
          </section>
        </div>
      </n-tab-pane>

      <!-- Trading Preferences -->
      <n-tab-pane name="trading" :tab="t('settings.trading')">
        <div class="space-y-8 py-4">
          <section class="space-y-4">
            <h3
              class="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2"
            >
              <n-icon :component="TrendingUpOutline" />
              {{ t("settings.chartExecution") }}
            </h3>

            <div
              class="bg-[var(--color-bg-sidebar)] rounded-xl p-4 space-y-4 border border-[var(--color-border)]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[var(--color-text-primary)] font-medium">
                    {{ t("settings.oneClick") }}
                  </div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("settings.oneClickDesc") }}
                  </div>
                </div>
                <n-switch v-model:value="oneClickTrading" />
              </div>
              <n-divider class="my-2" />
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[var(--color-text-primary)] font-medium">
                    {{ t("settings.showExecutions") }}
                  </div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("settings.showExecutionsDesc") }}
                  </div>
                </div>
                <n-switch v-model:value="showExecutions" />
              </div>
              <n-divider class="my-2" />
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[var(--color-text-primary)] font-medium">
                    {{ t("settings.defaultOrderSize") }}
                  </div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("settings.defaultOrderSizeDesc") }}
                  </div>
                </div>
                <n-input-number
                  v-model:value="defaultOrderSize"
                  size="small"
                  class="w-32"
                />
              </div>
            </div>
          </section>
        </div>
      </n-tab-pane>

      <!-- Notifications -->
      <n-tab-pane name="notifications" :tab="t('settings.notifications')">
        <div class="space-y-6 py-4">
          <div
            class="flex items-center justify-between bg-[var(--color-bg-sidebar)] p-4 rounded-xl border border-[var(--color-border)]"
          >
            <div class="flex items-center gap-3">
              <n-icon
                :component="NotificationsOutline"
                size="24"
                class="text-[var(--color-brand-primary)]"
              />
              <div>
                <div class="text-[var(--color-text-primary)] font-medium">
                  {{ t("settings.priceAlerts") }}
                </div>
                <div class="text-xs text-[var(--color-text-secondary)]">
                  {{ t("settings.priceAlertsDesc") }}
                </div>
              </div>
            </div>
            <n-switch :default-value="true" />
          </div>

          <div
            class="flex items-center justify-between bg-[var(--color-bg-sidebar)] p-4 rounded-xl border border-[var(--color-border)]"
          >
            <div class="flex items-center gap-3">
              <n-icon
                :component="NewspaperOutline"
                size="24"
                class="text-blue-400"
              />
              <div>
                <div class="text-[var(--color-text-primary)] font-medium">
                  {{ t("settings.marketNews") }}
                </div>
                <div class="text-xs text-[var(--color-text-secondary)]">
                  {{ t("settings.marketNewsDesc") }}
                </div>
              </div>
            </div>
            <n-switch :default-value="false" />
          </div>

          <div
            class="flex items-center justify-between bg-[var(--color-bg-sidebar)] p-4 rounded-xl border border-[var(--color-border)]"
          >
            <div class="flex items-center gap-3">
              <n-icon
                :component="TrophyOutline"
                size="24"
                class="text-yellow-500"
              />
              <div>
                <div class="text-[var(--color-text-primary)] font-medium">
                  {{ t("settings.leaderboardUpdates") }}
                </div>
                <div class="text-xs text-[var(--color-text-secondary)]">
                  {{ t("settings.leaderboardUpdatesDesc") }}
                </div>
              </div>
            </div>
            <n-switch :default-value="true" />
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <div class="flex justify-end gap-4">
      <n-button size="large">{{ t("settings.resetDefaults") }}</n-button>
      <n-button type="primary" size="large" @click="saveSettings">{{
        t("settings.saveChanges")
      }}</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  NTabs,
  NTabPane,
  NIcon,
  NDivider,
  NSelect,
  NFormItem,
  NSwitch,
  NInputNumber,
  NButton,
  useMessage,
} from "naive-ui";
import {
  ColorPaletteOutline,
  CheckmarkCircle,
  GlobeOutline,
  TrendingUpOutline,
  NotificationsOutline,
  NewspaperOutline,
  TrophyOutline,
} from "@vicons/ionicons5";
import { useTheme } from "../composables/useTheme";
import { useLanguage } from "../composables/useLanguage";

const message = useMessage();
const { themeMode, setTheme, candleColorMode, setCandleColorMode } = useTheme();
const { currentLanguage, setLanguage, languageOptions, t } = useLanguage();

const candleOptions = computed(() => [
  { label: t("settings.candleGreenRed"), value: "standard" },
  { label: t("settings.candleRedGreen"), value: "chinese" },
]);

// General

// Trading
const oneClickTrading = ref(false);
const showExecutions = ref(true);
const defaultOrderSize = ref(100);

function saveSettings() {
  message.loading("Saving settings...");
  setTimeout(() => {
    message.success("Settings saved successfully");
  }, 800);
}
</script>
