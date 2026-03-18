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
        <n-statistic :label="t('review.kpi.winRate')" :value="winRate" :precision="1">
          <template #suffix>%</template>
        </n-statistic>
        <n-progress type="line" :percentage="winRate" :height="4" :color="'var(--color-brand-primary)'" class="mt-2" :show-indicator="false" />
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ t('review.kpi.basedOnCompleted') }}</div>
      </n-card>
      
      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.totalPL')" :value="Math.abs(totalPnl)" :precision="2">
          <template #prefix>
             <span :class="totalPnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'">{{ totalPnl >= 0 ? '+' : '-' }}$</span>
          </template>
        </n-statistic>
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ t('review.kpi.allTimePL') }}</div>
      </n-card>

      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.avgReturn')" :value="avgReturn" :precision="2">
          <template #suffix>%</template>
        </n-statistic>
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ t('review.kpi.perSessionAvg') }}</div>
      </n-card>

      <n-card :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <n-statistic :label="t('review.kpi.totalSessions')" :value="totalSessions" />
        <div class="text-xs text-[var(--color-text-secondary)] mt-2">{{ completedSessions }} {{ t('review.kpi.completed') }}</div>
      </n-card>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <n-card :title="t('review.charts.performanceCurve')" :bordered="false" class="lg:col-span-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] h-96">
        <div class="w-full h-full bg-gradient-to-t from-[var(--color-brand-primary)]/5 to-transparent rounded-lg flex items-end relative overflow-hidden">
          <!-- Placeholder for Chart - In a real app, use a charting lib -->
          <div class="absolute inset-0 flex items-center justify-center text-[var(--color-text-secondary)]">
             <span v-if="sessions.length > 0">Chart Visualization Placeholder</span>
             <span v-else>No data available</span>
          </div>
        </div>
      </n-card>

      <n-card :title="t('review.charts.sessionDistribution')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
        <div class="space-y-6">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-[var(--color-text-secondary)]">{{ t('review.charts.profitableSessions') }}</span>
              <span class="text-[var(--color-text-primary)]">{{ profitableSessionsCount }} ({{ winRate }}%)</span>
            </div>
            <n-progress type="line" :percentage="winRate" :height="8" color="#10B981" :show-indicator="false" />
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-[var(--color-text-secondary)]">{{ t('review.charts.losingSessions') }}</span>
              <span class="text-[var(--color-text-primary)]">{{ losingSessionsCount }} ({{ (100 - winRate).toFixed(1) }}%)</span>
            </div>
            <n-progress type="line" :percentage="100 - winRate" :height="8" color="#EF4444" :show-indicator="false" />
          </div>
        </div>
      </n-card>
    </div>

    <!-- Session History -->
    <n-card :title="t('review.sessionHistory')" :bordered="false" class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
      <n-data-table
        :columns="columns"
        :data="sessionTableData"
        :bordered="false"
        :pagination="{ pageSize: 10 }"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  NCard, NStatistic, NProgress, NButton, NIcon, NSpace, NSelect, NDataTable, NTag 
} from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
import { useAuth } from "../composables/useAuth";
import { listSessions } from "../services/api/trainingApi";

const { t } = useI18n()
const { user } = useAuth();
const sessions = ref<any[]>([]);

const timeRange = ref('30d')
const timeRangeOptions = computed(() => [
  { label: t('review.journal.filter.last7Days'), value: '7d' },
  { label: t('review.journal.filter.last30Days'), value: '30d' },
  { label: t('review.journal.filter.thisYear'), value: 'ytd' },
  { label: t('review.journal.filter.allTime'), value: 'all' }
])

onMounted(async () => {
  if (!user.value) return;
  const { data } = await listSessions(100); 
  if (data) {
      sessions.value = data.documents;
  }
});

// KPIs
const totalSessions = computed(() => sessions.value.length);
const completedSessions = computed(() => sessions.value.filter(s => s.status === 'completed').length);
const profitableSessionsCount = computed(() => sessions.value.filter(s => s.status === 'completed' && Number(s.realized_pnl) > 0).length);
const losingSessionsCount = computed(() => completedSessions.value - profitableSessionsCount.value);

const winRate = computed(() => {
    if (completedSessions.value === 0) return 0;
    return Number(((profitableSessionsCount.value / completedSessions.value) * 100).toFixed(1));
});

const totalPnl = computed(() => 
    sessions.value
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + Number(s.realized_pnl || 0), 0)
);

const avgReturn = computed(() => {
    if (completedSessions.value === 0) return 0;
    const totalRet = sessions.value
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + Number(s.return_pct || 0), 0);
    return totalRet / completedSessions.value;
});

const sessionTableData = computed(() => {
    return sessions.value.map(s => ({
        date: new Date(s.$createdAt).toLocaleDateString(),
        symbol: s.symbol,
        period: s.period,
        pnl: Number(s.realized_pnl || 0),
        roi: Number(s.return_pct || 0),
        status: s.status,
        id: s.$id
    }));
});

const columns = computed(() => [
  { title: t('review.journal.date'), key: 'date', width: 120 },
  { 
    title: t('review.journal.symbol'), 
    key: 'symbol',
    render(row: any) {
      return h('span', { class: 'font-bold text-[var(--color-text-primary)]' }, row.symbol)
    }
  },
  { title: t('review.journal.period'), key: 'period' },
  { 
    title: t('review.journal.pl'), 
    key: 'pnl',
    render(row: any) {
      const isWin = row.pnl > 0
      return h('span', { 
        class: isWin ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold' 
      }, `${isWin ? '+' : ''}$${row.pnl.toFixed(2)}`)
    }
  },
  { 
    title: t('review.journal.roi'), 
    key: 'roi',
    render(row: any) {
      const isWin = row.roi > 0
      return h('span', { 
        class: isWin ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]' 
      }, `${isWin ? '+' : ''}${row.roi.toFixed(2)}%`)
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
</script>
