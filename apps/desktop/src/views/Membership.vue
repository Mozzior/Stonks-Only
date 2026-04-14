<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
        {{ t("membership.header.title") }}
      </h1>
      <p class="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
        {{ t("membership.header.subtitle") }}
      </p>
    </div>

    <!-- Plans -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="plan in plans" :key="plan.name" class="relative group">
        <div
          class="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-primary)] to-transparent opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
        ></div>
        <n-card
          :bordered="false"
          class="h-full bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors relative z-10"
        >
          <div class="flex flex-col h-full">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-bold text-[var(--color-text-primary)]">
                  {{ plan.name }}
                </h3>
                <p
                  class="text-xs text-[var(--color-text-secondary)] mt-1 min-h-[32px]"
                >
                  {{ plan.description }}
                </p>
              </div>
              <n-tag v-if="plan.popular" type="primary" size="small" round>{{
                t("membership.plans.popular")
              }}</n-tag>
            </div>

            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-3xl font-black text-[var(--color-text-primary)]"
                >${{ plan.price }}</span
              >
              <span class="text-xs text-[var(--color-text-secondary)]">{{
                t("membership.plans.perMonth")
              }}</span>
            </div>

            <n-button
              :type="plan.current ? 'default' : (plan.rank < currentRank ? 'tertiary' : 'primary')"
              :disabled="plan.current || plan.rank < currentRank"
              :loading="isUpgrading === plan.id"
              block
              class="mb-6 font-bold"
              @click="handleUpgrade(plan)"
            >
              {{
                plan.current
                  ? t("membership.plans.currentPlan")
                  : plan.rank < currentRank
                    ? t("membership.plans.downgrade", "Downgrade")
                    : t("membership.plans.upgradeNow")
              }}
            </n-button>

            <ul class="space-y-2 flex-1 mt-6">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <n-icon
                  :component="CheckmarkCircleOutline"
                  class="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                />
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
        <h2 class="text-xl font-bold text-[var(--color-text-primary)]">
          {{ t("membership.achievements.title") }}
        </h2>
        <div class="w-full max-w-2xs flex items-center gap-3">
          <span
            class="text-sm font-bold text-[var(--color-text-primary)] whitespace-nowrap"
          >
            Lv. 12
          </span>
          <n-progress
            type="line"
            :percentage="45"
            :height="16"
            indicator-placement="inside"
            color="var(--color-brand-primary)"
            rail-color="var(--color-bg-sidebar)"
            processing
            class="rounded-full overflow-hidden flex-1 min-w-0"
          >
            <span
              class="text-[11px] font-bold tracking-wider px-2 text-white drop-shadow-md whitespace-nowrap"
            >
              4,500 / 10,000 XP
            </span>
          </n-progress>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <n-card
          v-for="achievement in achievements"
          :key="achievement.title"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]"
          :class="{ 'opacity-50 grayscale': !achievement.unlocked }"
        >
          <div class="flex flex-col items-center text-center gap-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-bg-sidebar)] border border-[var(--color-border)]"
            >
              <n-icon
                size="24"
                :component="achievement.icon"
                :color="achievement.unlocked ? '#F59E0B' : '#64748B'"
              />
            </div>
            <div>
              <div class="font-bold text-[var(--color-text-primary)] text-sm">
                {{ achievement.title }}
              </div>
              <div class="text-[10px] text-[var(--color-text-secondary)]">
                {{ achievement.desc }}
              </div>
            </div>
            <n-tag
              v-if="achievement.unlocked"
              type="warning"
              size="tiny"
              round
              bordered
              >{{ t("membership.achievements.unlocked") }}</n-tag
            >
            <n-progress
              v-else
              type="line"
              :percentage="achievement.progress"
              :height="4"
              :show-indicator="false"
            />
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { NCard, NButton, NIcon, NTag, NProgress, useMessage } from "naive-ui";
import {
  CheckmarkCircleOutline,
  TrophyOutline,
  RocketOutline,
  WalletOutline,
  TrendingUpOutline,
} from "@vicons/ionicons5";
import { useAuth } from "../composables/useAuth";
import { mapLegacyTier } from "../utils/userProfile";
import { upgradeMembership } from "../services/api/membershipApi";
import { ID } from "../utils/appwrite";

const { t } = useI18n();
const { profile, refreshProfile } = useAuth();
const message = useMessage();
const isUpgrading = ref<string | null>(null);

const currentTier = computed(() =>
  mapLegacyTier(profile.value?.membership_tier),
);

const tierRanks: Record<string, number> = {
  free: 0,
  pro: 1,
  vip: 2,
};

const currentRank = computed(() => tierRanks[currentTier.value] ?? 0);

const handleUpgrade = async (plan: any) => {
  if (plan.current) return;
  isUpgrading.value = plan.id;
  try {
    const payload = {
      planId: plan.id,
      paymentMethod: "system",
      clientTxnId: ID.unique(),
    };
    const res = await upgradeMembership(payload);
    if (res.error) {
      message.error(
        t("membership.plans.upgradeFailed") + ": " + res.error.message,
      );
    } else {
      message.success(
        t("membership.plans.upgradeSuccess") || "Upgrade successful",
      );
      await refreshProfile();
    }
  } catch (error: any) {
    message.error(t("membership.plans.upgradeFailed") || "Upgrade failed");
  } finally {
    isUpgrading.value = null;
  }
};

const plans = computed(() => [
  {
    id: "free",
    rank: 0,
    name: t("membership.plans.rookie.name"),
    price: "0",
    description: t("membership.plans.rookie.desc"),
    current: currentTier.value === "free",
    popular: false,
    features: [
      t("membership.plans.rookie.features.marketData"),
      t("membership.plans.rookie.features.trades"),
      t("membership.plans.rookie.features.charts"),
      t("membership.plans.rookie.features.leaderboard"),
    ],
  },
  {
    id: "pro",
    rank: 1,
    name: t("membership.plans.pro.name"),
    price: "29",
    description: t("membership.plans.pro.desc"),
    current: currentTier.value === "pro",
    popular: true,
    features: [
      t("membership.plans.pro.features.marketData"),
      t("membership.plans.pro.features.trades"),
      t("membership.plans.pro.features.indicators"),
      t("membership.plans.pro.features.analytics"),
      t("membership.plans.pro.features.support"),
    ],
  },
  {
    id: "vip",
    rank: 2,
    name: t("membership.plans.elite.name"),
    price: "99",
    description: t("membership.plans.elite.desc"),
    current: currentTier.value === "vip",
    popular: false,
    features: [
      t("membership.plans.elite.features.marketData"),
      t("membership.plans.elite.features.ai"),
      t("membership.plans.elite.features.backtest"),
      t("membership.plans.elite.features.mentorship"),
      t("membership.plans.elite.features.earlyAccess"),
    ],
  },
]);

const achievements = computed(() => [
  {
    title: t("membership.achievements.list.firstSteps.title"),
    desc: t("membership.achievements.list.firstSteps.desc"),
    icon: RocketOutline,
    unlocked: true,
    progress: 100,
  },
  {
    title: t("membership.achievements.list.profitableWeek.title"),
    desc: t("membership.achievements.list.profitableWeek.desc"),
    icon: TrendingUpOutline,
    unlocked: true,
    progress: 100,
  },
  {
    title: t("membership.achievements.list.bigSpender.title"),
    desc: t("membership.achievements.list.bigSpender.desc"),
    icon: WalletOutline,
    unlocked: false,
    progress: 65,
  },
  {
    title: t("membership.achievements.list.masterAnalyst.title"),
    desc: t("membership.achievements.list.masterAnalyst.desc"),
    icon: TrophyOutline,
    unlocked: false,
    progress: 20,
  },
]);
</script>
