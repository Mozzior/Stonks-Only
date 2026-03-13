<template>
  <div class="w-full max-w-7xl mx-auto space-y-8">
    <!-- Hero Section -->
    <div class="flex flex-col items-center justify-center text-center space-y-6 py-12 bg-gradient-to-b from-[var(--color-bg-sidebar)] to-transparent rounded-2xl border border-[var(--color-border)]">
      <div class="relative group">
        <div class="absolute inset-0 bg-[var(--color-brand-primary)] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
        <div class="relative w-24 h-24 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center border border-[var(--color-border)] shadow-2xl">
          <span class="text-4xl font-black text-[var(--color-brand-primary)]">S</span>
        </div>
      </div>
      
      <div>
        <h1 class="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">{{ t('about.hero.title') }}</h1>
        <p class="text-[var(--color-text-secondary)]">{{ t('about.hero.version', { version: '1.0.0' }) }}</p>
      </div>

      <div class="flex gap-4">
        <n-button type="primary" secondary tag="a" href="https://github.com/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoGithub" /></template>
          {{ t('about.hero.links.github') }}
        </n-button>
        <n-button secondary tag="a" href="https://twitter.com/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoTwitter" /></template>
          {{ t('about.hero.links.twitter') }}
        </n-button>
        <n-button secondary tag="a" href="https://discord.gg/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoDiscord" /></template>
          {{ t('about.hero.links.discord') }}
        </n-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Changelog -->
      <n-card :title="t('about.whatsNew.title')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <n-timeline>
          <n-timeline-item type="success" :title="t('about.whatsNew.v1.version')" :content="t('about.whatsNew.v1.desc')" time="2023-10-24" />
          <n-timeline-item type="info" :title="t('about.whatsNew.v09.version')" :content="t('about.whatsNew.v09.desc')" time="2023-10-10" />
          <n-timeline-item :title="t('about.whatsNew.v05.version')" :content="t('about.whatsNew.v05.desc')" time="2023-09-15" />
        </n-timeline>
      </n-card>

      <!-- Team & Credits -->
      <div class="space-y-6">
        <n-card :title="t('about.team.title')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <n-list>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar round size="small" src="https://i.pravatar.cc/150?u=dev1" />
                <div>
                  <div class="font-bold text-[var(--color-text-primary)]">{{ t('about.team.alex.name') }}</div>
                  <div class="text-[10px] text-[var(--color-text-secondary)]">{{ t('about.team.alex.role') }}</div>
                </div>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar round size="small" src="https://i.pravatar.cc/150?u=dev2" />
                <div>
                  <div class="font-bold text-[var(--color-text-primary)]">{{ t('about.team.sarah.name') }}</div>
                  <div class="text-[10px] text-[var(--color-text-secondary)]">{{ t('about.team.sarah.role') }}</div>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>

        <n-card :title="t('about.legal.title')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <div class="flex flex-col gap-2">
            <router-link to="/terms-of-service">
              <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start w-full">
                <template #icon><n-icon :component="DocumentTextOutline" /></template>
                {{ t('about.legal.terms') }}
              </n-button>
            </router-link>
            <router-link to="/privacy-policy">
              <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start w-full">
                <template #icon><n-icon :component="ShieldCheckmarkOutline" /></template>
                {{ t('about.legal.privacy') }}
              </n-button>
            </router-link>
            <router-link to="/data-disclaimer">
              <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start w-full">
                <template #icon><n-icon :component="InformationCircleOutline" /></template>
                {{ t('about.legal.disclaimer') }}
              </n-button>
            </router-link>
          </div>
        </n-card>
      </div>
    </div>
    
    <div class="text-center text-[var(--color-text-secondary)] text-xs py-8">
      {{ t('about.footer.copyright') }} <br/>
      {{ t('about.footer.madeWith').split('♥')[0] }}<span class="text-red-500">♥</span>{{ t('about.footer.madeWith').split('♥')[1] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { 
  NButton, NIcon, NCard, NTimeline, NTimelineItem, NList, NListItem, NAvatar 
} from 'naive-ui'
import { 
  LogoGithub, LogoTwitter, LogoDiscord, DocumentTextOutline, 
  ShieldCheckmarkOutline, InformationCircleOutline 
} from '@vicons/ionicons5'

const { t } = useI18n()
</script>
