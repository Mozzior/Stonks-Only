import { ref } from 'vue'

const isFullscreen = ref(false)

export function useLayoutControl() {
  function setFullscreen(value: boolean) {
    isFullscreen.value = value
  }

  return {
    isFullscreen,
    setFullscreen
  }
}
