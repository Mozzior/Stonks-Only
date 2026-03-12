<template>
  <div class="h-screen w-screen flex bg-[var(--color-bg-body)]">
    <!-- Left: Brand Section -->
    <div class="hidden lg:flex w-1/2 bg-gradient-to-bl from-[var(--color-brand-secondary)] to-[var(--color-bg-sidebar)] items-center justify-center relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--color-brand-primary)] opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div class="z-10 text-center px-12">
        <h1 class="text-5xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
          Join the <span class="text-[var(--color-brand-primary)]">Elite</span>
        </h1>
        <p class="text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Start your journey to financial mastery. Create your account today and get instant access to professional trading tools.
        </p>
        
        <div class="mt-16 grid grid-cols-2 gap-6 max-w-lg mx-auto">
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#00D2B4"><RocketOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">Fast Execution</div>
              <div class="text-xs text-[var(--color-text-secondary)]">Real-time simulation</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#3B82F6"><AnalyticsOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">Deep Analytics</div>
              <div class="text-xs text-[var(--color-text-secondary)]">Performance tracking</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#A855F7"><PeopleOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">Community</div>
              <div class="text-xs text-[var(--color-text-secondary)]">Global leaderboards</div>
            </div>
          </div>
          <div class="flex items-center gap-4 text-left p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <n-icon size="32" color="#F59E0B"><SchoolOutline /></n-icon>
            <div>
              <div class="font-bold text-[var(--color-text-primary)]">Academy</div>
              <div class="text-xs text-[var(--color-text-secondary)]">Learn from pros</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Register Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
      <div class="w-full max-w-md">
        <div class="mb-10">
          <h2 class="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Create Account</h2>
          <p class="text-[var(--color-text-secondary)]">Join thousands of traders improving every day.</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
        >
          <n-form-item path="name" label="Full Name">
            <n-input 
              v-model:value="model.name" 
              placeholder="John Doe"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="PersonOutline" />
              </template>
            </n-input>
          </n-form-item>

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
              placeholder="Create a strong password"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="LockClosedOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="confirmPassword" label="Confirm Password">
            <n-input
              v-model:value="model.confirmPassword"
              type="password"
              show-password-on="click"
              placeholder="Repeat your password"
              @keydown.enter.prevent
            >
              <template #prefix>
                <n-icon :component="CheckmarkCircleOutline" />
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="agree" :show-label="false">
            <n-checkbox v-model:checked="model.agree">
              I agree to the <a href="#" class="text-[var(--color-brand-primary)] hover:underline">Terms of Service</a> and <a href="#" class="text-[var(--color-brand-primary)] hover:underline">Privacy Policy</a>
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
            Create Account
          </n-button>
          
          <div class="mt-8 text-center text-[var(--color-text-secondary)] text-sm">
            Already have an account? 
            <router-link to="/login" class="text-[var(--color-brand-primary)] font-bold hover:underline">
              Sign in
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const model = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const rules = {
  name: {
    required: true,
    message: 'Please input your name',
    trigger: ['input', 'blur']
  },
  email: {
    required: true,
    message: 'Please input your email',
    trigger: ['input', 'blur']
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: ['input', 'blur']
  },
  confirmPassword: [
    {
      required: true,
      message: 'Please confirm your password',
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule: FormItemRule, value: string) => {
        return value === model.value.password || new Error('Two passwords do not match')
      },
      trigger: ['input', 'blur']
    }
  ],
  agree: {
    validator: (_rule: FormItemRule, value: boolean) => {
      return value || new Error('Please agree to the terms')
    },
    trigger: 'change'
  }
}

function handleRegister(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      setTimeout(() => {
        message.success('Account created successfully!')
        loading.value = false
        router.push('/')
      }, 1000)
    }
  })
}
</script>
