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
          <n-form-item path="email" :label="t('auth.forgotPassword.inputPlaceholder')">
            <n-input 
              v-model:value="model.email" 
              :placeholder="t('auth.forgotPassword.inputPlaceholder')"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="MailOutline" />
              </template>
            </n-input>
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
import { useI18n } from 'vue-i18n'
import { 
  NForm, NFormItem, NInput, NButton, NIcon, useMessage,
  FormInst
} from 'naive-ui'
import { 
  MailOutline, 
  ArrowBackOutline
} from '@vicons/ionicons5'
import { useAuth } from '../composables/useAuth'

const message = useMessage()
const { t } = useI18n()
const { resetPasswordForEmail } = useAuth()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const model = ref({
  email: ''
})

const rules = computed(() => ({
  email: {
    required: true,
    message: t('auth.forgotPassword.messages.inputRequired'),
    trigger: ['input', 'blur']
  }
}))

function handleSubmit(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      
      const redirectUrl = window.location.origin + '/#/update-password'
      const { error } = await resetPasswordForEmail(model.value.email, redirectUrl)
      
      if (error) {
        message.error(error.message)
      } else {
        message.success('Password reset link sent! Please check your email.')
        // router.push('/login')
      }
      loading.value = false
    }
  })
}
</script>
