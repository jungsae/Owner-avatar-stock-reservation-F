<template>
  <v-container>
    <v-card class="mx-auto mt-5 pa-4 shadow-box" max-width="600px" outlined>
      <v-card-title class="d-flex align-center justify-center pa-4" style="background-color: #F5F5F5;">
        <v-icon large color="grey" class="mr-2">
          mdi-store
        </v-icon>
        <h2 style="text-align: center; color: #424242;">
          마이페이지
        </h2>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-storefront
              </v-icon>
              <strong>매장명:</strong>
              <span>{{ storeInfo.name }}</span>
            </p>
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-account
              </v-icon>
              <strong>아이디:</strong>
              <span>{{ storeInfo.username }}</span>
            </p>
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-calendar
              </v-icon>
              <strong>가입일:</strong>
              <span>{{ formatDate(storeInfo.createdAt) }}</span>
            </p>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row justify="center">
          <v-btn color="red darken-2" dark text @click="openDeleteDialog">
            <v-icon left>
              mdi-account-remove
            </v-icon>
            회원 탈퇴
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <h3 style="color: #B71C1C; text-align: center;">
            회원 탈퇴
          </h3>
        </v-card-title>
        <v-card-text>
          <div style="text-align: center;">
            <p>정말로 회원 탈퇴를 진행하시겠습니까?</p>
            <p>탈퇴 이후에는 복구는 문의바랍니다.</p>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="error" @click="deleteAccount">
            <v-icon left>
              mdi-delete
            </v-icon>
            탈퇴
          </v-btn>
          <v-btn text @click="closeDeleteDialog">
            <v-icon left>
              mdi-cancel
            </v-icon>
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 상태 관리
const storeInfo = ref({});
const deleteDialog = ref(false);
const isLoading = ref(false);
const authStore = useAuthStore();

// 유틸리티 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

// 매장 정보 가져오기
const fetchStoreInfo = async () => {
  try {
    isLoading.value = true;
    const response = await api.get('/stores');
    storeInfo.value = response.data;
  } catch (error) {
    console.error('매장 정보를 가져오는 중 오류 발생:', error);
  } finally {
    isLoading.value = false;
  }
};

// 회원 탈퇴 다이얼로그 열기/닫기
const openDeleteDialog = () => {
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
};

const deleteAccount = async () => {
  try {
    await api.put(`/stores/${authStore.user.store_id}`, { is_active: false });
    alert('회원 탈퇴가 완료되었습니다.');
    closeDeleteDialog();
    router.push('/');
  } catch (error) {
    alert('회원 탈퇴 중 오류가 발생했습니다.');
    console.error(error.response?.data?.message || error.message);
  }
};

onMounted(fetchStoreInfo);
</script>

<style scoped>
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mt-5 {
  margin-top: 2rem;
}

.pa-4 {
  padding: 1.5rem;
}

.info-item {
  font-size: 1.4rem;
  line-height: 2.8;
  display: flex;
  align-items: center;
}

.my-4 {
  margin: 1.5rem 0;
}

.shadow-box {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.text-center {
  text-align: center;
}

@media (max-width: 467px) {
  .info-item {
    font-size: 1.4rem;
    line-height: 1.5;
    flex-direction: column;
    align-items: flex-start;
  }

  .my-4 {
    margin: 1rem 0;
  }

  .pa-4 {
    padding: 1rem;
  }
}
</style>
