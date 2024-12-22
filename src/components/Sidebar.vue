<template>
  <v-app-bar app color="#878383" dark height="56">
    <v-btn icon variant="text" class="hamburger-btn" @click="toggleDrawer">
      <span :class="{ open: drawer }">
        <span class="line" />
        <span class="line" />
        <span class="line" />
      </span>
    </v-btn>
    <h1>{{ }}</h1>
  </v-app-bar>

  <!-- 사이드바 -->
  <v-navigation-drawer v-model="drawer" app temporary width="250" class="custom-drawer">
    <v-list>
      <v-list-item v-for="link in filteredLinks" :key="link.text" :to="link.to" class="v-list-item"
        :class="{ active: isActive(link.to) }" @click="handleNavigation(link.to)">
        <v-icon>{{ link.icon }}</v-icon>
        <v-list-item-title>{{ link.text }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) {
    console.error(e, 'Invalid token');
    return null;
  }
};

const drawer = ref(false);
const route = useRoute();
const router = useRouter();

const links = [
  { text: '내 정보', to: '/myinfo', icon: 'mdi-account', roles: ['USER'] },
  { text: '케이크 정보 관리', to: '/cakemanagement', icon: 'mdi-cake', roles: ['ADMIN'] },
  { text: '재고 관리', to: '/storeCakes', icon: 'mdi-cake', roles: ['USER'] },
  { text: '매장 리스트', to: '/storemanagement', icon: 'mdi-store', roles: ['ADMIN'] },
  { text: '예약 관리', to: '/reservations', icon: 'mdi-calendar', roles: ['USER'] },
  { text: '예약 상세조회', to: '/reservationinfos', icon: 'mdi-information-variant-box-outline', roles: ['USER'] },
  { text: '로그아웃', to: '/', icon: 'mdi-logout', roles: ['ADMIN', 'USER'] },
];

const userRole = getUserRole();
const filteredLinks = computed(() => links.filter((link) => link.roles.includes(userRole)));

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const handleNavigation = (to) => {
  if (to === '/') {
    localStorage.removeItem('token');
  }
  router.push(to);
  drawer.value = false;
};

const isActive = (path) => route.path === path;
</script>

<style scoped>
.hamburger-btn {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hamburger-btn span {
  position: relative;
  width: 25px;
  height: 20px;
  display: block;
  transition: transform 0.3s ease-in-out;
}

.hamburger-btn span.open {
  transform: rotate(45deg);
}

.hamburger-btn span.open .line:nth-child(1) {
  transform: translateY(9px) rotate(0deg);
}

.hamburger-btn span.open .line:nth-child(2) {
  opacity: 0;
}

.hamburger-btn span.open .line:nth-child(3) {
  transform: translateY(-9px) rotate(90deg);
}

.hamburger-btn .line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.hamburger-btn .line:nth-child(1) {
  top: 0;
}

.hamburger-btn .line:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-btn .line:nth-child(3) {
  bottom: 0;
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.custom-drawer {
  background-color: #c7cacd;
}

.v-list-item.active {
  background-color: var(--v-theme-primary-lighten1);
  color: var(--v-theme-on-primary);
}
</style>
