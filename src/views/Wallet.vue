<template>
  <div class="space-y-6">
    <!-- Balance Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-lg transition-transform hover:-translate-y-1 duration-300"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] z-0"
        ></div>
        <div class="absolute top-0 right-0 p-8 opacity-10 z-0">
          <n-icon size="120" :component="WalletOutline" />
        </div>

        <div class="relative z-10 p-6 md:p-8">
          <div class="flex justify-between items-start mb-6">
            <div>
              <div
                class="text-[var(--color-text-secondary)] text-sm mb-1 uppercase tracking-widest font-bold opacity-80"
              >
                {{ t("wallet.balance.accountBalance") }}
              </div>
              <div class="flex items-baseline gap-3">
                <span
                  class="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tight"
                  >${{ formatCurrency(totalAssets) }}</span
                >
                <span
                  class="bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] px-2 py-1 rounded-md font-bold text-xs flex items-center"
                >
                  <n-icon :component="ArrowUpOutline" class="mr-1" />
                  {{ pnlRateText }}
                </span>
              </div>
            </div>
            <n-tag type="warning" size="large" round>
              {{
                profile?.membership_tier
                  ? profile.membership_tier.toUpperCase()
                  : "FREE"
              }}
              {{ t("wallet.member") }}
            </n-tag>
          </div>

          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[var(--color-border)]/30"
          >
            <div>
              <div
                class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80"
              >
                {{ t("wallet.balance.todayPL") }}
              </div>
              <div class="text-lg font-bold text-[var(--color-success)]">
                {{ todayPnlText }}
              </div>
            </div>
            <div>
              <div
                class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80"
              >
                {{ t("wallet.balance.totalTrades") }}
              </div>
              <div class="text-lg font-bold text-[var(--color-text-primary)]">
                {{ tradeCount }}
              </div>
            </div>
            <div>
              <div
                class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80"
              >
                {{ t("wallet.balance.currency") }}
              </div>
              <div class="text-lg font-bold text-[var(--color-text-primary)]">
                {{ profile?.currency || "USD" }}
              </div>
            </div>
            <div>
              <div
                class="text-xs text-[var(--color-text-secondary)] mb-1 opacity-80"
              >
                {{ t("wallet.balance.status") }}
              </div>
              <div class="text-lg font-bold text-[var(--color-success)]">
                {{ t("wallet.status.active") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <n-card
        :title="t('wallet.recharge.title')"
        :bordered="false"
        class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col justify-center"
      >
        <template #header-extra>
          <n-tooltip trigger="hover">
            <template #trigger
              ><n-icon
                :component="InformationCircleOutline"
                class="text-[var(--color-text-secondary)] cursor-help"
            /></template>
            {{ t("wallet.recharge.rate") }}
          </n-tooltip>
        </template>
        <div class="space-y-6 py-2">
          <n-input-group size="large">
            <n-input-number
              v-model:value="rechargeAmount"
              :min="10"
              :step="10"
              class="flex-1 text-center"
              :placeholder="t('wallet.recharge.amount')"
              :show-button="false"
            >
              <template #prefix>$</template>
            </n-input-number>
            <n-button
              type="primary"
              class="px-6 font-bold"
              :loading="recharging"
              :disabled="!user || rechargeAmount <= 0"
              @click="handleRecharge"
            >
              {{ t("wallet.recharge.topUp") }}
            </n-button>
          </n-input-group>

          <div class="grid grid-cols-3 gap-3">
            <n-button
              v-for="val in [50, 100, 500]"
              :key="val"
              dashed
              class="font-medium hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
              @click="rechargeAmount = val"
            >
              ${{ val }}
            </n-button>
          </div>

          <div
            class="bg-[var(--color-bg-sidebar)] p-3 rounded-lg flex items-start gap-2"
          >
            <n-icon
              :component="InformationCircleOutline"
              class="text-[var(--color-brand-primary)] mt-0.5"
            />
            <p
              class="text-[10px] text-[var(--color-text-secondary)] italic leading-tight"
            >
              {{ t("wallet.disclaimer") }}
            </p>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Transaction History -->
    <n-card
      :title="t('wallet.history.title')"
      :bordered="false"
      class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]"
    >
      <template #header-extra>
        <n-radio-group v-model:value="historyFilter" size="small">
          <n-radio-button value="all">{{
            t("wallet.activity.all")
          }}</n-radio-button>
          <n-radio-button value="trade">{{
            t("wallet.activity.trades")
          }}</n-radio-button>
          <n-radio-button value="other">{{
            t("wallet.activity.adjustments")
          }}</n-radio-button>
        </n-radio-group>
      </template>
      <n-empty
        v-if="filteredHistory.length === 0"
        :description="t('wallet.activity.noActivity')"
        class="py-12"
      />
      <n-data-table
        v-else
        :columns="historyColumns"
        :data="filteredHistory"
        :pagination="{ pageSize: 10 }"
        size="small"
        :bordered="false"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  NCard,
  NIcon,
  NTag,
  NRadioGroup,
  NRadioButton,
  useMessage,
  NEmpty,
  NDataTable,
  NInputGroup,
  NInputNumber,
  NTooltip,
  NButton,
} from "naive-ui";
import {
  WalletOutline,
  ArrowUpOutline,
  InformationCircleOutline,
} from "@vicons/ionicons5";
import { useAuth } from "../composables/useAuth";
import { getWalletLedger, rechargeWallet } from "../services/api/walletApi";

const { t } = useI18n();
const message = useMessage();
const { user, profile, refreshProfile } = useAuth();
const historyFilter = ref("all");
const rechargeAmount = ref(100);
const recharging = ref(false);

const historyData = ref<any[]>([]);

const totalAssets = computed(() =>
  Number(profile.value?.training_balance ?? 0),
);

const todayPnl = computed(() =>
  historyData.value
    .filter((h) => h.type === "TRADE_PNL")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
);
const todayPnlText = computed(
  () => `${todayPnl.value >= 0 ? "+" : ""}${formatCurrency(todayPnl.value)}`,
);
const tradeCount = computed(
  () => historyData.value.filter((h) => h.type.startsWith("TRADE")).length,
);
const pnlRateText = computed(() => {
  const base = totalAssets.value - todayPnl.value;
  const rate = base === 0 ? 0 : (todayPnl.value / base) * 100;
  return `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
});

const historyColumns = computed(() => [
  { title: t("wallet.activity.columns.time"), key: "time" },
  {
    title: t("wallet.activity.columns.activity"),
    key: "type",
    render(row: any) {
      return h("div", { class: "flex flex-col" }, [
        h(
          "span",
          { class: "text-xs font-bold text-[var(--color-text-primary)]" },
          row.type.replace("_", " "),
        ),
        h(
          "span",
          { class: "text-[10px] text-[var(--color-text-secondary)]" },
          row.detail,
        ),
      ]);
    },
  },
  {
    title: t("wallet.activity.columns.amount"),
    key: "amount",
    render(row: any) {
      const isPositive = row.amount > 0;
      return h(
        "span",
        {
          class: `font-bold ${isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`,
        },
        `${isPositive ? "+" : ""}${row.amount.toLocaleString()}`,
      );
    },
  },
  {
    title: t("wallet.activity.columns.status"),
    key: "status",
    render(row: any) {
      return h(
        NTag,
        { size: "tiny", type: "success", ghost: true, bordered: false },
        { default: () => row.status },
      );
    },
  },
]);

const filteredHistory = computed(() => {
  if (historyFilter.value === "all") return historyData.value;
  if (historyFilter.value === "trade")
    return historyData.value.filter((h) => h.type.startsWith("TRADE"));
  return historyData.value.filter((h) => !h.type.startsWith("TRADE"));
});

async function loadHistory() {
  if (!user.value) {
    historyData.value = [];
    return;
  }
  const { data, error } = await getWalletLedger(100);
  if (error) {
    message.error(error.message);
    return;
  }
  historyData.value =
    data?.map((item: any) => {
      const trade = item.change_type === "trade_pnl";
      // Map other types if necessary
      return {
        id: item.$id,
        type: trade ? "TRADE_PNL" : item.change_type.toUpperCase(),
        amount: Number(item.amount),
        time: new Date(item.created_at).toLocaleString(),
        status: "COMPLETED",
        detail: item.note || item.change_type,
      };
    }) ?? [];
}

async function handleRecharge() {
  if (!user.value) return;
  if (recharging.value) return;
  const amount = Number(rechargeAmount.value);
  if (!Number.isFinite(amount) || amount <= 0) return;

  recharging.value = true;
  try {
    const { error } = await rechargeWallet({
      amount,
      channel: "manual",
      clientTxnId: `txn_${Date.now()}`,
    });

    if (error) {
      message.error(error.message);
      return;
    }

    await refreshProfile();
    await loadHistory();
    message.success(t("wallet.recharge.success", { amount }));
  } finally {
    recharging.value = false;
  }
}

function formatCurrency(value: number) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

onMounted(async () => {
  await loadHistory();
});
</script>
