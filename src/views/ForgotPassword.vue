<template>
  <div class="h-screen w-screen flex bg-[var(--color-bg-body)]">
    <!-- Left: Brand Section (Hidden on mobile) -->
    <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] items-center justify-center relative overflow-hidden">
      <div class="absolute top-0 left-0 w-96 h-96 bg-[var(--color-brand-primary)] opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 opacity-10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      
      <div class="z-10 text-center px-12">
        <h1 class="text-5xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
          {{ t('auth.forgotPassword.title') }}
        </h1>
        <p class="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          {{ t('auth.forgotPassword.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Right: Forgot Password Form -->
    <div class="w-full lg:w-1/2 flex flex-col p-8 relative h-full overflow-y-auto">
      <div class="w-full max-w-md mx-auto my-auto">
        <div class="mb-10">
          <h2 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{{ t('auth.forgotPassword.title') }}</h2>
          <p class="text-[var(--color-text-secondary)]">{{ t('auth.forgotPassword.subtitle') }}</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
        >
          <n-form-item path="contact" :label="t('auth.forgotPassword.inputPlaceholder')">
            <n-input 
              v-model:value="model.contact" 
              :placeholder="t('auth.forgotPassword.inputPlaceholder')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="MailOutline" />
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="captcha" :label="t('auth.forgotPassword.captcha')">
            <n-input-group>
              <n-input
                v-model:value="model.captcha"
                :placeholder="t('auth.forgotPassword.captcha')"
                @keydown.enter.prevent
              >
                <template #prefix>
                  <n-icon :component="KeyOutline" />
                </template>
              </n-input>
              <n-button 
                ghost 
                :disabled="countdown > 0" 
                @click="sendCode"
                class="w-32"
              >
                {{ countdown > 0 ? `${countdown}s` : t('auth.forgotPassword.sendCode') }}
              </n-button>
            </n-input-group>
          </n-form-item>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleSubmit"
            class="mb-6 font-bold"
          >
            {{ t('auth.forgotPassword.submit') }}
          </n-button>
          
          <div class="text-center">
            <router-link to="/login" class="flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors">
              <n-icon :component="ArrowBackOutline" />
              {{ t('auth.forgotPassword.backToLogin') }}
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
  NForm, NFormItem, NInput, NButton, NIcon, NInputGroup, useMessage,
  FormInst
} from 'naive-ui'
import { 
  MailOutline, 
  KeyOutline,
  ArrowBackOutline
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const { t } = useI18n()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const countdown = ref(0)

const model = ref({
  contact: '',
  captcha: ''
})

const rules = computed(() => ({
  contact: {
    required: true,
    message: t('auth.forgotPassword.messages.inputRequired'),
    trigger: ['input', 'blur']
  },
  captcha: {
    required: true,
    message: t('auth.forgotPassword.messages.captchaRequired'),
    trigger: ['input', 'blur']
  }
}))

function sendCode() {
  if (!model.value.contact) {
    message.warning(t('auth.forgotPassword.messages.inputRequired'))
    return
  }
  
  // Simulate sending code
  message.success(t('auth.forgotPassword.messages.codeSent'))
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function handleSubmit(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      // Simulate API call
      setTimeout(() => {
        message.success(t('auth.forgotPassword.messages.success'))
        loading.value = false
        // Redirect to login or reset password page
        setTimeout(() => router.push('/login'), 1500)
      }, 1000)
    }
  })
}
</script>