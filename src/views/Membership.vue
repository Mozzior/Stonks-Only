<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">Unlock Your Trading Potential</h1>
      <p class="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
        Level up your trading skills with our premium membership plans. Get access to advanced analytics, unlimited historical data, and exclusive training scenarios.
      </p>
    </div>

    <!-- Plans -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="plan in plans" :key="plan.name" 
        class="relative group"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-primary)] to-transparent opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
        <n-card :bordered="false" class="h-full bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors relative z-10">
          <div class="flex flex-col h-full">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-bold text-[var(--color-text-primary)]">{{ plan.name }}</h3>
                <p class="text-xs text-[var(--color-text-secondary)] mt-1 min-h-[32px]">{{ plan.description }}</p>
              </div>
              <n-tag v-if="plan.popular" type="primary" size="small" round>POPULAR</n-tag>
            </div>
            
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-3xl font-black text-[var(--color-text-primary)]">${{ plan.price }}</span>
              <span class="text-xs text-[var(--color-text-secondary)]">/month</span>
            </div>

            <n-button :type="plan.popular ? 'primary' : 'default'" block class="mb-6 font-bold">
              {{ plan.current ? 'Current Plan' : 'Upgrade Now' }}
            </n-button>

            <ul class="space-y-3 flex-1">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <n-icon :component="CheckmarkCircleOutline" class="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Achievements Section -->
    <div class="mt-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-[var(--color-text-primary)]">Your Achievements</h2>
        <n-progress type="line" :percentage="45" :indicator-placement="'inside'" :height="20" class="max-w-xs" processing>
          <span class="text-xs font-bold text-[var(--color-text-primary)]">Level 12: Advanced Trader</span>
        </n-progress>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <n-card v-for="achievement in achievements" :key="achievement.title" 
          :bordered="false" 
          class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]"
          :class="{ 'opacity-50 grayscale': !achievement.unlocked }"
        >
          <div class="flex flex-col items-center text-center gap-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-bg-sidebar)] border border-[var(--color-border)]">
              <n-icon size="24" :component="achievement.icon" :color="achievement.unlocked ? '#F59E0B' : '#64748B'" />
            </div>
            <div>
              <div class="font-bold text-[var(--color-text-primary)] text-sm">{{ achievement.title }}</div>
              <div class="text-[10px] text-[var(--color-text-secondary)]">{{ achievement.desc }}</div>
            </div>
            <n-tag v-if="achievement.unlocked" type="warning" size="tiny" round bordered>UNLOCKED</n-tag>
            <n-progress v-else type="line" :percentage="achievement.progress" :height="4" :show-indicator="false" />
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  NCard, NButton, NIcon, NTag, NProgress 
} from 'naive-ui'
import { 
  CheckmarkCircleOutline, TrophyOutline, RocketOutline, 
  WalletOutline, TrendingUpOutline 
} from '@vicons/ionicons5'

const plans = [
  {
    name: 'Rookie',
    price: '0',
    description: 'Perfect for beginners starting their journey.',
    current: true,
    popular: false,
    features: [
      'Basic market data (Daily/Weekly)',
      '100 simulated trades per day',
      'Standard charts',
      'Community leaderboard access'
    ]
  },
  {
    name: 'Pro Trader',
    price: '29',
    description: 'For serious traders who want to master the craft.',
    current: false,
    popular: true,
    features: [
      'Intraday data (1m, 5m, 15m)',
      'Unlimited simulated trades',
      'Advanced technical indicators',
      'Detailed performance analytics',
      'Priority support'
    ]
  },
  {
    name: 'Elite',
    price: '99',
    description: 'Professional grade tools for the ultimate edge.',
    current: false,
    popular: false,
    features: [
      'Tick-level historical data',
      'AI-powered trade analysis',
      'Custom strategy backtesting',
      '1-on-1 mentorship sessions',
      'Early access to new features'
    ]
  }
]

const achievements = [
  { 
    title: 'First Steps', 
    desc: 'Complete your first simulated trade', 
    icon: RocketOutline, 
    unlocked: true,
    progress: 100 
  },
  { 
    title: 'Profitable Week', 
    desc: 'End a week with positive P/L', 
    icon: TrendingUpOutline, 
    unlocked: true,
    progress: 100 
  },
  { 
    title: 'Big Spender', 
    desc: 'Execute a trade worth over $10k', 
    icon: WalletOutline, 
    unlocked: false,
    progress: 65 
  },
  { 
    title: 'Master Analyst', 
    desc: 'Maintain 60% win rate for 30 days', 
    icon: TrophyOutline, 
    unlocked: false,
    progress: 20 
  }
]
</script>
