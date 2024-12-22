<template>
  <v-container
    class="d-flex align-center justify-center"
    style="
    width: 100%; 
    height: 100vh; 
    background-color: #d0d3db; 
    padding: 0;
    "
  >
    <v-card
      elevation="6"
      style="width: 400px; max-width: 90%; padding: 10px; border-radius: 12px;"
    >
      <v-card-title
        class="text-h5 text-center"
        style="font-weight: bold;"
      >
        <v-icon class="mr-4">
          mdi-login
        </v-icon>
      </v-card-title>

      <!-- 안내 메시지 -->
      <v-alert
        v-if="logoutMessage"
        type="warning"
        class="mb-3"
        style="text-align: center;"
        dismissible
      >
        {{ logoutMessage }}
      </v-alert>

      <!-- 로그인 실패 메시지 -->
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-3"
        style="text-align: center;"
        dismissible
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card-text style="margin-top: 3%;">
        <v-form>
          <v-text-field
            v-model="username"
            label="아이디"
            outlined
            dense
          />
          <v-text-field
            v-model="password"
            label="비밀번호"
            type="password"
            outlined
            dense
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn
          :disabled="!isFormValid"
          :ripple="false"
          size="x-large"
          block
          color="black"
          class="no-hover-effect"
          style="margin-top: -8%;"
          @click="login"
        >
          <strong>
            로그인
          </strong>
        </v-btn>
      </v-card-actions>
      <div
        class="text-center mt-1"
        style="font-size: 0.9rem; color: #555;"
      >
        가입 문의
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const logoutMessage = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const isFormValid = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== '';
});

onMounted(() => {
  logoutMessage.value = localStorage.getItem('logoutMessage') || '';
  localStorage.removeItem('logoutMessage');
});

// 로그인 함수
const login = async () => {
  try {
    const user = await authStore.login({ username: username.value, password: password.value });
    if (user.role === 'ADMIN') {
      router.push('/storemanagement');
    } else {
      router.push('/reservations');
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = '로그인에 실패했습니다. 다시 시도해주세요.';
  }
};
</script>

<style scoped>
</style>
