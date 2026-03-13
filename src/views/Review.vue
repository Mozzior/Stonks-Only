<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{{ t('review.title') }}</h1>
        <p class="text-[var(--color-text-secondary)] text-sm">{{ t('review.subtitle') }}</p>
      </div>
      <n-space>
        <n-select v-model:value="timeRange" :options="timeRangeOptions" size="medium" class="w-40" />
        <n-button type="primary" ghost>
          <template #icon><n-icon :component="DownloadOutline" /></template>
          {{ t('review.exportCsv') }}
        </n-button>
      </n-space>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.winRate')" :value="68.4">
          <template #suffix>%</template>
        </n-statistic>
        <n-progress type="line" :percentage="68.4" :height="4" :color="'var(--color-brand-primary)'" class="mt-2" :show-indicator="false" />
      </n-card>
      
      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.profitFactor')" :value="2.15" :precision="2">
          <template #prefix>x</template>
        </n-statistic>
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ t('review.kpi.grossProfitLoss') }}</div>
      </n-card>

      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.avgWin')" :value="450.20" :precision="2">
          <template #prefix>$</template>
        </n-statistic>
        <div class="text-xs text-[var(--color-success)] mt-2">{{ t('review.kpi.avgLoss', { amount: '$210.50' }) }}</div>
      </n-card>

      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.totalTrades')" :value="142" />
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ t('review.kpi.winsLosses', { wins: 97, losses: 45 }) }}</div>
      </n-card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <n-card :title="t('review.charts.equityCurve')" :bordered="false" class="lg:col-span-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] h-96">
        <div class="w-full h-full bg-gradient-to-t from-[var(--color-brand-primary)]/5 to-transparent rounded-lg flex items-end relative overflow-hidden">
          <!-- Mock Chart Line -->
          <svg class="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0,300 C100,280 200,320 300,250 C400,200 500,220 600,150 C700,100 800,120 900,50 L900,384 L0,384 Z" fill="url(#gradReview)" opacity="0.2"></path>
            <path d="M0,300 C100,280 200,320 300,250 C400,200 500,220 600,150 C700,100 800,120 900,50" stroke="var(--color-brand-primary)" stroke-width="3" fill="none"></path>
            <defs>
              <linearGradient id="gradReview" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:var(--color-brand-primary);stop-opacity:1" />
                <stop offset="100%" style="stop-color:var(--color-brand-primary);stop-opacity:0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </n-card>

      <n-card :title="t('review.charts.tradeDistribution')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <div class="space-y-6">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-[var(--color-text-secondary)]">{{ t('review.charts.longTrades') }}</span>
              <span class="text-[var(--color-text-primary)]">85 (60%)</span>
            </div>
            <n-progress type="line" :percentage="60" :height="8" color="#10B981" :show-indicator="false" />
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-[var(--color-text-secondary)]">{{ t('review.charts.shortTrades') }}</span>
              <span class="text-[var(--color-text-primary)]">57 (40%)</span>
            </div>
            <n-progress type="line" :percentage="40" :height="8" color="#EF4444" :show-indicator="false" />
          </div>
          <n-divider />
          <div>
            <div class="text-xs text-[var(--color-text-secondary)] mb-2">{{ t('review.charts.bestTradingHours') }}</div>
            <div class="flex gap-1 h-24 items-end">
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[40%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[80%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[60%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[30%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[90%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
              <div class="flex-1 bg-[var(--color-border)] rounded-t-sm h-[50%] hover:bg-[var(--color-brand-primary)] transition-colors"></div>
            </div>
            <div class="flex justify-between text-[10px] text-[var(--color-text-secondary)] mt-1">
              <span>9am</span>
              <span>12pm</span>
              <span>4pm</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Trade Journal -->
    <n-card :title="t('review.journal.title')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
      <n-data-table
        :columns="columns"
        :data="trades"
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
  NCard, NStatistic, NProgress, NButton, NIcon, NSpace, NSelect, NDivider, NDataTable, NTag 
} from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'

const { t } = useI18n()

const timeRange = ref('30d')
const timeRangeOptions = computed(() => [
  { label: t('review.journal.filter.last7Days'), value: '7d' },
  { label: t('review.journal.filter.last30Days'), value: '30d' },
  { label: t('review.journal.filter.thisYear'), value: 'ytd' },
  { label: t('review.journal.filter.allTime'), value: 'all' }
])

const columns = computed(() => [
  { title: t('review.journal.date'), key: 'date', width: 120 },
  { 
    title: t('review.journal.symbol'), 
    key: 'symbol',
    render(row: any) {
      return h('span', { class: 'font-bold text-[var(--color-text-primary)]' }, row.symbol)
    }
  },
  { 
    title: t('review.journal.side'), 
    key: 'side',
    render(row: any) {
      return h(NTag, { 
        type: row.side === 'LONG' ? 'success' : 'error', 
        size: 'small', 
        bordered: false 
      }, { default: () => row.side })
    }
  },
  { title: t('review.journal.entry'), key: 'entry', render: (row: any) => `$${row.entry}` },
  { title: t('review.journal.exit'), key: 'exit', render: (row: any) => `$${row.exit}` },
  { title: t('review.journal.size'), key: 'size' },
  { 
    title: t('review.journal.pl'), 
    key: 'pl',
    render(row: any) {
      const isWin = row.pl > 0
      return h('span', { 
        class: isWin ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold' 
      }, `${isWin ? '+' : ''}$${row.pl}`)
    }
  },
  { 
    title: t('review.journal.status'), 
    key: 'status',
    render(row: any) {
      return h(NTag, { size: 'tiny', ghost: true }, { default: () => row.status })
    }
  }
])

const trades = [
  { date: '2023-10-24', symbol: 'NVDA', side: 'LONG', entry: 850.40, exit: 865.20, size: 200, pl: 2960.00, status: 'CLOSED' },
  { date: '2023-10-23', symbol: 'TSLA', side: 'SHORT', entry: 240.50, exit: 235.10, size: 500, pl: 2700.00, status: 'CLOSED' },
  { date: '2023-10-22', symbol: 'AAPL', side: 'LONG', entry: 175.20, exit: 174.10, size: 300, pl: -330.00, status: 'CLOSED' },
  { date: '2023-10-21', symbol: 'AMD', side: 'LONG', entry: 105.40, exit: 108.90, size: 400, pl: 1400.00, status: 'CLOSED' },
  { date: '2023-10-20', symbol: 'MSFT', side: 'SHORT', entry: 330.10, exit: 335.40, size: 150, pl: -795.00, status: 'CLOSED' },
]
</script>
