<template>
  <div class="h-screen w-screen flex bg-[var(--color-bg-body)]">
    <!-- Left: Brand Section -->
    <div
      class="hidden lg:flex w-1/2 bg-gradient-to-tr from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] items-center justify-center relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-primary)] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 opacity-10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"
      ></div>

      <div class="z-10 text-center px-12">
        <h1 class="text-4xl font-bold text-[var(--color-text-primary)] mb-6">
          {{ t("auth.changePassword.title") }}
        </h1>
        <p
          class="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed"
        >
          {{ t("auth.changePassword.subtitle") }}
        </p>
      </div>
    </div>

    <!-- Right: Change Password Form -->
    <div
      class="w-full lg:w-1/2 flex flex-col p-8 relative h-full overflow-y-auto"
    >
      <div class="w-full max-w-md mx-auto my-auto">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {{ t("auth.changePassword.title") }}
          </h2>
          <p class="text-[var(--color-text-secondary)]">
            {{ t("auth.changePassword.subtitle") }}
          </p>
        </div>

        <n-form ref="formRef" :model="model" :rules="rules" size="large">
          <n-form-item
            path="oldPassword"
            :label="t('auth.changePassword.oldPassword')"
          >
            <n-input
              v-model:value="model.oldPassword"
              type="password"
              show-password-on="click"
              placeholder="••••••••"
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            path="newPassword"
            :label="t('auth.changePassword.newPassword')"
          >
            <n-input
              v-model:value="model.newPassword"
              type="password"
              show-password-on="click"
              placeholder="••••••••"
              @input="calculateStrength"
            >
              <template #prefix>
                <n-icon :component="KeyOutline" />
              </template>
            </n-input>
          </n-form-item>

          <!-- Password Strength Indicator -->
          <div class="mb-6" v-if="model.newPassword">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-[var(--color-text-secondary)]">{{
                t("auth.changePassword.strength")
              }}</span>
              <span :class="strengthColorClass">{{ strengthText }}</span>
            </div>
            <div class="flex gap-1 h-1.5">
              <div
                class="flex-1 rounded-full transition-colors duration-300"
                :class="
                  strength >= 1
                    ? strengthColorClassBg
                    : 'bg-[var(--color-border)]'
                "
              ></div>
              <div
                class="flex-1 rounded-full transition-colors duration-300"
                :class="
                  strength >= 2
                    ? strengthColorClassBg
                    : 'bg-[var(--color-border)]'
                "
              ></div>
              <div
                class="flex-1 rounded-full transition-colors duration-300"
                :class="
                  strength >= 3
                    ? strengthColorClassBg
                    : 'bg-[var(--color-border)]'
                "
              ></div>
            </div>
          </div>

          <n-form-item
            path="confirmNewPassword"
            :label="t('auth.changePassword.confirmNewPassword')"
          >
            <n-input
              v-model:value="model.confirmNewPassword"
              type="password"
              show-password-on="click"
              placeholder="••••••••"
            >
              <template #prefix>
                <n-icon :component="CheckmarkCircleOutline" />
              </template>
            </n-input>
          </n-form-item>

          <div class="flex gap-4 mt-8">
            <n-button
              secondary
              size="large"
              class="flex-1"
              @click="router.back()"
            >
              {{ t("common.cancel") }}
            </n-button>
            <n-button
              type="primary"
              size="large"
              class="flex-1 font-bold"
              :loading="loading"
              @click="handleSubmit"
              :disabled="strength < 1"
            >
              {{ t("auth.changePassword.submit") }}
            </n-button>
          </div>
        </n-form>
      </div>

      <!-- Mobile Only Brand Header -->
      <div class="absolute top-8 left-8 lg:hidden">
        <div
          class="text-xl font-bold text-[var(--color-brand-primary)] tracking-wide"
        >
          STONKS ONLY
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NIcon,
  useMessage,
  FormInst,
  FormItemRule,
} from "naive-ui";
import {
  LockClosedOutline,
  KeyOutline,
  CheckmarkCircleOutline,
} from "@vicons/ionicons5";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const message = useMessage();
const { t } = useI18n();
const { updatePassword } = useAuth();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const strength = ref(0);

const model = ref({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const rules = computed(() => ({
  oldPassword: {
    required: true,
    message: t("auth.changePassword.messages.oldRequired"),
    trigger: ["input", "blur"],
  },
  newPassword: {
    required: true,
    message: t("auth.changePassword.messages.newRequired"),
    trigger: ["input", "blur"],
  },
  confirmNewPassword: [
    {
      required: true,
      message: t("auth.changePassword.messages.confirmRequired"),
      trigger: ["input", "blur"],
    },
    {
      validator: (_rule: FormItemRule, value: string) => {
        return (
          value === model.value.newPassword ||
          new Error(t("auth.changePassword.messages.mismatch"))
        );
      },
      trigger: ["input", "blur"],
    },
  ],
}));

function calculateStrength() {
  const pwd = model.value.newPassword;
  let score = 0;
  if (!pwd) {
    strength.value = 0;
    return;
  }
  if (pwd.length > 6) score++;
  if (pwd.length > 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  // Normalize to 0-3 scale for 3 bars
  if (score < 2)
    strength.value = 1; // Weak
  else if (score < 4)
    strength.value = 2; // Medium
  else strength.value = 3; // Strong
}

const strengthText = computed(() => {
  if (strength.value === 1) return t("auth.changePassword.weak");
  if (strength.value === 2) return t("auth.changePassword.medium");
  if (strength.value === 3) return t("auth.changePassword.strong");
  return "";
});

const strengthColorClass = computed(() => {
  if (strength.value === 1) return "text-red-500";
  if (strength.value === 2) return "text-yellow-500";
  if (strength.value === 3) return "text-green-500";
  return "";
});

const strengthColorClassBg = computed(() => {
  if (strength.value === 1) return "bg-red-500";
  if (strength.value === 2) return "bg-yellow-500";
  if (strength.value === 3) return "bg-green-500";
  return "";
});

function handleSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true;

      const { error } = await updatePassword(
        model.value.newPassword,
        model.value.oldPassword,
      );

      if (error) {
        message.error(error.message);
      } else {
        message.success(t("auth.changePassword.messages.success"));
        router.back();
      }
      loading.value = false;
    }
  });
}
</script>
