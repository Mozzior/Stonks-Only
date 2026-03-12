import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useOsTheme, darkTheme, lightTheme } from 'naive-ui'
import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('dark')
const candleColorMode = ref<'standard' | 'chinese'>('standard') // standard: green up, red down; chinese: red up, green down
const osTheme = useOsTheme()

// Persist theme preference
const STORAGE_KEY = 'stp-theme-mode'
const CANDLE_COLOR_KEY = 'stp-candle-color-mode'

// CSS Variables for Tailwind (sync with style.css)
const updateCssVariables = (isDark: boolean) => {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
    root.style.setProperty('--color-bg-body', '#0F172A')
    root.style.setProperty('--color-bg-card', '#1E293B')
    root.style.setProperty('--color-bg-sidebar', '#0B1120')
    root.style.setProperty('--color-text-primary', '#F8FAFC')
    root.style.setProperty('--color-text-secondary', '#94A3B8')
    root.style.setProperty('--color-border', '#334155')
  } else {
    root.classList.remove('dark')
    root.style.setProperty('--color-bg-body', '#F1F5F9')
    root.style.setProperty('--color-bg-card', '#FFFFFF')
    root.style.setProperty('--color-bg-sidebar', '#FFFFFF')
    root.style.setProperty('--color-text-primary', '#0F172A')
    root.style.setProperty('--color-text-secondary', '#64748B')
    root.style.setProperty('--color-border', '#E2E8F0')
  }
}

export function useTheme() {
  const currentTheme = computed<GlobalTheme | null>(() => {
    if (themeMode.value === 'system') {
      return osTheme.value === 'dark' ? darkTheme : lightTheme
    }
    return themeMode.value === 'dark' ? darkTheme : lightTheme
  })

  const isDark = computed(() => {
    if (themeMode.value === 'system') {
      return osTheme.value === 'dark'
    }
    return themeMode.value === 'dark'
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    const dark = isDark.value
    return {
      common: {
        primaryColor: '#00D2B4',
        primaryColorHover: '#33E5CD',
        primaryColorPressed: '#00A890',
        primaryColorSuppl: '#00D2B4',
        bodyColor: dark ? '#0F172A' : '#F1F5F9',
        cardColor: dark ? '#1E293B' : '#FFFFFF',
        textColorBase: dark ? '#F8FAFC' : '#0F172A',
        textColor1: dark ? '#F8FAFC' : '#0F172A',
        textColor2: dark ? '#CBD5E1' : '#334155',
        textColor3: dark ? '#94A3B8' : '#64748B',
        borderColor: dark ? '#334155' : '#E2E8F0',
        inputColor: dark ? '#0B1120' : '#FFFFFF',
        borderRadius: '8px',
        borderRadiusSmall: '4px',
        heightMedium: '40px',
        fontSizeMedium: '14px',
      },
      Layout: {
        color: dark ? '#0F172A' : '#F1F5F9',
        headerColor: dark ? '#0B1120' : '#FFFFFF',
        siderColor: dark ? '#0B1120' : '#FFFFFF',
        headerBorderColor: dark ? '#334155' : '#E2E8F0',
        siderBorderColor: dark ? '#334155' : '#E2E8F0',
      },
      Card: {
        color: dark ? '#1E293B' : '#FFFFFF',
        borderColor: dark ? '#334155' : '#E2E8F0',
        textColor: dark ? '#F8FAFC' : '#0F172A',
        titleTextColor: dark ? '#F8FAFC' : '#0F172A',
        borderRadius: '12px',
        boxShadow: dark 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
      Menu: {
        itemColorActive: dark ? 'rgba(0, 210, 180, 0.15)' : 'rgba(0, 210, 180, 0.1)',
        itemColorHover: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        itemIconColor: dark ? '#94A3B8' : '#64748B',
        itemIconColorActive: '#00D2B4',
        itemIconColorHover: dark ? '#F8FAFC' : '#0F172A',
        itemTextColor: dark ? '#CBD5E1' : '#334155',
        itemTextColorActive: '#00D2B4',
        itemTextColorHover: dark ? '#F8FAFC' : '#0F172A',
      },
      Button: {
        textColor: dark ? '#F8FAFC' : '#0F172A',
        textColorGhost: dark ? '#F8FAFC' : '#0F172A',
        border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
      },
      Input: {
        color: dark ? '#0B1120' : '#FFFFFF',
        textColor: dark ? '#F8FAFC' : '#0F172A',
        border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
      },
      Statistic: {
        labelTextColor: dark ? '#94A3B8' : '#64748B',
        valueTextColor: dark ? '#F8FAFC' : '#0F172A',
      }
    }
  })

  // Watch for theme changes
  watch(isDark, (newValue) => {
    updateCssVariables(newValue)
  }, { immediate: true })

  // Initialize
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode
    if (saved) {
      themeMode.value = saved
    }
    const savedCandle = localStorage.getItem(CANDLE_COLOR_KEY) as 'standard' | 'chinese'
    if (savedCandle) {
      candleColorMode.value = savedCandle
    }
  })

  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
  }

  const setCandleColorMode = (mode: 'standard' | 'chinese') => {
    candleColorMode.value = mode
    localStorage.setItem(CANDLE_COLOR_KEY, mode)
  }

  return {
    themeMode,
    currentTheme,
    themeOverrides,
    isDark,
    setTheme,
    candleColorMode,
    setCandleColorMode
  }
}
