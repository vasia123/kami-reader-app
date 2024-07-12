import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, checkAuthStatus, type UserType } from '../api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<UserType | null>(null)

  const setAuth = (status: boolean, userData: UserType | null = null) => {
    isAuthenticated.value = status
    user.value = userData
  }

  const loginUser = async (credentials: { username: string; password: string }) => {
    try {
      const userData = await login(credentials)
      setAuth(true, userData)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logoutUser = async () => {
    try {
      await logout()
      setAuth(false)
      return true
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }

  const checkAuth = async () => {
    try {
      const userData = await checkAuthStatus()
      setAuth(true, userData)
    } catch (error) {
      setAuth(false)
    }
  }

  return { isAuthenticated, user, loginUser, logoutUser, checkAuth }
})