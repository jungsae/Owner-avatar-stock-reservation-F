<template>
  <v-app>
    <Sidebar v-if="showSidebar" />

    <v-main class="main-content">
      <router-view />
    </v-main>

    <AppFooter v-if="showFooter" />
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import AppFooter from './components/AppFooter.vue';

const route = useRoute();

// 로그인 페이지인지 확인
const showSidebar = computed(() => route.path !== '/');
const showFooter = computed(() => route.path !== '/');
</script>

<style scoped>

</style>
