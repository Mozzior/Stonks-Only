<template>
  <div class="w-full max-w-7xl mx-auto space-y-6">
    <!-- Header / Profile Cover -->
    <div
      class="relative bg-gradient-to-r from-[var(--color-bg-sidebar)] to-[var(--color-bg-card)] rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] h-64"
    >
      <!-- Background Pattern -->
      <div
        class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      ></div>

      <!-- User Info Overlay -->
      <div
        class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[var(--color-bg-sidebar)] to-transparent flex items-end gap-6"
      >
        <div class="relative group">
          <n-avatar
            round
            :size="120"
            :src="avatarUrl"
            class="border-4 border-[var(--color-bg-body)] shadow-2xl"
          />
          <n-tooltip trigger="hover">
            <template #trigger>
              <div
                class="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-9 h-9 bg-[var(--color-brand-primary)] rounded-full cursor-pointer transition-all shadow-lg ring-2 ring-white opacity-0 flex items-center justify-center z-10"
                :class="
                  uploadingAvatar
                    ? 'pointer-events-none'
                    : 'group-hover:opacity-100 hover:scale-105'
                "
                @click="triggerAvatarPicker"
                aria-label="更换头像"
              >
                <n-icon
                  size="18"
                  :component="CameraOutline"
                  class="text-[var(--color-bg-body)]"
                />
              </div>
            </template>
            <span>点击更换头像</span>
          </n-tooltip>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onAvatarSelected"
          />
        </div>

        <div class="flex-1 mb-2">
          <div class="flex items-center gap-3">
            <h1
              class="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight"
            >
              {{ displayName }}
            </h1>
            <n-tag
              :type="membershipTagType as any"
              round
              size="small"
              :bordered="false"
              class="font-bold"
            >
              <template #icon><n-icon :component="RibbonOutline" /></template>
              {{ membershipLabel }}
            </n-tag>
          </div>
          <p
            class="text-[var(--color-text-secondary)] mt-1 flex items-center gap-2"
          >
            <n-icon :component="MailOutline" /> {{ user?.email ?? "--" }}
            <span class="text-[var(--color-border)]">|</span>
            <n-icon :component="CalendarOutline" />
            {{ t("profile.info.joined", { date: joinedText }) }}
          </p>
          <p class="text-[var(--color-text-secondary)] mt-1">
            {{ t("training.header.accountBalance") }}: ${{
              trainingBalanceText
            }}
          </p>
          <div
            v-if="isEditing"
            class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl"
          >
            <n-input
              v-model:value="editDisplayName"
              :placeholder="t('profile.info.editProfile')"
            />
          </div>
        </div>

        <div class="flex gap-3 mb-2">
          <n-button type="primary" secondary @click="toggleEdit">
            <template #icon><n-icon :component="CreateOutline" /></template>
            {{ isEditing ? t("common.cancel") : t("profile.info.editProfile") }}
          </n-button>
          <n-button secondary v-if="isEditing" @click="saveProfileBasic">
            <template #icon><n-icon :component="CreateOutline" /></template>
            {{ t("common.save") }}
          </n-button>
          <n-button secondary v-else>
            <template #icon
              ><n-icon :component="ShareSocialOutline"
            /></template>
            {{ t("profile.info.shareStats") }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Stats & Radar -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Trading Radar -->
        <n-card
          :title="t('profile.radar.title')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] h-80 overflow-hidden"
        >
          <div class="h-full flex items-center justify-center relative p-4">
            <!-- Radar Chart Placeholder (SVG) -->
            <svg
              viewBox="0 0 200 200"
              class="w-full h-full max-w-[200px] max-h-[200px]"
            >
              <!-- Grid -->
              <polygon
                points="100,20 180,65 180,155 100,200 20,155 20,65"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="1"
              />
              <polygon
                points="100,50 160,80 160,140 100,170 40,140 40,80"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="1"
              />
              <!-- Data Shape -->
              <polygon
                points="100,30 170,70 150,145 100,180 50,130 30,75"
                fill="rgba(0, 210, 180, 0.2)"
                stroke="var(--color-brand-primary)"
                stroke-width="2"
              />
              <!-- Labels -->
              <text
                x="100"
                y="15"
                text-anchor="middle"
                fill="var(--color-text-secondary)"
                font-size="10"
                dy="-5"
              >
                Discipline
              </text>
              <text
                x="190"
                y="60"
                text-anchor="start"
                fill="var(--color-text-secondary)"
                font-size="10"
                dx="5"
              >
                Win Rate
              </text>
              <text
                x="190"
                y="160"
                text-anchor="start"
                fill="var(--color-text-secondary)"
                font-size="10"
                dx="5"
              >
                Risk Mgmt
              </text>
              <text
                x="100"
                y="210"
                text-anchor="middle"
                fill="var(--color-text-secondary)"
                font-size="10"
                dy="10"
              >
                Consistency
              </text>
              <text
                x="10"
                y="160"
                text-anchor="end"
                fill="var(--color-text-secondary)"
                font-size="10"
                dx="-5"
              >
                Profit Factor
              </text>
              <text
                x="10"
                y="60"
                text-anchor="end"
                fill="var(--color-text-secondary)"
                font-size="10"
                dx="-5"
              >
                Activity
              </text>
            </svg>
          </div>
        </n-card>

        <!-- Detailed Stats List -->
        <n-card
          :title="t('profile.stats.title')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]"
        >
          <n-list hoverable clickable>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">{{
                  t("profile.stats.bestWinStreak")
                }}</span>
                <span class="text-[var(--color-text-primary)] font-bold"
                  >12 Trades</span
                >
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">{{
                  t("profile.stats.avgHoldTime")
                }}</span>
                <span class="text-[var(--color-text-primary)] font-bold"
                  >4h 25m</span
                >
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">{{
                  t("profile.stats.largestWin")
                }}</span>
                <span class="text-[var(--color-success)] font-bold"
                  >+$4,250.00</span
                >
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-text-secondary)] text-sm">{{
                  t("profile.stats.largestLoss")
                }}</span>
                <span class="text-[var(--color-error)] font-bold"
                  >-$1,120.00</span
                >
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>

      <!-- Right Column: Recent Activity & Badges -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Badges Collection -->
        <n-card
          :title="t('profile.badges.title')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]"
        >
          <template #header-extra>
            <n-button text size="small" type="primary">{{
              t("profile.badges.viewAll")
            }}</n-button>
          </template>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
              >
                <n-icon
                  size="24"
                  :component="TrophyOutline"
                  class="text-yellow-500"
                />
              </div>
              <span
                class="text-xs font-bold text-[var(--color-text-primary)] text-center"
                >First 100k</span
              >
              <span class="text-[10px] text-[var(--color-text-secondary)]"
                >Oct 24, 2023</span
              >
            </div>
            <div
              class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
              >
                <n-icon
                  size="24"
                  :component="TrendingUpOutline"
                  class="text-blue-500"
                />
              </div>
              <span
                class="text-xs font-bold text-[var(--color-text-primary)] text-center"
                >Profit Streak</span
              >
              <span class="text-[10px] text-[var(--color-text-secondary)]"
                >Nov 02, 2023</span
              >
            </div>
            <div
              class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] transition-colors group cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
              >
                <n-icon
                  size="24"
                  :component="SchoolOutline"
                  class="text-purple-500"
                />
              </div>
              <span
                class="text-xs font-bold text-[var(--color-text-primary)] text-center"
                >Scholar</span
              >
              <span class="text-[10px] text-[var(--color-text-secondary)]"
                >Dec 15, 2023</span
              >
            </div>
            <div
              class="flex flex-col items-center p-4 bg-[var(--color-bg-sidebar)] rounded-xl border border-[var(--color-border)] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
            >
              <div
                class="w-12 h-12 rounded-full bg-[var(--color-border)]/20 flex items-center justify-center mb-2"
              >
                <n-icon
                  size="24"
                  :component="LockClosedOutline"
                  class="text-[var(--color-text-secondary)]"
                />
              </div>
              <span
                class="text-xs font-bold text-[var(--color-text-secondary)] text-center"
                >Millionaire</span
              >
              <span class="text-[10px] text-[var(--color-text-secondary)]">{{
                t("profile.badges.locked")
              }}</span>
            </div>
          </div>
        </n-card>

        <!-- Account Security / Settings Preview -->
        <n-card
          :title="t('profile.security.title')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]"
        >
          <n-list>
            <n-list-item>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <n-icon
                    size="20"
                    :component="ShieldCheckmarkOutline"
                    class="text-[var(--color-success)]"
                  />
                  <div>
                    <div class="text-[var(--color-text-primary)] font-medium">
                      {{ t("profile.security.twoFactor") }}
                    </div>
                    <div class="text-xs text-[var(--color-text-secondary)]">
                      {{ t("profile.security.twoFactorDesc") }}
                    </div>
                  </div>
                </div>
                <n-button size="small" secondary>{{
                  t("profile.security.manage")
                }}</n-button>
              </div>
            </n-list-item>
            <n-list-item>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <n-icon
                    size="20"
                    :component="KeyOutline"
                    class="text-blue-400"
                  />
                  <div>
                    <div class="text-[var(--color-text-primary)] font-medium">
                      {{ t("profile.security.password") }}
                    </div>
                    <div class="text-xs text-[var(--color-text-secondary)]">
                      {{ t("profile.security.passwordDesc") }}
                    </div>
                  </div>
                </div>
                <router-link to="/change-password">
                  <n-button size="small" secondary>{{
                    t("profile.security.update")
                  }}</n-button>
                </router-link>
              </div>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";
import {
  NCard,
  NAvatar,
  NButton,
  NIcon,
  NTag,
  NList,
  NListItem,
  NInput,
  useMessage,
  NTooltip,
} from "naive-ui";
import {
  CameraOutline,
  MailOutline,
  CalendarOutline,
  CreateOutline,
  ShareSocialOutline,
  RibbonOutline,
  TrophyOutline,
  TrendingUpOutline,
  SchoolOutline,
  LockClosedOutline,
  ShieldCheckmarkOutline,
  KeyOutline,
} from "@vicons/ionicons5";
import { updateProfileBasic } from "../services/userProfileRepo";
import { supabase } from "../utils/supabase";
import {
  getAvatarUrl,
  getDisplayName,
  getMembershipTagType,
  mapLegacyTier,
  normalizeStatus,
} from "../utils/userProfile";

const { t } = useI18n();
const message = useMessage();
const { user, profile, refreshProfile } = useAuth();
const isEditing = ref(false);
const editDisplayName = ref("");
const editAvatarUrl = ref("");
const avatarInputRef = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);

const displayName = computed(() =>
  getDisplayName(profile.value, user.value?.email),
);

const membershipLabel = computed(() => {
  const tier = mapLegacyTier(profile.value?.membership_tier);
  const status = normalizeStatus(profile.value?.membership_status);
  const tierLabel = t(`membership.tier.${tier}`);
  const statusLabel = t(`membership.status.${status}`);
  return `${tierLabel} • ${statusLabel}`;
});

const membershipTagType = computed(() =>
  getMembershipTagType(mapLegacyTier(profile.value?.membership_tier)),
);

const avatarUrl = computed(() => getAvatarUrl(profile.value));

const joinedText = computed(() => {
  if (!profile.value?.created_at) return "--";
  return new Date(profile.value.created_at).toLocaleDateString();
});

const trainingBalanceText = computed(() =>
  Number(profile.value?.training_balance ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
);

function toggleEdit() {
  if (isEditing.value) {
    isEditing.value = false;
    return;
  }
  editDisplayName.value = profile.value?.display_name ?? displayName.value;
  editAvatarUrl.value = profile.value?.avatar_url ?? "";
  isEditing.value = true;
}

async function saveProfileBasic() {
  if (!user.value) return;
  const { error } = await updateProfileBasic(user.value.id, {
    display_name: editDisplayName.value.trim() || null,
    avatar_url: editAvatarUrl.value.trim() || null,
  });
  if (error) {
    message.error(error.message);
    return;
  }
  await refreshProfile();
  isEditing.value = false;
  message.success(t("common.save"));
}

function triggerAvatarPicker() {
  if (uploadingAvatar.value) return;
  avatarInputRef.value?.click();
}

async function onAvatarSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !user.value) return;
  uploadingAvatar.value = true;
  try {
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.value.id}/${Date.now()}.${ext}`;
    let publicUrl: string | null = null;

    for (const bucket of ["avatars", "public"]) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!error && data) {
        const pub = supabase.storage.from(bucket).getPublicUrl(data.path);
        publicUrl = pub.data.publicUrl;
        break;
      }
    }

    if (!publicUrl) {
      message.error("头像上传失败，请检查存储桶配置");
      return;
    }

    const { error: updateError } = await updateProfileBasic(user.value.id, {
      avatar_url: publicUrl,
    });
    if (updateError) {
      message.error(updateError.message);
      return;
    }
    await refreshProfile();
    message.success("头像已更新");
  } finally {
    uploadingAvatar.value = false;
    if (avatarInputRef.value) avatarInputRef.value.value = "";
  }
}
</script>
