import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/rooms',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/Register.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('@/pages/Rooms.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat/:id',
      name: 'chat',
      component: () => import('@/pages/Chat.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'rooms' }
  }

  return true
})

export default router
