<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {{ t("common.welcome", { name: "Trader" }) }}
        </h1>
        <p class="text-[var(--color-text-secondary)] text-sm">
          {{ t("home.subtitle") }}
        </p>
      </div>
      <n-button type="primary" size="large" @click="router.push('/training')">
        <template #icon>
          <n-icon :component="TrendingUpOutline" />
        </template>
        {{ t("home.startSession") }}
      </n-button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <n-card
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-xl shadow-sm hover:shadow-md transition-shadow group"
      >
        <n-statistic
          :label="t('home.stats.portfolioValue')"
          :value="portfolioValue"
          :precision="2"
        >
          <template #prefix>$</template>
          <template #suffix>
            <span
              class="text-xs font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full ml-2 flex items-center inline-flex group-hover:scale-105 transition-transform"
            >
              <n-icon :component="ArrowUpOutline" class="mr-1" />
              {{ totalPnlRateText }}
            </span>
          </template>
        </n-statistic>
        <div
          class="mt-2 h-1 w-full bg-[var(--color-border)] rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-[var(--color-brand-primary)] w-[75%] group-hover:w-[78%] transition-all duration-1000 ease-out"
          ></div>
        </div>
      </n-card>

      <n-card
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <n-statistic
          :label="t('home.stats.cash')"
          :value="availableCash"
          :precision="2"
        >
          <template #prefix>$</template>
        </n-statistic>
        <div
          class="mt-4 flex justify-between text-xs text-[var(--color-text-secondary)]"
        >
          <span>{{ t("home.stats.buyingPower") }}</span>
          <span class="text-[var(--color-text-primary)]"
            >${{ formatCurrency(buyingPower) }}</span
          >
        </div>
      </n-card>

      <n-card
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <n-statistic
          :label="t('home.stats.totalPL')"
          :value="Math.abs(totalPnl)"
          :precision="2"
        >
          <template #prefix>
            <span
              :class="
                totalPnl >= 0
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
              "
            >
              {{ totalPnl >= 0 ? "+$" : "-$" }}
            </span>
          </template>
        </n-statistic>
        <div
          class="mt-4 flex justify-between text-xs text-[var(--color-text-secondary)]"
        >
          <span>{{ t("home.stats.todayPL") }}</span>
          <span
            :class="
              todayPnl >= 0
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-error)]'
            "
          >
            {{ todayPnl >= 0 ? "+$" : "-$"
            }}{{ formatCurrency(Math.abs(todayPnl)) }}
          </span>
        </div>
      </n-card>

      <n-card
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-end mb-1">
          <span class="text-[var(--color-text-secondary)] text-sm">{{
            t("home.stats.winRate")
          }}</span>
          <span class="text-2xl font-bold text-[var(--color-text-primary)]">{{
            winRateText
          }}</span>
        </div>
        <n-progress
          type="line"
          :percentage="winRate"
          :height="8"
          :color="'var(--color-brand-primary)'"
          :rail-color="'rgba(255,255,255,0.1)'"
        />
        <div
          class="mt-3 flex justify-between text-xs text-[var(--color-text-secondary)]"
        >
          <span>{{ t("home.stats.trades", { count: tradeCount }) }}</span>
          <span>{{
            t("home.stats.profitable", { count: profitableCount })
          }}</span>
        </div>
      </n-card>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart / Performance (Span 2) -->
      <div class="lg:col-span-2 space-y-6">
        <n-card
          :title="t('home.performance')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl min-h-[400px]"
        >
          <template #header-extra>
            <n-space>
              <n-button size="small" ghost>1D</n-button>
              <n-button size="small" type="primary" ghost>1W</n-button>
              <n-button size="small" ghost>1M</n-button>
              <n-button size="small" ghost>YTD</n-button>
            </n-space>
          </template>

          <!-- Placeholder Chart Visual -->
          <div
            class="relative w-full h-[320px] bg-gradient-to-t from-[var(--color-brand-primary)]/5 to-transparent rounded-lg border border-dashed border-[var(--color-border)] flex items-end justify-between px-4 pb-4 overflow-hidden group"
          >
            <!-- Simulated Chart Line (SVG) -->
            <svg
              class="absolute bottom-0 left-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.02]"
              preserveAspectRatio="none"
            >
              <path
                d="M0,320 L0,280 C50,250 100,300 150,260 C200,220 250,240 300,200 C350,160 400,180 450,150 C500,120 550,140 600,100 C650,60 700,80 750,50 L800,0 L800,320 Z"
                fill="url(#grad)"
                opacity="0.2"
              ></path>
              <path
                d="M0,280 C50,250 100,300 150,260 C200,220 250,240 300,200 C350,160 400,180 450,150 C500,120 550,140 600,100 C650,60 700,80 750,50"
                stroke="var(--color-brand-primary)"
                stroke-width="2"
                fill="none"
              ></path>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    style="
                      stop-color: var(--color-brand-primary);
                      stop-opacity: 1;
                    "
                  />
                  <stop
                    offset="100%"
                    style="
                      stop-color: var(--color-brand-primary);
                      stop-opacity: 0;
                    "
                  />
                </linearGradient>
              </defs>
            </svg>

            <!-- Axis Labels -->
            <div
              class="absolute left-2 top-2 text-xs text-[var(--color-text-secondary)] flex flex-col gap-8"
            >
              <span v-for="tick in chartTicks" :key="tick"
                >${{ formatTick(tick) }}</span
              >
            </div>
          </div>
        </n-card>

        <n-card
          :title="t('home.recentSessions')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl"
        >
          <n-data-table
            :columns="columns"
            :data="data"
            :bordered="false"
            :pagination="false"
            size="small"
          />
        </n-card>
      </div>

      <!-- Right Side: Watchlist & Quick Actions -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <n-card
          :title="t('home.quickActions')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl"
        >
          <div class="grid grid-cols-2 gap-3">
            <n-button class="h-24 flex flex-col gap-2" dashed>
              <n-icon
                size="24"
                :component="AddCircleOutline"
                class="text-[var(--color-brand-primary)]"
              />
              <span class="text-xs">{{ t("home.actions.deposit") }}</span>
            </n-button>
            <n-button class="h-24 flex flex-col gap-2" dashed>
              <n-icon
                size="24"
                :component="ShareOutline"
                class="text-blue-400"
              />
              <span class="text-xs">{{ t("home.actions.invite") }}</span>
            </n-button>
            <n-button class="h-24 flex flex-col gap-2" dashed>
              <n-icon
                size="24"
                :component="BookOutline"
                class="text-purple-400"
              />
              <span class="text-xs">{{ t("home.actions.journal") }}</span>
            </n-button>
            <n-button class="h-24 flex flex-col gap-2" dashed>
              <n-icon
                size="24"
                :component="SettingsOutline"
                class="text-[var(--color-text-secondary)]"
              />
              <span class="text-xs">{{ t("home.actions.settings") }}</span>
            </n-button>
          </div>
        </n-card>

        <!-- Market Overview -->
        <n-card
          :title="t('home.marketMovers')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl"
        >
          <n-list>
            <n-list-item v-for="stock in marketMovers" :key="stock.symbol">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <n-avatar
                    size="small"
                    :style="{ backgroundColor: stock.color }"
                    >{{ stock.symbol[0] }}</n-avatar
                  >
                  <div>
                    <div class="font-bold text-[var(--color-text-primary)]">
                      {{ stock.symbol }}
                    </div>
                    <div class="text-xs text-[var(--color-text-secondary)]">
                      {{ stock.name }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-[var(--color-text-primary)]">
                    ${{ stock.price }}
                  </div>
                  <div
                    :class="
                      stock.change > 0
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-error)]'
                    "
                    class="text-xs font-bold"
                  >
                    {{ stock.change > 0 ? "+" : "" }}{{ stock.change }}%
                  </div>
                </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  NCard,
  NStatistic,
  NIcon,
  NProgress,
  NButton,
  NSpace,
  NDataTable,
  NTag,
  NList,
  NListItem,
  NAvatar,
} from "naive-ui";
import {
  TrendingUpOutline,
  ArrowUpOutline,
  AddCircleOutline,
  ShareOutline,
  BookOutline,
  SettingsOutline,
} from "@vicons/ionicons5";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";
import { getWalletLedger } from "../services/api/walletApi";

const router = useRouter();
const { t } = useI18n();
const { user, profile } = useAuth();
const ledger = ref<any[]>([]);

const portfolioValue = computed(() =>
  Number(profile.value?.training_balance ?? 0),
);
const availableCash = computed(() =>
  Number((portfolioValue.value * 0.36).toFixed(2)),
);
const buyingPower = computed(() =>
  Number((availableCash.value * 4).toFixed(2)),
);
const tradePnlLedger = computed(() =>
  ledger.value.filter((item) => item.change_type === "trade_pnl"),
);
const totalPnl = computed(() =>
  Number(
    tradePnlLedger.value
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      .toFixed(2),
  ),
);
const todayPnl = computed(() => {
  const today = new Date().toDateString();
  return Number(
    tradePnlLedger.value
      .filter((item) => new Date(item.created_at).toDateString() === today)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      .toFixed(2),
  );
});
const tradeCount = computed(() => tradePnlLedger.value.length);
const profitableCount = computed(
  () => tradePnlLedger.value.filter((item) => Number(item.amount) > 0).length,
);
const winRate = computed(() => {
  if (tradeCount.value === 0) return 0;
  return Number(((profitableCount.value / tradeCount.value) * 100).toFixed(1));
});
const winRateText = computed(() => `${winRate.value}%`);
const totalPnlRateText = computed(() => {
  const base = portfolioValue.value - totalPnl.value;
  const rate = base === 0 ? 0 : (totalPnl.value / base) * 100;
  return `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
});
const chartTicks = computed(() => {
  const base = Math.max(portfolioValue.value, 1000);
  const step = Math.max(Math.round((base * 0.04) / 100) * 100, 100);
  return [base + step * 2, base + step, base, Math.max(base - step, 0)];
});

function formatCurrency(value: number) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTick(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
}

onMounted(async () => {
  if (!user.value) return;
  const { data } = await getWalletLedger(200);
  ledger.value = data ?? [];
});

// Sample Data for Recent Sessions
const columns = [
  { title: "Date", key: "date" },
  { title: "Market", key: "market" },
  { title: "Duration", key: "duration" },
  {
    title: "P/L",
    key: "pl",
    render(row: any) {
      return h(
        NTag,
        {
          type: row.pl > 0 ? "success" : "error",
          bordered: false,
          round: true,
          size: "small",
        },
        { default: () => (row.pl > 0 ? "+" : "") + row.pl + "%" },
      );
    },
  },
  {
    title: "Action",
    key: "actions",
    render() {
      return h(
        NButton,
        { size: "tiny", ghost: true },
        { default: () => "Review" },
      );
    },
  },
];

const data = [
  { date: "2023-10-24", market: "AAPL (15m)", duration: "45m", pl: 12.5 },
  { date: "2023-10-23", market: "TSLA (1h)", duration: "1h 20m", pl: -3.2 },
  { date: "2023-10-22", market: "BTC (4h)", duration: "30m", pl: 5.8 },
  { date: "2023-10-21", market: "NVDA (Daily)", duration: "2h", pl: 24.1 },
];

// Sample Data for Market Movers
const marketMovers = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    price: "892.10",
    change: 4.5,
    color: "#76B900",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    price: "175.34",
    change: -2.1,
    color: "#E31937",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc",
    price: "168.45",
    change: 0.8,
    color: "#A2AAAD",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro",
    price: "180.20",
    change: 3.2,
    color: "#000000",
  },
];
</script>
