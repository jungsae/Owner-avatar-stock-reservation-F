<template>
  <v-container>
    <h1 style="text-align: center;">
      매장 관리
    </h1>

    <!-- 로딩 상태 -->
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary"
      class="my-5 mx-auto"
    />

    <!-- 매장 목록 -->
    <div v-else>
      <v-btn
        color="primary"
        class="mb-4"
        @click="openAddDialog"
      >
        새로운 매장 추가
      </v-btn>
      <div v-if="stores.length === 0">
        <p style="text-align: center;">
          표시할 매장이 없습니다.
        </p>
      </div>
      <v-card
        v-for="store in stores"
        :key="store.id"
        class="mb-3"
        outlined
        width="300"
      >
        <v-card-title>{{ store.name }}</v-card-title>
        <v-card-text>
          <div><strong>아이디:</strong> {{ store.username }}</div>
          <div><strong>역할:</strong> {{ store.role }}</div>
          <div><strong>활성 상태:</strong> {{ store.is_active ? '활성' : '비활성' }}</div>
          <div><strong>생성일:</strong> {{ formatDate(store.createdAt) }}</div>
          <div><strong>수정일:</strong> {{ formatDate(store.updatedAt) }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            small
            :color="store.is_active ? 'warning' : 'success'"
            @click="toggleActiveState(store)"
          >
            {{ store.is_active ? '블락' : '활성화하기' }}
          </v-btn>
          <v-btn
            small
            color="error"
            @click="confirmDelete(store)"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- 추가/삭제 다이얼로그 -->
    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>매장 추가</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.name"
              label="매장 이름"
              outlined
              dense
              required
            />
            <v-text-field
              v-model="form.username"
              label="아이디"
              outlined
              dense
              required
            />
            <v-text-field
              v-model="form.password"
              label="비밀번호"
              outlined
              dense
              type="password"
              :required="!form.id"
            />
            <v-select
              v-model="form.role"
              :items="roles"
              label="역할"
              outlined
              dense
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            @click="saveStore"
          >
            저장
          </v-btn>
          <v-btn
            text
            @click="closeDialog"
          >
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>삭제 확인</v-card-title>
        <v-card-text>
          <p>정말 삭제하시겠습니까?</p>
          <p>삭제 후에는 복구할 수 없습니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            @click="deleteConfirmedStore"
          >
            삭제
          </v-btn>
          <v-btn
            text
            @click="closeDeleteDialog"
          >
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

// 상태 관리
const stores = ref([]);
const dialog = ref(false);
const deleteDialog = ref(false);
const isLoading = ref(false);
const storeToDelete = ref(null);

const roles = ['USER', 'ADMIN']; // 역할 옵션

const form = ref({
  id: null,
  name: '',
  username: '',
  password: '',
  role: '',
});

// 유틸리티 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
};

// 데이터 가져오기
const fetchStores = async () => {
  try {
    isLoading.value = true;
    const response = await api.get('/stores');
    stores.value = response.data || [];
  } catch (error) {
    console.error('매장 데이터를 가져오는 중 오류 발생:', error);
  } finally {
    isLoading.value = false;
  }
};

// 다이얼로그 열기/닫기
const openAddDialog = () => {
  form.value = { id: null, name: '', username: '', password: '', role: '' };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const confirmDelete = (store) => {
  storeToDelete.value = store;
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  storeToDelete.value = null;
};

// 매장 저장
const saveStore = async () => {
  try {
    await api.post('/stores/signup', form.value);
    closeDialog(); // 다이얼로그 닫기
    fetchStores(); // 목록 갱신
  } catch (error) {
    console.error('매장 저장 중 오류 발생:', error.response?.data?.message || error.message);
  }
};

// 매장 활성 상태 토글
const toggleActiveState = async (store) => {
  const originalState = store.is_active;
  store.is_active = !originalState; // UI에서 즉시 변경
  try {
    await api.put(`/stores/${store.id}`, { is_active: store.is_active });
  } catch (error) {
    console.error('활성 상태 변경 중 오류 발생:', error);
    store.is_active = originalState; // 실패 시 롤백
  }
};

// 매장 삭제
const deleteConfirmedStore = async () => {
  try {
    if (storeToDelete.value) {
      await api.delete(`/stores/${storeToDelete.value.id}`);
      fetchStores();
    }
  } catch (error) {
    console.error('매장 삭제 중 오류 발생:', error);
  } finally {
    closeDeleteDialog();
  }
};

onMounted(fetchStores);
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1.5rem;
}
.my-5 {
  margin: 1rem 0;
}
</style>
