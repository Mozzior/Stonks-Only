<template>
  <n-layout has-sider class="h-screen w-screen bg-[var(--color-bg-body)]">
    <n-layout-sider
      v-if="!isFullscreen"
      bordered
      collapse-mode="width"
      :collapsed-width="84"
      :width="240"
      :collapsed="collapsed"
      class="bg-[var(--color-bg-sidebar)] z-50"
    >
      <div
        class="h-16 flex items-center justify-center border-b border-[var(--color-border)] cursor-pointer select-none"
        @click="collapsed = !collapsed"
      >
        <transition name="fade" mode="out-in">
          <div
            v-if="!collapsed"
            class="text-xl font-bold text-[var(--color-brand-primary)] tracking-wide whitespace-nowrap"
          >
            STONKS ONLY
          </div>
          <div
            v-else
            class="text-xl font-bold text-[var(--color-brand-primary)]"
          >
            S
          </div>
        </transition>
      </div>

      <n-menu
        :collapsed="collapsed"
        :collapsed-width="84"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleUpdateValue"
        class="w-full"
      />

      <div
        class="absolute bottom-4 w-full px-4 transition-all duration-300"
        :class="{ 'opacity-0 translate-y-4 pointer-events-none': collapsed }"
      >
        <div
          class="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-brand-primary)] transition-colors shadow-sm"
        >
          <n-avatar
            round
            size="small"
            :src="avatarUrl"
            class="border border-[var(--color-border)] flex-shrink-0"
          />
          <div class="flex flex-col overflow-hidden">
            <span
              class="text-sm font-bold text-[var(--color-text-primary)] truncate"
              >{{ userDisplay }}</span
            >
            <span
              class="text-[10px] text-[var(--color-text-secondary)] truncate"
              >{{ membershipText }}</span
            >
          </div>
        </div>
      </div>
    </n-layout-sider>

    <n-layout-content
      class="bg-[var(--color-bg-body)] h-full"
      :native-scrollbar="false"
      :content-style="{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }"
    >
      <div
        class="flex-1 w-full flex flex-col transition-all duration-300"
        :class="isFullscreen ? 'p-0' : 'p-6'"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </n-layout-content>
  </n-layout>
  <UpdateNotifier />
</template>

<script setup lang="ts">
import { h, ref, computed, watch } from "vue";
import UpdateNotifier from "./UpdateNotifier.vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  NIcon,
  NLayout,
  NLayoutSider,
  NMenu,
  NAvatar,
  NLayoutContent,
} from "naive-ui";
import type { MenuOption } from "naive-ui";
import { useI18n } from "vue-i18n";
import {
  HomeOutline,
  TrendingUpOutline,
  WalletOutline,
  RibbonOutline,
  PersonOutline,
  SettingsOutline,
  LogOutOutline,
  BarChartOutline,
  InformationCircleOutline,
  SchoolOutline,
} from "@vicons/ionicons5";
import { useLayoutControl } from "../composables/useLayoutControl";
import { useAuth } from "../composables/useAuth";
import {
  getAvatarUrl,
  getDisplayName,
  getMembershipTagType,
  mapLegacyTier,
  normalizeStatus,
} from "../utils/userProfile";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { isFullscreen } = useLayoutControl();
const { user, profile, signOut } = useAuth();
const collapsed = ref(false);

const activeKey = computed(() => route.path);
function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = computed<MenuOption[]>(() => [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => t("menu.home") }),
    key: "/",
    icon: renderIcon(HomeOutline),
  },
  {
    label: () =>
      h(RouterLink, { to: "/training" }, { default: () => t("menu.training") }),
    key: "/training",
    icon: renderIcon(TrendingUpOutline),
  },
  {
    label: () =>
      h(RouterLink, { to: "/review" }, { default: () => t("menu.review") }),
    key: "/review",
    icon: renderIcon(BarChartOutline),
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/leaderboard" },
        { default: () => t("menu.leaderboard") },
      ),
    key: "/leaderboard",
    icon: renderIcon(RibbonOutline),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: () =>
      h(RouterLink, { to: "/wallet" }, { default: () => t("menu.wallet") }),
    key: "/wallet",
    icon: renderIcon(WalletOutline),
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/membership" },
        { default: () => t("menu.membership") },
      ),
    key: "/membership",
    icon: renderIcon(SchoolOutline),
  },
  {
    label: () =>
      h(RouterLink, { to: "/profile" }, { default: () => t("menu.profile") }),
    key: "/profile",
    icon: renderIcon(PersonOutline),
  },
  {
    label: () =>
      h(RouterLink, { to: "/settings" }, { default: () => t("menu.settings") }),
    key: "/settings",
    icon: renderIcon(SettingsOutline),
  },
  {
    label: () =>
      h(RouterLink, { to: "/about" }, { default: () => t("menu.about") }),
    key: "/about",
    icon: renderIcon(InformationCircleOutline),
  },
  {
    type: "divider",
    key: "d2",
  },
  {
    label: t("menu.logout"),
    key: "logout",
    icon: renderIcon(LogOutOutline),
  },
]);

const userDisplay = computed(() => {
  return getDisplayName(profile.value, user.value?.email);
});

const avatarUrl = computed(() => getAvatarUrl(profile.value));

const membershipText = computed(() => {
  const tier = mapLegacyTier(profile.value?.membership_tier);
  const status = normalizeStatus(profile.value?.membership_status);
  const tierLabel = t(`membership.tier.${tier}`);
  const statusLabel = t(`membership.status.${status}`);
  const tagType = getMembershipTagType(tier);
  const typeLabel = tagType === "warning" ? "★" : "";
  return `${typeLabel}${tierLabel} · ${statusLabel}`;
});

async function handleUpdateValue(key: string) {
  if (key === "logout") {
    await signOut();
    router.push("/login");
  }
}

watch(collapsed, () => {
  setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
  setTimeout(() => window.dispatchEvent(new Event("resize")), 400);
});
</script>

<style scoped>
:deep(.n-menu--collapsed .n-menu-item .n-menu-item-content) {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}
:deep(
  .n-menu--collapsed
    .n-menu-item
    .n-menu-item-content
    .n-menu-item-content__icon
) {
  margin-right: 0;
}
</style>
