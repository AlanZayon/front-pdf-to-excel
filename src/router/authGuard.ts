import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  const isAuth = await authStore.checkAuth()

  if (to.meta.requiresAuth && !isAuth) {
    next('/access')
  } else if (to.meta.requiresGuest && isAuth) {
    next('/')
  } else {
    next()
  }
}
