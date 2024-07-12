<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)

const navigateHome = () => router.push('/')
const navigateProfile = () => router.push('/profile')
const handleLogin = () => router.push('/login')
const handleLogout = async () => {
  await authStore.logoutUser()
  router.push('/')
}
</script>

<template>
  <header class="bg-primary text-primary-content shadow-lg">
    <nav class="container mx-auto px-4 py-2 flex justify-between items-center">
      <div class="text-xl font-bold cursor-pointer" @click="navigateHome">MangaReader</div>
      <div>
        <button v-if="!isLoggedIn" class="btn btn-ghost" @click="handleLogin">Login</button>
        <template v-else>
          <button class="btn btn-ghost mr-2" @click="navigateProfile">Profile</button>
          <button class="btn btn-ghost" @click="handleLogout">Logout</button>
        </template>
      </div>
    </nav>
  </header>
</template>