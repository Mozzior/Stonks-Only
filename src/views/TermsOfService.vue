<template>
  <div class="h-screen overflow-y-auto bg-[var(--color-bg-body)] flex flex-col">
    <!-- Header -->
    <header class="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-between px-6 sticky top-0 z-50 no-print">
      <div class="text-xl font-bold text-[var(--color-brand-primary)]">STONKS ONLY</div>
      <div class="flex gap-4">
        <n-button secondary @click="handleDownload">
          <template #icon><n-icon :component="CloudDownloadOutline" /></template>
          {{ t('auth.termsOfService.downloadPdf') }}
        </n-button>
        <n-button ghost @click="router.push('/')">
          <template #icon><n-icon :component="CloseOutline" /></template>
        </n-button>
      </div>
    </header>

    <main class="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">{{ t('auth.termsOfService.title') }}</h1>
        <p class="text-[var(--color-text-secondary)]">
          {{ t('auth.privacyPolicy.lastUpdated', { date: '2024-03-15' }) }}
        </p>
      </div>

      <n-collapse :default-expanded-names="['1', '2', '3']" arrow-placement="right">
        <n-collapse-item :title="`1. ${t('auth.termsOfService.sections.acceptance')}`" name="1">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.acceptance') }}
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`2. ${t('auth.termsOfService.sections.account')}`" name="2">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            <p class="mb-2">{{ t('auth.termsOfService.content.account.p1') }}</p>
            <p>{{ t('auth.termsOfService.content.account.p2') }}</p>
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`3. ${t('auth.termsOfService.sections.conduct')}`" name="3">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            <p>{{ t('auth.termsOfService.content.conduct.intro') }}</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>{{ t('auth.termsOfService.content.conduct.items.unlawful') }}</li>
              <li>{{ t('auth.termsOfService.content.conduct.items.impersonate') }}</li>
              <li>{{ t('auth.termsOfService.content.conduct.items.forge') }}</li>
            </ul>
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`4. ${t('auth.termsOfService.sections.intellectual')}`" name="4">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.intellectual') }}
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`5. ${t('auth.termsOfService.sections.termination')}`" name="5">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.termination') }}
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`6. ${t('auth.termsOfService.sections.liability')}`" name="6">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.liability') }}
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`7. ${t('auth.termsOfService.sections.governing')}`" name="7">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.governing') }}
          </div>
        </n-collapse-item>

        <n-collapse-item :title="`8. ${t('auth.termsOfService.sections.changes')}`" name="8">
          <div class="text-[var(--color-text-secondary)] leading-relaxed p-4 bg-[var(--color-bg-card)] rounded-lg">
            {{ t('auth.termsOfService.content.changes') }}
          </div>
        </n-collapse-item>
      </n-collapse>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  NButton, NIcon, NCollapse, NCollapseItem, useMessage 
} from 'naive-ui'
import { 
  CloudDownloadOutline, 
  CloseOutline 
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()

function handleDownload() {
  // Simulate PDF generation/download
  message.loading('Generating PDF...', { duration: 1500 })
  setTimeout(() => {
    message.success('Download started')
    // In a real app, this would trigger a file download
    const link = document.createElement('a')
    link.href = '#'
    link.download = 'Stonks_Only_Terms_of_Service.pdf'
    link.click()
  }, 1500)
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none;
  }
}
</style>