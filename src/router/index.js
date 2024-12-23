// /**
//  * router/index.js
//  *
//  * Automatic routes for `./src/pages/*.vue`
//  */
import { createRouter, createWebHistory } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import { routes } from 'vue-router/auto-routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.token) {
    authStore.restoreSession();
  }

  if (to.path === '/') {
    return next();
  }

  if (!authStore.isTokenValid()) {
    authStore.logout();
    localStorage.setItem('logoutMessage', '로그인 시간이 만료되었습니다.');
    localStorage.setItem('redirectPath', to.fullPath);
    return next('/');
  }

  next();
});

export default router;
