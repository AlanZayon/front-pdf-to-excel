import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService } from '../infrastructure/services/AuthService'
import { LoginCommand } from '../application/commands/LoginCommand'

import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter()
    const user = ref<{ email: string; fullName: string; roles: string[] } | null>(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isPageReady = ref(false)

    const markPageReady = () => {
        isPageReady.value = true
    }

    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null
        try {
            const command = new LoginCommand(email, password)
            const result = await AuthService.login(command)

            if (result.success && result.user) {
                user.value = result.user
                isAuthenticated.value = true
                await router.push('/codigo')
            } else {
                error.value = result.message
            }
        } catch (err) {
            error.value = 'Ocorreu um erro durante o login'
            console.error(err)
        } finally {
            isLoading.value = false
        }
    }

    const logout = async () => {
        isLoading.value = true
        error.value = null
        try {
            const result = await AuthService.logout()

            if (result.success) {
                user.value = null
                isAuthenticated.value = false
                await router.push('/access')
            } else {
                error.value = result.message
            }
        } catch (err) {
            error.value = 'Ocorreu um erro durante o logout'
            console.error(err)
        } finally {
            isLoading.value = false
        }
    }

    const checkAuth = async (): Promise<boolean> => {
        isLoading.value = true
        error.value = null
        try {
            const result = await AuthService.checkAuth()

            if (result.success && result.user) {
                user.value = {
                    email: result.user.email,
                    fullName: result.user.fullName,
                    roles: result.user.roles || []
                }
                isAuthenticated.value = true
                return true
            } else {
                user.value = null
                isAuthenticated.value = false
                return false
            }
        } catch (err) {
            console.error('Erro ao verificar autenticação:', err)
            user.value = null
            isAuthenticated.value = false
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
        isPageReady,
        markPageReady
    }
})