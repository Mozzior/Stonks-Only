import { createI18n } from 'vue-i18n'
import enUS from '../locales/en-US'
import zhCN from '../locales/zh-CN'

const messages = {
  'en-US': enUS,
  'zh-CN': zhCN
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('language') || navigator.language || 'en-US',
  fallbackLocale: 'en-US',
  messages,
  globalInjection: true,
  datetimeFormats: {
    'en-US': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: 'numeric', minute: 'numeric'
      }
    },
    'zh-CN': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false
      }
    }
  },
  numberFormats: {
    'en-US': {
      currency: {
        style: 'currency', currency: 'USD'
      },
      percent: {
        style: 'percent', minimumFractionDigits: 2
      }
    },
    'zh-CN': {
      currency: {
        style: 'currency', currency: 'CNY'
      },
      percent: {
        style: 'percent', minimumFractionDigits: 2
      }
    }
  }
})

export default i18n
