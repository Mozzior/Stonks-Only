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
        <h1 class="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">Stocks Only <span class="text-[var(--color-brand-primary)]">Pro</span></h1>
        <p class="text-[var(--color-text-secondary)]">Version 1.0.0 (Beta)</p>
      </div>

      <div class="flex gap-4">
        <n-button type="primary" secondary tag="a" href="https://github.com/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoGithub" /></template>
          GitHub
        </n-button>
        <n-button secondary tag="a" href="https://twitter.com/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoTwitter" /></template>
          Twitter
        </n-button>
        <n-button secondary tag="a" href="https://discord.gg/stonks-only" target="_blank">
          <template #icon><n-icon :component="LogoDiscord" /></template>
          Discord
        </n-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Changelog -->
      <n-card title="What's New" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <n-timeline>
          <n-timeline-item type="success" title="Version 1.0.0 (Beta)" content="Initial release with Training Mode and K-Line Charts." time="2023-10-24" />
          <n-timeline-item type="info" title="Version 0.9.0" content="Added user authentication and leaderboards." time="2023-10-10" />
          <n-timeline-item title="Version 0.5.0" content="Core engine development and UI framework setup." time="2023-09-15" />
        </n-timeline>
      </n-card>

      <!-- Team & Credits -->
      <div class="space-y-6">
        <n-card title="Core Team" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <n-list>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar round size="small" src="https://i.pravatar.cc/150?u=dev1" />
                <div>
                  <div class="font-bold text-[var(--color-text-primary)]">Alex Chen</div>
                  <div class="text-[10px] text-[var(--color-text-secondary)]">Lead Developer</div>
                </div>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar round size="small" src="https://i.pravatar.cc/150?u=dev2" />
                <div>
                  <div class="font-bold text-[var(--color-text-primary)]">Sarah Wu</div>
                  <div class="text-[10px] text-[var(--color-text-secondary)]">Product Designer</div>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>

        <n-card title="Legal" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <div class="flex flex-col gap-2">
            <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start">
              <template #icon><n-icon :component="DocumentTextOutline" /></template>
              Terms of Service
            </n-button>
            <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start">
              <template #icon><n-icon :component="ShieldCheckmarkOutline" /></template>
              Privacy Policy
            </n-button>
            <n-button text class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] justify-start">
              <template #icon><n-icon :component="InformationCircleOutline" /></template>
              Data Disclaimer
            </n-button>
          </div>
        </n-card>
      </div>
    </div>
    
    <div class="text-center text-[var(--color-text-secondary)] text-xs py-8">
      &copy; 2023 Stocks Only Inc. All rights reserved. <br/>
      Made with <span class="text-red-500">♥</span> by traders, for traders.
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  NButton, NIcon, NCard, NTimeline, NTimelineItem, NList, NListItem, NAvatar 
} from 'naive-ui'
import { 
  LogoGithub, LogoTwitter, LogoDiscord, DocumentTextOutline, 
  ShieldCheckmarkOutline, InformationCircleOutline 
} from '@vicons/ionicons5'
</script>
