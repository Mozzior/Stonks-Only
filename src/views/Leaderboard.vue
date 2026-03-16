<template>
  <div class="space-y-6">
    <!-- Top 3 Podium -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
      <!-- 2nd Place -->
      <div class="order-2 md:order-1">
        <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] text-center relative overflow-hidden h-64 flex flex-col justify-center transform hover:-translate-y-2 transition-transform duration-300">
          <div class="absolute top-0 left-0 w-full h-1 bg-[var(--color-text-secondary)]"></div>
          <n-avatar round size="large" src="https://i.pravatar.cc/150?u=wolf" class="mx-auto mb-4 border-4 border-[var(--color-border)] shadow-xl" />
          <div class="text-lg font-bold text-[var(--color-text-primary)]">wolf</div>
          <div class="text-[var(--color-brand-primary)] font-black text-xl">+95.4%</div>
          <div class="text-xs text-[var(--color-text-secondary)] uppercase mt-2">{{ t('leaderboard.top3.rank2') }}</div>
        </n-card>
      </div>

      <!-- 1st Place -->
      <div class="order-1 md:order-2">
        <n-card :bordered="false" class="bg-gradient-to-b from-[var(--color-bg-sidebar)] to-[var(--color-bg-card)] rounded-2xl border-2 border-yellow-500/50 text-center relative overflow-hidden h-80 flex flex-col justify-center scale-105 shadow-2xl shadow-yellow-500/10 transform hover:-translate-y-2 transition-transform duration-300">
          <div class="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
          <div class="absolute -top-2 -right-2 rotate-12">
            <n-icon size="64" :component="RibbonOutline" class="text-yellow-500 opacity-20" />
          </div>
          <n-avatar round :size="80" src="https://i.pravatar.cc/150?u=trader01" class="mx-auto mb-4 border-4 border-yellow-500 shadow-xl" />
          <div class="text-xl font-black text-[var(--color-text-primary)]">trader01</div>
          <div class="text-yellow-500 font-black text-3xl">+120.2%</div>
          <div class="text-xs text-yellow-500/70 uppercase font-bold mt-2">{{ t('leaderboard.top3.champion') }}</div>
        </n-card>
      </div>

      <!-- 3rd Place -->
      <div class="order-3">
        <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] text-center relative overflow-hidden h-56 flex flex-col justify-center transform hover:-translate-y-2 transition-transform duration-300">
          <div class="absolute top-0 left-0 w-full h-1 bg-amber-700/50"></div>
          <n-avatar round size="medium" src="https://i.pravatar.cc/150?u=eagle" class="mx-auto mb-4 border-4 border-[var(--color-border)] shadow-xl" />
          <div class="text-lg font-bold text-[var(--color-text-primary)]">eagle</div>
          <div class="text-[var(--color-brand-primary)] font-black text-xl">+88.7%</div>
          <div class="text-xs text-[var(--color-text-secondary)] uppercase mt-2">{{ t('leaderboard.top3.rank3') }}</div>
        </n-card>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="flex items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)] mt-8">
      <n-radio-group v-model:value="timeframe" size="medium">
        <n-radio-button value="daily">{{ t('leaderboard.filters.daily') }}</n-radio-button>
        <n-radio-button value="weekly">{{ t('leaderboard.filters.weekly') }}</n-radio-button>
        <n-radio-button value="monthly">{{ t('leaderboard.filters.monthly') }}</n-radio-button>
        <n-radio-button value="all">{{ t('leaderboard.filters.allTime') }}</n-radio-button>
      </n-radio-group>
      
      <div class="flex gap-4">
        <n-input v-model:value="searchQuery" :placeholder="t('leaderboard.searchPlaceholder')" size="medium" class="w-64">
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <n-empty v-if="filteredLeaderboard.length === 0" :description="t('leaderboard.noTradersFound')" class="py-12" />
      <n-data-table
        v-else
        :columns="columns"
        :data="filteredLeaderboard"
        :bordered="false"
        :pagination="{ pageSize: 10 }"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  NCard, NAvatar, NIcon, NRadioGroup, NRadioButton, NInput, NDataTable, NEmpty
} from 'naive-ui'
import { SearchOutline, RibbonOutline, TrophyOutline, MedalOutline } from '@vicons/ionicons5'

const { t } = useI18n()

const timeframe = ref('weekly')
const searchQuery = ref('')

const columns = computed(() => [
  { 
    title: t('leaderboard.rank'), 
    key: 'rank',
    width: 80,
    render(row: any) {
      if (row.rank === 1) return h(NIcon, { component: TrophyOutline, class: 'text-yellow-500', size: 24 })
      if (row.rank === 2) return h(NIcon, { component: MedalOutline, class: 'text-gray-300', size: 24 })
      if (row.rank === 3) return h(NIcon, { component: MedalOutline, class: 'text-amber-700', size: 24 })
      return h('span', { class: 'font-black text-[var(--color-text-secondary)]' }, `#${row.rank}`)
    }
  },
  {
    title: t('leaderboard.trader'),
    key: 'user',
    render(row: any) {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(NAvatar, { round: true, size: 'small', src: row.avatar }),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'font-bold text-[var(--color-text-primary)]' }, row.user),
          h('span', { class: 'text-[10px] text-[var(--color-text-secondary)]' }, `${t('leaderboard.level')} ${row.level}`)
        ])
      ])
    }
  },
  {
    title: t('leaderboard.winRate'),
    key: 'winRate',
    render(row: any) {
      return h('span', { class: 'text-[var(--color-text-secondary)]' }, `${row.winRate}%`)
    }
  },
  {
    title: t('leaderboard.profit'),
    key: 'pl',
    render(row: any) {
      return h('span', { class: 'text-[var(--color-success)] font-bold' }, `+${row.pl}%`)
    }
  },
  {
    title: t('leaderboard.trades'),
    key: 'trades',
    render(row: any) {
      return h('span', { class: 'text-[var(--color-text-secondary)]' }, row.trades)
    }
  }
])

const leaderboardData = [
  { rank: 4, user: 'BullRunner', level: 42, winRate: 72, trades: 450, pl: 75.2 },
  { rank: 5, user: 'CryptoKing', level: 38, winRate: 68, trades: 1200, pl: 68.5 },
  { rank: 6, user: 'DayTraderX', level: 35, winRate: 65, trades: 890, pl: 62.1 },
  { rank: 7, user: 'AlphaOne', level: 31, winRate: 61, trades: 340, pl: 58.4 },
  { rank: 8, user: 'MarketMage', level: 29, winRate: 59, trades: 560, pl: 54.9 },
  { rank: 9, user: 'StonkLord', level: 27, winRate: 58, trades: 210, pl: 51.2 },
  { rank: 10, user: 'GreenCandle', level: 25, winRate: 56, trades: 670, pl: 48.7 },
]

const filteredLeaderboard = computed(() => {
  if (!searchQuery.value) return leaderboardData
  return leaderboardData.filter(item => 
    item.user.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
