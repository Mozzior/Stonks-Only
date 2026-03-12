<template>
  <div class="w-full max-w-7xl mx-auto space-y-6">
    <!-- Header / Profile Cover -->
    <div class="relative bg-gradient-to-r from-[var(--color-bg-sidebar)] to-[var(--color-bg-card)] rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] h-64">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <!-- User Info Overlay -->
      <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[var(--color-bg-sidebar)] to-transparent flex items-end gap-6">
        <div class="relative group">
          <n-avatar round :size="120" src="https://i.pravatar.cc/300" class="border-4 border-[var(--color-bg-body)] shadow-2xl" />
          <div class="absolute bottom-2 right-2 bg-[var(--color-brand-primary)] p-2 rounded-full cursor-pointer hover:bg-[var(--color-brand-primary)]/80 transition-colors shadow-lg">
            <n-icon size="18" :component="CameraOutline" class="text-[var(--color-bg-body)]" />
          </div>
        </div>
        
        <div class="flex-1 mb-2">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Trader Pro</h1>
            <n-tag type="warning" round size="small" :bordered="false" class="font-bold">
              <template #icon><n-icon :component="RibbonOutline" /></template>
              ELITE MEMBER
            </n-tag>
          </div>
          <p class="text-[var(--color-text-secondary)] mt-1 flex items-center gap-2">
            <n-icon :component="MailOutline" /> trader@stonks-only.com
            <span class="text-[var(--color-border)]">|</span>
            <n-icon :component="CalendarOutline" /> Joined Oct 2023
          </p>
        </div>
        
        <div class="flex gap-3 mb-2">
          <n-button type="primary" secondary>
            <template #icon><n-icon :component="CreateOutline" /></template>
            Edit Profile
          </n-button>
          <n-button secondary>
            <template #icon><n-icon :component="ShareSocialOutline" /></template>
            Share Stats
          </n-button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Stats & Radar -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Trading Radar -->
        <n-card title="Trading Style" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] h-80 overflow-hidden">
          <div class="h-full flex items-center justify-center relative p-4">
             <!-- Radar Chart Placeholder (SVG) -->
             <svg viewBox="0 0 200 200" class="w-full h-full max-w-[200px] max-h-[200px]">
               <!-- Grid -->
               <polygon points="100,20 180,65 180,155 100,200 20,155 20,65" fill="none" stroke="var(--color-border)" stroke-width="1" />
               <polygon points="100,50 160,80 160,140 100,170 40,140 40,80" fill="none" stroke="var(--color-border)" stroke-width="1" />
               <!-- Data Shape -->
               <polygon points="100,30 170,70 150,145 100,180 50,130 30,75" fill="rgba(0, 210, 180, 0.2)" stroke="var(--color-brand-primary)" stroke-width="2" />
               <!-- Labels -->
               <text x="100" y="15" text-anchor="middle" fill="var(--color-text-secondary)" font-size="10" dy="-5">Discipline</text>
               <text x="190" y="60" text-anchor="start" fill="var(--color-text-secondary)" font-size="10" dx="5">Win Rate</text>
               <text x="190" y="160" text-anchor="start" fill="var(--color-text-secondary)" font-size="10" dx="5">Risk Mgmt</text>
               <text x="100" y="210" text-anchor="middle" fill="var(--color-text-secondary)" font-size="10" dy="10">Consistency</text>
               <text x="10" y="160" text-anchor="end" fill="var(--color-text-secondary)" font-size="10" dx="-5">Profit Factor</text>
               <text x="10" y="60" text-anchor="end" fill="var(--color-text-secondary)" font-size="10" dx="-5">Activity</text>
             </svg>
          </div>
        </n-card>

        <!-- Detailed Stats List -->
        <n-card title="Key Statistics" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <n-list hoverable clickable>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">Best Win Streak</span>
                <span class="text-[var(--color-text-primary)] font-bold">12 Trades</span>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">Avg Hold Time</span>
                <span class="text-[var(--color-text-primary)] font-bold">4h 25m</span>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">Largest Win</span>
                <span class="text-[var(--color-success)] font-bold">+$4,250.00</span>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">Largest Loss</span>
                <span class="text-[var(--color-error)] font-bold">-$1,120.00</span>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>

      <!-- Right Column: Recent Activity & Badges -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Badges Collection -->
        <n-card title="Earned Badges" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <template #header-extra>
            <n-button text size="small" type="primary">View All</n-button>
          </template>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer">
              <div class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <n-icon size="24" :component="TrophyOutline" class="text-yellow-500" />
              </div>
              <span class="text-xs font-bold text-[var(--color-text-primary)] text-center">First 100k</span>
              <span class="text-[10px] text-[var(--color-text-secondary)]">Oct 24, 2023</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer">
              <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <n-icon size="24" :component="TrendingUpOutline" class="text-blue-500" />
              </div>
              <span class="text-xs font-bold text-[var(--color-text-primary)] text-center">Profit Streak</span>
              <span class="text-[10px] text-[var(--color-text-secondary)]">Nov 02, 2023</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer">
              <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <n-icon size="24" :component="SchoolOutline" class="text-purple-500" />
              </div>
              <span class="text-xs font-bold text-[var(--color-text-primary)] text-center">Scholar</span>
              <span class="text-[10px] text-[var(--color-text-secondary)]">Dec 15, 2023</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <div class="w-12 h-12 rounded-full bg-[var(--color-border)]/20 flex items-center justify-center mb-2">
                <n-icon size="24" :component="LockClosedOutline" class="text-[var(--color-text-secondary)]" />
              </div>
              <span class="text-xs font-bold text-[var(--color-text-secondary)] text-center">Millionaire</span>
              <span class="text-[10px] text-[var(--color-text-secondary)]">Locked</span>
            </div>
          </div>
        </n-card>

        <!-- Account Security / Settings Preview -->
        <n-card title="Account Security" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
          <n-list>
            <n-list-item>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <n-icon size="20" :component="ShieldCheckmarkOutline" class="text-[var(--color-success)]" />
                  <div>
                    <div class="text-[var(--color-text-primary)] font-medium">Two-Factor Authentication</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Enabled via Authenticator App</div>
                  </div>
                </div>
                <n-button size="small" secondary>Manage</n-button>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <n-icon size="20" :component="KeyOutline" class="text-blue-400" />
                  <div>
                    <div class="text-[var(--color-text-primary)] font-medium">Password</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Last changed 3 months ago</div>
                  </div>
                </div>
                <n-button size="small" secondary>Update</n-button>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  NCard, NAvatar, NButton, NIcon, NTag, NList, NListItem, NDivider 
} from 'naive-ui'
import { 
  CameraOutline, MailOutline, CalendarOutline, CreateOutline, ShareSocialOutline,
  RibbonOutline, TrophyOutline, TrendingUpOutline, SchoolOutline, LockClosedOutline,
  ShieldCheckmarkOutline, KeyOutline
} from '@vicons/ionicons5'
</script>
