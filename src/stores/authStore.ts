import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '../infrastructure/services/AuthService'
import { LoginCommand } from '../application/commands/LoginCommand'
import { LoadImpostosCommand } from '../application/commands/LoadImpostosCommand'
import { ImpostoService } from '../infrastructure/services/ImpostoService'
import { useRouter } from 'vue-router'
import { setSessionExpiration, clearSessionExpiration } from '../shared/composables/useSessionExpiry'

// Tipos para os erros de campo
interface FieldErrors {
    email?: string[]
    password?: string[]
}

// Tipo para o estado da store
interface AuthState {
    user: {
        email: string
        fullName: string
        roles: string[]
    } | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    isPageReady: boolean
    fieldErrors: FieldErrors
    authChecked: boolean
}

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter()
    let authCheckId = 0

    // Estado reativo com tipagem explícita
    const state = ref<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isPageReady: false,
        fieldErrors: {},
        authChecked: false
    })

    const markPageReady = () => {
        state.value.isPageReady = true
    }

    const clearErrors = () => {
        state.value.error = null
        state.value.fieldErrors = {}
    }

        const updateUserInfo = (userInfo: { fullName?: string; email?: string }) => {
        if (state.value.user) {
            state.value.user = {
                ...state.value.user,
                ...userInfo
            }
        }
    }

    const resolvePostLoginRoute = async (): Promise<string> => {
        const result = await ImpostoService.loadImpostos(new LoadImpostosCommand())
        if (!result.success || !result.data?.taxCodes) {
            return '/codigo'
        }

        const hasConfiguredCodes = Object.values(result.data.taxCodes).some(
            (codes) =>
                (codes.debito ?? '').trim() !== '' &&
                codes.debito !== '_' &&
                (codes.credito ?? '').trim() !== '' &&
                codes.credito !== '_'
        )

        return hasConfiguredCodes ? '/' : '/codigo'
    }

    const login = async (email: string, password: string) => {
        authCheckId++
        state.value.isLoading = true
        clearErrors()

        try {
            const command = new LoginCommand(email, password)
            const result = await AuthService.login(command)

            if (result.success && result.user) {
                state.value.user = result.user
                state.value.isAuthenticated = true
                state.value.authChecked = true
                if (result.expiration) {
                    setSessionExpiration(result.expiration)
                }
                const redirectTo = await resolvePostLoginRoute()
                await router.push(redirectTo)
            } else {
                state.value.error = result.message || 'Erro ao fazer login'

                // Tratamento específico para erros de campo
                if (result.fieldErrors) {
                    state.value.fieldErrors = {
                        email: result.fieldErrors.email,
                        password: result.fieldErrors.password
                    }

                }
            }
        } catch (err: any) {
            console.error('Login error:', err)
            state.value.error = err.response?.data?.message || 'Ocorreu um erro durante o login'
        } finally {
            state.value.isLoading = false
        }
    }

    const logout = async () => {
        state.value.isLoading = true
        clearErrors()

        try {
            const result = await AuthService.logout()

            if (result.success) {
                state.value.user = null
                state.value.isAuthenticated = false
                clearSessionExpiration()
                await router.push('/access')
            } else {
                state.value.error = result.message || 'Erro ao fazer logout'
            }
        } catch (err: any) {
            console.error('Logout error:', err)
            state.value.error = err.response?.data?.message || 'Ocorreu um erro durante o logout'
        } finally {
            state.value.isLoading = false
        }
    }

    const checkAuth = async (): Promise<boolean> => {
        if (state.value.authChecked) {
            return state.value.isAuthenticated
        }

        const currentCheckId = ++authCheckId

        try {
            const result = await AuthService.checkAuth()

            if (currentCheckId !== authCheckId) {
                return state.value.isAuthenticated
            }

            if (result.success && result.user) {
                state.value.user = {
                    email: result.user.email,
                    fullName: result.user.fullName,
                    roles: result.user.roles || []
                }
                state.value.isAuthenticated = true
                state.value.authChecked = true
                return true
            }

            if (!state.value.isAuthenticated) {
                state.value.user = null
            }
            state.value.authChecked = true
            return state.value.isAuthenticated
        } catch (err) {
            console.error('Auth check error:', err)

            if (currentCheckId !== authCheckId) {
                return state.value.isAuthenticated
            }

            if (!state.value.isAuthenticated) {
                state.value.user = null
            }
            state.value.authChecked = true
            return state.value.isAuthenticated
        }
    }

    return {
        // Estado
        user: computed(() => state.value.user),
        isAuthenticated: computed(() => state.value.isAuthenticated),
        isLoading: computed(() => state.value.isLoading),
        error: computed(() => state.value.error),
        isPageReady: computed({
            get: () => state.value.isPageReady,
            set: (val) => state.value.isPageReady = val
        }), fieldErrors: computed(() => state.value.fieldErrors),
        authChecked: computed(() => state.value.authChecked),

        // Ações
        login,
        logout,
        checkAuth,
        markPageReady,
        clearErrors,
        updateUserInfo
    }
})