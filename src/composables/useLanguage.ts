import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { locale, t } = useI18n()
  const currentLanguage = ref(localStorage.getItem('language') || 'en-US')

  const setLanguage = (lang: string) => {
    currentLanguage.value = lang
    locale.value = lang
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }

  const languageOptions = [
    { label: 'English', value: 'en-US' },
    { label: '简体中文', value: 'zh-CN' }
  ]

  // Initialize
  setLanguage(currentLanguage.value)

  return {
    currentLanguage,
    setLanguage,
    languageOptions,
    t
  }
}
