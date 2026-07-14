import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const isLoggedIn = ref(!!token.value)

  const login = async (_username: string, _password: string) => {
    token.value = 'dummy-token-' + Date.now()
    isLoggedIn.value = true
    localStorage.setItem('authToken', token.value)
  }

  const logout = () => {
    token.value = null
    isLoggedIn.value = false
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentProjectId')
  }

  return {
    token,
    isLoggedIn,
    login,
    logout
  }
})
