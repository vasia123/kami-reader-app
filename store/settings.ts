import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

interface LastPosition {
  mangaId: string
  chapterId: string
  page: number
}

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()
  
  const theme = ref('light')
  const fontSize = ref('medium')
  const lastPositions = ref<LastPosition[]>([])

  const loadUserSettings = async () => {
    if (authStore.isAuthenticated) {
      try {
        // Здесь должен быть API-запрос для получения настроек пользователя
        const userSettings = await fetch('/api/user-settings').then(res => res.json())
        theme.value = userSettings.theme
        fontSize.value = userSettings.fontSize
        lastPositions.value = userSettings.lastPositions
      } catch (error) {
        console.error('Failed to load user settings:', error)
      }
    }
  }

  const saveUserSettings = async () => {
    if (authStore.isAuthenticated) {
      try {
        // Здесь должен быть API-запрос для сохранения настроек пользователя
        await fetch('/api/user-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: theme.value, fontSize: fontSize.value, lastPositions: lastPositions.value })
        })
      } catch (error) {
        console.error('Failed to save user settings:', error)
      }
    }
  }

  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    saveUserSettings()
  }

  const setFontSize = (newSize: string) => {
    fontSize.value = newSize
    saveUserSettings()
  }

  const getLastPosition = (mangaId: string, chapterId: string): number | null => {
    const position = lastPositions.value.find(p => p.mangaId === mangaId && p.chapterId === chapterId)
    return position ? position.page : null
  }

  const saveLastPosition = (mangaId: string, chapterId: string, page: number) => {
    const index = lastPositions.value.findIndex(p => p.mangaId === mangaId && p.chapterId === chapterId)
    if (index !== -1) {
      lastPositions.value[index].page = page
    } else {
      lastPositions.value.push({ mangaId, chapterId, page })
    }
    saveUserSettings()
  }

  return {
    theme,
    fontSize,
    loadUserSettings,
    setTheme,
    setFontSize,
    getLastPosition,
    saveLastPosition
  }
})