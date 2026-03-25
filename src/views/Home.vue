<template>
  <div class="space-y-6 pb-6">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {{ t("common.welcome", { name: user?.name || "Trader" }) }}
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
      <!-- Portfolio Value -->
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

      <!-- Total Sessions -->
      <n-card
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <n-statistic
          :label="t('home.stats.totalSessions')"
          :value="totalSessions"
        >
        </n-statistic>
        <div
          class="mt-4 flex justify-between text-xs text-[var(--color-text-secondary)]"
        >
          <span>{{ t("home.stats.completed") }}</span>
          <span class="text-[var(--color-text-primary)]">{{
            completedSessions
          }}</span>
        </div>
      </n-card>

      <!-- Total P/L (Session Based) -->
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
          <span>{{ t("home.stats.avgReturn") }}</span>
          <span
            :class="
              avgReturn >= 0
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-error)]'
            "
          >
            {{ avgReturn >= 0 ? "+" : "" }}{{ avgReturn.toFixed(2) }}%
          </span>
        </div>
      </n-card>

      <!-- Win Rate (Session Based) -->
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
          <span>{{ t("home.stats.profitableSessions") }}</span>
          <span>{{ profitableSessionsCount }}</span>
        </div>
      </n-card>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Sessions (Span 2) -->
      <div class="lg:col-span-2 space-y-6 flex flex-col">
        <n-card
          :title="t('home.recentSessions')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl flex-1"
        >
          <template #header-extra>
            <n-button size="small" ghost @click="router.push('/review')">{{
              t("common.viewAll")
            }}</n-button>
          </template>
          <n-data-table
            :columns="columns"
            :data="recentSessions"
            :bordered="false"
            :pagination="false"
            size="small"
          />
        </n-card>
      </div>

      <!-- Right Side: Quick Actions & Recommended -->
      <div class="space-y-6">
        <n-card
          v-if="unfinishedSessions.length > 0"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]"
          title="未完成训练"
        >
          <n-list>
            <n-list-item
              v-for="u in unfinishedSessions.slice(0, 3)"
              :key="u.$id"
            >
              <div class="flex items-center justify-between w-full">
                <div class="text-sm text-[var(--color-text-primary)]">
                  {{
                    symbolNameMap[String(u.symbol || u.ts_code || "")] ||
                    String(u.symbol || u.ts_code || "---")
                  }}
                  ({{ u.symbol || u.ts_code }})
                </div>
                <n-button size="tiny" ghost @click="router.push('/training')"
                  >继续</n-button
                >
              </div>
            </n-list-item>
          </n-list>
        </n-card>
        <!-- Quick Actions -->
        <n-card
          :title="t('home.quickActions')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl"
        >
          <div class="grid grid-cols-2 gap-3">
            <n-button
              class="h-24 flex flex-col gap-2"
              dashed
              @click="router.push('/training')"
            >
              <n-icon
                size="16"
                :component="TrendingUpOutline"
                class="text-[var(--color-brand-primary)]"
              />
              <span class="text-xs">{{ t("home.actions.newSession") }}</span>
            </n-button>
            <n-button
              class="h-24 flex flex-col gap-2"
              dashed
              @click="router.push('/review')"
            >
              <n-icon
                size="16"
                :component="BookOutline"
                class="text-blue-400"
              />
              <span class="text-xs">{{ t("home.actions.reviewHistory") }}</span>
            </n-button>
            <n-button
              class="h-24 flex flex-col gap-2"
              dashed
              @click="router.push('/wallet')"
            >
              <n-icon
                size="16"
                :component="WalletOutline"
                class="text-green-400"
              />
              <span class="text-xs">{{ t("home.actions.myWallet") }}</span>
            </n-button>
            <n-button class="h-24 flex flex-col gap-2" dashed>
              <n-icon
                size="16"
                :component="SettingsOutline"
                class="text-[var(--color-text-secondary)]"
              />
              <span class="text-xs">{{ t("home.actions.settings") }}</span>
            </n-button>
          </div>
        </n-card>

        <!-- Recommended Scenarios -->
        <n-card
          :title="t('home.trainingFocus')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl"
        >
          <n-list hoverable clickable>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar
                  size="small"
                  style="background-color: #fde68a; color: #d97706"
                >
                  <n-icon :component="TrendingUpOutline" />
                </n-avatar>
                <div>
                  <div class="font-medium">{{ t("home.focus.trend") }}</div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("home.focus.trendDesc") }}
                  </div>
                </div>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar
                  size="small"
                  style="background-color: #bfdbfe; color: #2563eb"
                >
                  <n-icon :component="ArrowUpOutline" />
                </n-avatar>
                <div>
                  <div class="font-medium">{{ t("home.focus.breakout") }}</div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("home.focus.breakoutDesc") }}
                  </div>
                </div>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex items-center gap-3">
                <n-avatar
                  size="small"
                  style="background-color: #fecaca; color: #dc2626"
                >
                  <n-icon
                    :component="TrendingUpOutline"
                    class="transform rotate-180"
                  />
                </n-avatar>
                <div>
                  <div class="font-medium">{{ t("home.focus.reversal") }}</div>
                  <div class="text-xs text-[var(--color-text-secondary)]">
                    {{ t("home.focus.reversalDesc") }}
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
  NDataTable,
  NTag,
  NList,
  NListItem,
  NAvatar,
} from "naive-ui";
import {
  TrendingUpOutline,
  ArrowUpOutline,
  BookOutline,
  SettingsOutline,
  WalletOutline,
} from "@vicons/ionicons5";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";
import { listSessions } from "../services/api/trainingApi";
import {
  getStockInfoBySymbol,
  getStockInfoByTsCode,
} from "../services/marketRepo";

const router = useRouter();
const { t } = useI18n();
const { user, profile } = useAuth();
const sessions = ref<any[]>([]);
const symbolNameMap = ref<Record<string, string>>({});

const portfolioValue = computed(() =>
  Number(profile.value?.training_balance ?? 0),
);

// Session Stats
const totalSessions = computed(() => sessions.value.length);
const completedSessions = computed(
  () => sessions.value.filter((s) => s.status === "completed").length,
);

const totalPnl = computed(() =>
  sessions.value
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + Number(s.realized_pnl || 0), 0),
);

const avgReturn = computed(() => {
  const completed = sessions.value.filter((s) => s.status === "completed");
  if (completed.length === 0) return 0;
  const totalReturn = completed.reduce(
    (sum, s) => sum + Number(s.return_pct || 0),
    0,
  );
  return totalReturn / completed.length;
});

const profitableSessionsCount = computed(
  () =>
    sessions.value.filter(
      (s) => s.status === "completed" && Number(s.realized_pnl) > 0,
    ).length,
);

const winRate = computed(() => {
  const completedCount = completedSessions.value;
  if (completedCount === 0) return 0;
  return Number(
    ((profitableSessionsCount.value / completedCount) * 100).toFixed(1),
  );
});

const winRateText = computed(() => `${winRate.value}%`);

const totalPnlRateText = computed(() => {
  // Global ROI based on current balance vs initial (hard to track without ledger, so using session sum vs balance)
  // For now just show accumulated PnL % relative to current balance (approx)
  // Or just use the same logic as before: PnL / (Balance - PnL)
  const base = portfolioValue.value - totalPnl.value;
  const rate = base === 0 ? 0 : (totalPnl.value / base) * 100;
  return `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
});

onMounted(async () => {
  if (!user.value) return;
  const { data } = await listSessions(50); // Get last 50 for stats
  if (data) {
    sessions.value = data.documents;
    const recent = sessions.value.slice(0, 10);
    const symbols = Array.from(
      new Set(
        recent
          .flatMap((s) => [
            String(s.symbol || "").trim(),
            String(s.ts_code || "").trim(),
          ])
          .filter((x) => x && x !== "---"),
      ),
    );
    if (symbols.length > 0) {
      const fetches = symbols.map(async (sym) => {
        const bySymbol = await getStockInfoBySymbol(sym);
        if (bySymbol.data && bySymbol.data.name) {
          return { sym, name: bySymbol.data.name };
        }
        const byTs = await getStockInfoByTsCode(sym);
        if (byTs.data && byTs.data.name) {
          return { sym, name: byTs.data.name };
        }
        return { sym, name: sym };
      });
      const results = await Promise.all(fetches);
      const map: Record<string, string> = {};
      results.forEach(({ sym, name }) => {
        map[sym] = name;
      });
      symbolNameMap.value = map;
    }
  }
});

const unfinishedSessions = computed(() =>
  sessions.value.filter(
    (s) => s.status !== "completed" && s.status !== "aborted",
  ),
);

const recentSessions = computed(() => {
  return sessions.value.slice(0, 10).map((s) => {
    const symbol = String(s.symbol || "").trim();
    const name = symbolNameMap.value[symbol];
    return {
      date: new Date(s.$createdAt).toLocaleDateString(),
      market: `${name} (${symbol})`,
      duration: "N/A", // Can be calc from start/end time if available
      pl: Number(s.return_pct || 0).toFixed(2),
      id: s.$id,
    };
  });
});

const columns = computed(() => [
  { title: t("review.journal.date"), key: "date" },
  { title: t("review.columns.market"), key: "market" },
  {
    title: t("review.columns.return"),
    key: "pl",
    render(row: any) {
      return h(
        NTag,
        {
          type: Number(row.pl) > 0 ? "success" : "error",
          bordered: false,
          round: true,
          size: "small",
        },
        { default: () => (Number(row.pl) > 0 ? "+" : "") + row.pl + "%" },
      );
    },
  },
  {
    title: t("review.columns.action"),
    key: "actions",
    render() {
      return h(
        NButton,
        {
          size: "tiny",
          ghost: true,
          onClick: () => router.push("/review"),
        }, // In real app, navigate to details
        { default: () => t("menu.review") },
      );
    },
  },
]);
</script>
