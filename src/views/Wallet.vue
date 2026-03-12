<template>
  <div class="space-y-6">
    <!-- Balance Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
        <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] z-0"></div>
        <div class="absolute top-0 right-0 p-8 opacity-10 z-0">
          <n-icon size="120" :component="WalletOutline" />
        </div>
        
        <div class="relative z-10 p-6 md:p-8">
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="text-[var(--color-text-secondary)] text-sm mb-1 uppercase tracking-widest font-bold opacity-80">Total Virtual Assets</div>
              <div class="flex items-baseline gap-3">
                <span class="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tight">$125,430.50</span>
                <span class="bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] px-2 py-1 rounded-md font-bold text-xs flex items-center">
                  <n-icon :component="ArrowUpOutline" class="mr-1"/> +12.5%
                </span>
              </div>
            </div>
            <n-button circle secondary type="primary" class="bg-white/10 hover:bg-white/20 border-none text-white">
              <template #icon><n-icon :component="EyeOutline" /></template>
            </n-button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[var(--color-border)]/30">
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80">Available Cash</div>
              <div class="text-lg font-bold text-[var(--color-text-primary)]">$45,200.00</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80">In Positions</div>
              <div class="text-lg font-bold text-[var(--color-text-primary)]">$80,230.50</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80">Today's P/L</div>
              <div class="text-lg font-bold text-[var(--color-success)]">+$1,240.50</div>
            </div>
            <div>
              <div class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80">Total Trades</div>
              <div class="text-lg font-bold text-[var(--color-text-primary)]">142</div>
            </div>
          </div>
        </div>
      </div>

      <n-card title="Quick Recharge" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col justify-center">
        <template #header-extra>
          <n-tooltip trigger="hover">
            <template #trigger><n-icon :component="InformationCircleOutline" class="text-[var(--color-text-secondary)] cursor-help" /></template>
            1 USD = 1,000 Virtual Credits
          </n-tooltip>
        </template>
        <div class="space-y-6 py-2">
          <n-input-group size="large">
            <n-input-number v-model:value="rechargeAmount" :min="10" :step="10" class="flex-1 text-center" placeholder="Amount" :show-button="false">
              <template #prefix>$</template>
            </n-input-number>
            <n-button type="primary" class="px-6 font-bold" @click="handleRecharge">
              Top Up
            </n-button>
          </n-input-group>
          
          <div class="grid grid-cols-3 gap-3">
            <n-button v-for="val in [50, 100, 500]" :key="val" dashed class="font-medium hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]" @click="rechargeAmount = val">
              ${{ val }}
            </n-button>
          </div>
          
          <div class="bg-[var(--color-bg-sidebar)] p-3 rounded-lg flex items-start gap-2">
            <n-icon :component="InformationCircleOutline" class="text-[var(--color-brand-primary)] mt-0.5" />
            <p class="text-[10px] text-[var(--color-text-secondary)] italic leading-tight">
              Virtual funds are for training purposes only and have no real-world value. Reset anytime in settings.
            </p>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Asset Distribution & History -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Asset Distribution -->
      <n-card title="Asset Distribution" :bordered="false" class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <div class="h-64 flex items-center justify-center relative">
          <!-- Placeholder for Donut Chart -->
          <div class="w-48 h-48 rounded-full border-[16px] border-[var(--color-border)] flex items-center justify-center relative">
            <div class="absolute inset-[-16px] rounded-full border-[16px] border-[var(--color-brand-primary)]" style="clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 60%);"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">64%</div>
              <div class="text-[10px] text-[var(--color-text-secondary)] uppercase">Stocks</div>
            </div>
          </div>
        </div>
        <n-list :bordered="false" size="small">
          <n-list-item>
            <template #prefix><div class="w-2 h-2 rounded-full bg-[var(--color-brand-primary)]"></div></template>
            <div class="flex justify-between w-full text-xs">
              <span class="text-[var(--color-text-secondary)]">Equity Positions</span>
              <span class="text-[var(--color-text-primary)] font-bold">$80,230.50</span>
            </div>
          </n-list-item>
          <n-list-item>
            <template #prefix><div class="w-2 h-2 rounded-full bg-[var(--color-border)]"></div></template>
            <div class="flex justify-between w-full text-xs">
              <span class="text-[var(--color-text-secondary)]">Cash Balance</span>
              <span class="text-[var(--color-text-primary)] font-bold">$45,200.00</span>
            </div>
          </n-list-item>
        </n-list>
      </n-card>

      <!-- Right: Transaction History -->
      <n-card title="Financial Activity" :bordered="false" class="lg:col-span-2 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <template #header-extra>
          <n-radio-group v-model:value="historyFilter" size="small">
            <n-radio-button value="all">All</n-radio-button>
            <n-radio-button value="trade">Trades</n-radio-button>
            <n-radio-button value="recharge">Recharge</n-radio-button>
          </n-radio-group>
        </template>
        <n-empty v-if="filteredHistory.length === 0" description="No activity found" class="py-12" />
        <n-data-table
          v-else
          :columns="historyColumns"
          :data="filteredHistory"
          :pagination="{ pageSize: 5 }"
          size="small"
          :bordered="false"
        />
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { 
  NCard, NIcon, NButton, NInputGroup, NInputNumber, NTooltip, NList, NListItem, 
  NDataTable, NTag, NRadioGroup, NRadioButton, useMessage, NEmpty 
} from 'naive-ui'
import { 
  WalletOutline, InformationCircleOutline, ArrowUpOutline, EyeOutline
} from '@vicons/ionicons5'

const message = useMessage()
const rechargeAmount = ref(100)
const historyFilter = ref('all')

const historyData = [
  { id: 1, type: 'RECHARGE', amount: 50000.00, time: '2023-10-24 14:20', status: 'COMPLETED', detail: 'Credit Card (Simulated)' },
  { id: 2, type: 'TRADE_BUY', amount: -12450.00, time: '2023-10-24 10:30', status: 'COMPLETED', detail: 'NVDA x15' },
  { id: 3, type: 'TRADE_SELL', amount: 8420.00, time: '2023-10-23 16:15', status: 'COMPLETED', detail: 'AAPL x50' },
  { id: 4, type: 'RECHARGE', amount: 10000.00, time: '2023-10-22 09:00', status: 'COMPLETED', detail: 'Daily Reward' },
  { id: 5, type: 'TRADE_BUY', amount: -32000.00, time: '2023-10-21 11:45', status: 'COMPLETED', detail: 'TSLA x200' },
]

const historyColumns = [
  { title: 'Time', key: 'time' },
  { 
    title: 'Activity', 
    key: 'type',
    render(row: any) {
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-xs font-bold text-[var(--color-text-primary)]' }, row.type.replace('_', ' ')),
        h('span', { class: 'text-[10px] text-[var(--color-text-secondary)]' }, row.detail)
      ])
    }
  },
  { 
    title: 'Amount', 
    key: 'amount',
    render(row: any) {
      const isPositive = row.amount > 0
      return h('span', { 
        class: `font-bold ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}` 
      }, `${isPositive ? '+' : ''}${row.amount.toLocaleString()}`)
    }
  },
  {
    title: 'Status',
    key: 'status',
    render(row: any) {
      return h(NTag, { size: 'tiny', type: 'success', ghost: true, bordered: false }, { default: () => row.status })
    }
  }
]

const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return historyData
  if (historyFilter.value === 'trade') return historyData.filter(h => h.type.startsWith('TRADE'))
  return historyData.filter(h => h.type === 'RECHARGE')
})

function handleRecharge() {
  message.success(`Simulated recharge of $${rechargeAmount.value} successful!`)
}
</script>
