<template>
  <div class="h-screen w-screen flex bg-[var(--color-bg-body)]">
    <!-- Left: Brand Section -->
    <div class="hidden lg:flex w-1/2 bg-gradient-to-bl from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] items-center justify-center relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--color-brand-primary)] opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div class="z-10 text-center px-12">
        <h1 class="text-5xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
          {{ t('auth.register.title') }}
        </h1>
        <p class="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          {{ t('auth.register.subtitle') }}
        </p>
        
        <div class="mt-16 grid grid-cols-2 gap-6 max-w-lg mx-auto">
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#00D2B4"><RocketOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">{{ t('auth.register.features.fastExecution') }}</div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ t('auth.register.features.realTimeSimulation') }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#3B82F6"><AnalyticsOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">{{ t('auth.register.features.deepAnalytics') }}</div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ t('auth.register.features.performanceTracking') }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#A855F7"><PeopleOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">{{ t('auth.register.features.community') }}</div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ t('auth.register.features.globalLeaderboards') }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#F59E0B"><SchoolOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">{{ t('auth.register.features.academy') }}</div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ t('auth.register.features.learnFromPros') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Register Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h2 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{{ t('auth.register.createAccount') }}</h2>
          <p class="text-[var(--color-text-secondary)]">{{ t('auth.register.prompt') }}</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
        >
          <n-form-item path="name" :label="t('auth.register.fullName')">
            <n-input 
              v-model:value="model.name" 
              :placeholder="t('auth.register.placeholders.name')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="PersonOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="email" :label="t('auth.register.email')">
            <n-input 
              v-model:value="model.email" 
              :placeholder="t('auth.register.placeholders.email')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="MailOutline" />
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="password" :label="t('auth.register.password')">
            <n-input
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              :placeholder="t('auth.register.placeholders.password')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="confirmPassword" :label="t('auth.register.confirmPassword')">
            <n-input
              v-model:value="model.confirmPassword"
              type="password"
              show-password-on="click"
              :placeholder="t('auth.register.placeholders.confirmPassword')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="CheckmarkCircleOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="agree" :show-label="false">
            <n-checkbox v-model:checked="model.agree">
              {{ t('auth.register.terms.agree') }} 
              <router-link to="/terms-of-service" class="text-[var(--color-brand-primary)] hover:underline">{{ t('auth.register.terms.tos') }}</router-link>
              {{ t('auth.register.terms.and') }} 
              <router-link to="/privacy-policy" class="text-[var(--color-brand-primary)] hover:underline">{{ t('auth.register.terms.privacy') }}</router-link>
            </n-checkbox>
          </n-form-item>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            :disabled="!model.agree"
            @click="handleRegister"
            class="mb-6 font-bold"
          >
            {{ t('auth.register.createAccount') }}
          </n-button>
          
          <div class="mt-8 text-center text-[var(--color-text-secondary)] text-sm">
            {{ t('auth.register.alreadyHaveAccount') }} 
            <router-link to="/login" class="text-[var(--color-brand-primary)] font-bold hover:underline">
              {{ t('auth.register.signIn') }}
            </router-link>
          </div>
        </n-form>
      </div>
      
      <!-- Mobile Only Brand Header -->
      <div class="absolute top-8 left-8 lg:hidden">
        <div class="text-xl font-bold text-[var(--color-brand-primary)] tracking-wide">
          STONKS ONLY
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  NForm, NFormItem, NInput, NButton, NCheckbox, NIcon, useMessage,
  FormInst, FormItemRule
} from 'naive-ui'
import { 
  MailOutline, 
  LockClosedOutline, 
  PersonOutline,
  CheckmarkCircleOutline,
  RocketOutline,
  AnalyticsOutline,
  PeopleOutline,
  SchoolOutline
} from '@vicons/ionicons5'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const { signUp } = useAuth()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const model = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const rules = computed(() => ({
  name: {
    required: true,
    message: t('auth.register.messages.inputName'),
    trigger: ['input', 'blur']
  },
  email: {
    required: true,
    message: t('auth.register.messages.inputEmail'),
    trigger: ['input', 'blur']
  },
  password: {
    required: true,
    message: t('auth.register.messages.inputPassword'),
    trigger: ['input', 'blur']
  },
  confirmPassword: [
    {
      required: true,
      message: t('auth.register.messages.confirmPassword'),
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule: FormItemRule, value: string) => {
        return value === model.value.password || new Error(t('auth.register.messages.passwordMismatch'))
      },
      trigger: ['input', 'blur']
    }
  ],
  agree: {
    validator: (_rule: FormItemRule, value: boolean) => {
      return value || new Error(t('auth.register.messages.agreeTerms'))
    },
    trigger: 'change'
  }
}))

function handleRegister(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      const { data, error } = await signUp(model.value.email, model.value.password, {
        full_name: model.value.name
      })
      
      if (error) {
        console.error('Registration Error:', error)
        message.error(error.message || 'Registration failed')
      } else if (data?.session) {
        message.success(t('auth.register.messages.success'))
        router.push('/')
      } else {
        message.success('Registration successful! Please check your email for verification.')
        router.push('/login')
      }
      loading.value = false
    }
  })
}
</script>
