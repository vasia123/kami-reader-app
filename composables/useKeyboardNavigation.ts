import { onMounted, onUnmounted } from 'vue'

interface KeyboardNavigationOptions {
  onLeftArrow: () => void
  onRightArrow: () => void
  onEscape: () => void
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        options.onLeftArrow()
        break
      case 'ArrowRight':
        options.onRightArrow()
        break
      case 'Escape':
        options.onEscape()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}