<template>
  <div class="h-screen w-screen flex bg-[var(--color-bg-body)]">
    <!-- Left: Brand Section -->
    <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] items-center justify-center relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-[var(--color-brand-primary)] opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 opacity-10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      
      <div class="z-10 text-center px-12">
        <h1 class="text-5xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
          Master the <span class="text-[var(--color-brand-primary)]">Market</span>
        </h1>
        <p class="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Professional-grade stock training platform. Practice with historical data, simulate trades, and refine your strategy risk-free.
        </p>
        
        <div class="mt-12 flex justify-center gap-4">
          <div class="p-4 bg-[var(--color-bg-card)] backdrop-blur-sm rounded-2xl border border-[var(--color-border)]">
            <div class="text-2xl font-bold text-[var(--color-brand-primary)]">100%</div>
            <div class="text-sm text-[var(--color-text-secondary)]">Risk Free</div>
          </div>
          <div class="p-4 bg-[var(--color-bg-card)] backdrop-blur-sm rounded-2xl border border-[var(--color-border)]">
            <div class="text-2xl font-bold text-blue-400">Real</div>
            <div class="text-sm text-[var(--color-text-secondary)]">Market Data</div>
          </div>
          <div class="p-4 bg-[var(--color-bg-card)] backdrop-blur-sm rounded-2xl border border-[var(--color-border)]">
            <div class="text-2xl font-bold text-purple-400">Pro</div>
            <div class="text-sm text-[var(--color-text-secondary)]">Analytics</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h2 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Welcome back</h2>
          <p class="text-[var(--color-text-secondary)]">Please enter your details to sign in.</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
        >
          <n-form-item path="email" label="Email Address">
            <n-input 
              v-model:value="model.email" 
              placeholder="name@example.com"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="MailOutline" />
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="password" label="Password">
            <n-input
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              placeholder="••••••••"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <div class="flex items-center justify-between mb-6">
            <n-checkbox v-model:checked="model.rememberMe">
              Remember me
            </n-checkbox>
            <a href="#" class="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] hover:underline text-sm">
              Forgot password?
            </a>
          </div>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleLogin"
            class="mb-6 font-bold"
          >
            Sign In
          </n-button>
          
          <n-divider class="text-[var(--color-text-secondary)] text-xs">OR CONTINUE WITH</n-divider>
          
          <div class="grid grid-cols-2 gap-4 mb-8">
            <n-button ghost class="w-full">
              <template #icon><n-icon :component="LogoGoogle" /></template>
              Google
            </n-button>
            <n-button ghost class="w-full">
              <template #icon><n-icon :component="LogoApple" /></template>
              Apple
            </n-button>
          </div>

          <div class="mt-8 text-center text-[var(--color-text-secondary)] text-sm">
            Don't have an account? 
            <router-link to="/register" class="text-[var(--color-brand-primary)] font-bold hover:underline">
              Sign up now
            </router-link>
          </div>
        </n-form>
      </div>
      
      <!-- Mobile Only Brand Header (visible on small screens) -->
      <div class="absolute top-8 left-8 lg:hidden">
        <div class="text-xl font-bold text-[var(--color-brand-primary)] tracking-wide">
          STONKS ONLY
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NForm, NFormItem, NInput, NButton, NCheckbox, NIcon, NDivider, useMessage,
  FormInst
} from 'naive-ui'
import { 
  MailOutline, 
  LockClosedOutline, 
  LogoGoogle, 
  LogoGithub 
} from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const model = ref({
  email: '',
  password: '',
  rememberMe: false
})

const rules = {
  email: {
    required: true,
    message: 'Please input your email',
    trigger: ['input', 'blur']
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: ['input', 'blur']
  }
}

function handleLogin(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      // Simulate API call
      setTimeout(() => {
        message.success('Welcome back!')
        loading.value = false
        router.push('/')
      }, 1000)
    } else {
      message.error('Invalid email or password')
    }
  })
}
</script>
