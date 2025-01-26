<template>
  <v-app-bar app color="#878383" dark height="56">
    <v-btn icon variant="text" class="hamburger-btn" @click="toggleDrawer">
      <span :class="{ open: drawer }">
        <span class="line" />
        <span class="line" />
        <span class="line" />
      </span>
    </v-btn>

    <v-spacer></v-spacer>

    <v-menu v-model="showNotifications" :close-on-content-click="false" location="bottom end" offset="10">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="notification-btn mr-2"
          :class="{ 'has-notifications': notificationStore.unreadCount > 0 }">
          <v-badge :content="notificationStore.unreadCount" :value="notificationStore.unreadCount" color="error">
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card min-width="300" max-width="400" class="notification-menu">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-subtitle-1">알림</span>
          <v-btn v-if="notificationStore.unreadCount > 0" variant="text" density="comfortable" size="small"
            @click="notificationStore.markAllAsRead">
            모두 읽음 표시
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-list v-if="notificationStore.notifications.length > 0" class="notification-list">
          <v-list-item v-for="notification in notificationStore.notifications" :key="notification.id"
            :class="{ 'unread': !notification.read }" @click="handleNotificationClick(notification)">
            <div class="d-flex flex-column">
              <div class="text-body-2">{{ notification.message }}</div>
              <div class="text-caption text-grey">
                {{ formatNotificationTime(notification.timestamp) }}
              </div>
            </div>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text-center pa-4 text-grey">
          새로운 알림이 없습니다
        </v-card-text>
      </v-card>
    </v-menu>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { initSSEConnection } from '@/services/sseService';

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
const notificationStore = useNotificationStore();
const showNotifications = ref(false);
let sseConnection = null;

const links = [
  { text: '매장 정보', to: '/myinfo', icon: 'mdi-account', roles: ['USER'] },
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

onMounted(() => {
  sseConnection = initSSEConnection();
});

onUnmounted(() => {
  if (sseConnection) {
    sseConnection.close();
  }
});

const handleNotificationClick = (notification) => {
  notificationStore.markAsRead(notification.id);
  if (notification.type === 'stock') {
    router.push('/storeCakes');
  }
  showNotifications.value = false;
};

const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
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

.notification-btn {
  transition: transform 0.2s ease;
}

.notification-btn.has-notifications {
  animation: shake 0.5s ease-in-out;
}

.notification-menu {
  max-height: 400px;
  overflow-y: auto;
}

.notification-list .v-list-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.notification-list .v-list-item.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left-color: var(--v-theme-primary);
}

@keyframes shake {

  0%,
  100% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(10deg);
  }

  75% {
    transform: rotate(-10deg);
  }
}
</style>
