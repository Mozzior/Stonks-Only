<template>
  <div class="h-screen overflow-y-auto bg-[var(--color-bg-body)] flex flex-col">
    <!-- Header -->
    <header class="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-between px-6 sticky top-0 z-50">
      <div class="text-xl font-bold text-[var(--color-brand-primary)]">STONKS ONLY</div>
      <n-button ghost @click="router.push('/')">
        <template #icon><n-icon :component="CloseOutline" /></template>
      </n-button>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12">
      <div class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
        <div class="flex flex-col items-center text-center mb-8">
          <n-icon size="64" :component="WarningOutline" class="text-yellow-500 mb-4" />
          <h1 class="text-3xl font-bold mb-2">{{ t('auth.dataDisclaimer.title') }}</h1>
          <p class="text-[var(--color-text-secondary)]">{{ t('auth.dataDisclaimer.content.intro') }}</p>
        </div>

        <div class="space-y-6">
          <div class="p-4 bg-[var(--color-bg-sidebar)] rounded-xl">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
              <n-icon :component="AnalyticsOutline" class="text-blue-500" />
              {{ t('auth.dataDisclaimer.content.accuracy') }}
            </h3>
            <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {{ t('auth.dataDisclaimer.content.accuracyDesc') }}
            </p>
          </div>

          <div class="p-4 bg-[var(--color-bg-sidebar)] rounded-xl">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
              <n-icon :component="ShieldOutline" class="text-red-500" />
              {{ t('auth.dataDisclaimer.content.liability') }}
            </h3>
            <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {{ t('auth.dataDisclaimer.content.liabilityDesc') }}
            </p>
          </div>

          <div class="p-4 bg-[var(--color-bg-sidebar)] rounded-xl">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
              <n-icon :component="SchoolOutline" class="text-green-500" />
              {{ t('auth.dataDisclaimer.content.educational') }}
            </h3>
            <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {{ t('auth.dataDisclaimer.content.educationalDesc') }}
            </p>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-[var(--color-border)] text-center">
          <n-button type="primary" @click="router.back()">
            {{ t('common.confirm') }}
          </n-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon } from 'naive-ui'
import { 
  CloseOutline, WarningOutline, AnalyticsOutline, 
  ShieldOutline, SchoolOutline 
} from '@vicons/ionicons5'

const router = useRouter()
const { t } = useI18n()
</script>