import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './authGuard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../interfaces/views/UploadPdfView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/access',
      name: 'login',
      component: () => import('../interfaces/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../interfaces/views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/codigo',
      name: 'codigo',
      component: () => import('../interfaces/views/CodigoConta.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('../interfaces/views/ResetPassword.vue'),
      meta: { requiresGuest: true }
    },
  ]
})

router.beforeEach(authGuard)

export default router