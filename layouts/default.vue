<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import Header from '../components/SiteHeader.vue'
import Footer from '../components/SiteFooter.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  // Проверка аутентификации при загрузке приложения
  await authStore.checkAuth()
  
  // Загрузка пользовательских настроек, если пользователь авторизован
  if (authStore.isAuthenticated) {
    await settingsStore.loadUserSettings()
  }
})
</script>

<template>
  <div class="app-container">
    <Header />
    <main>
      <NuxtPage/>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>