<template>
  <v-container>
    <v-card class="mx-auto mb-8 pa-4 shadow-box" max-width="100%" outlined>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-storefront
              </v-icon>
              <strong>매장명: {{ storeInfo.name }}</strong>
            </p>
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-account
              </v-icon>
              <strong>아이디: {{ storeInfo.username }}</strong>
            </p>
            <p class="info-item">
              <v-icon small color="grey" class="mr-2">
                mdi-calendar
              </v-icon>
              <strong>가입일: {{ storeInfo.createdAt }}</strong>
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

    <h2 class="text-h5 mb-4 font-weight-bold" style="color: #424242;">
      <v-icon large color="primary" class="mr-2">mdi-view-dashboard</v-icon>
      매장 현황
    </h2>

    <v-row>
      <v-col cols="12">
        <v-card class="dashboard-section mb-4">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <div class="dashboard-icon primary">
                <v-icon large color="white">mdi-cake-variant</v-icon>
              </div>
              <div class="dashboard-content">
                <h3 class="text-h6 mb-1">총 케이크 종류</h3>
              </div>
            </div>

            <v-divider class="mb-3" />

            <v-list>
              <template v-if="groupedCakes.whole.length > 0">
                <div class="cake-group-header">홀케이크</div>
                <v-list-item v-for="cake in groupedCakes.whole" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedCakes.piece.length > 0">
                <div class="cake-group-header">피스케이크</div>
                <v-list-item v-for="cake in groupedCakes.piece" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name.substring(2) }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedCakes.spoon.length > 0">
                <div class="cake-group-header">떠먹는케이크</div>
                <v-list-item v-for="cake in groupedCakes.spoon" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="dashboard-section mb-4">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <div class="dashboard-icon success">
                <v-icon large color="white">mdi-package-variant</v-icon>
              </div>
              <div class="dashboard-content">
                <h3 class="text-h6 mb-1">총 재고</h3>
              </div>
            </div>

            <v-divider class="mb-3" />

            <v-list>
              <template v-if="groupedSortedByStock.whole.length > 0">
                <div class="cake-group-header">홀케이크</div>
                <v-list-item v-for="cake in groupedSortedByStock.whole" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedSortedByStock.piece.length > 0">
                <div class="cake-group-header">피스케이크</div>
                <v-list-item v-for="cake in groupedSortedByStock.piece" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name.substring(2) }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedSortedByStock.spoon.length > 0">
                <div class="cake-group-header">떠먹는케이크</div>
                <v-list-item v-for="cake in groupedSortedByStock.spoon" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="dashboard-section">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <div class="dashboard-icon error">
                <v-icon large color="white">mdi-alert-circle-outline</v-icon>
              </div>
              <div class="dashboard-content">
                <h3 class="text-h6 mb-1">부족 재고</h3>
              </div>
            </div>

            <v-divider class="mb-3" />

            <v-list v-if="lowStockCakes.length > 0">
              <template v-if="groupedLowStock.whole.length > 0">
                <div class="cake-group-header">홀케이크</div>
                <v-list-item v-for="cake in groupedLowStock.whole" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value error--text">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedLowStock.piece.length > 0">
                <div class="cake-group-header">피스케이크</div>
                <v-list-item v-for="cake in groupedLowStock.piece" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name.substring(2) }}</span>
                    <span class="stock-value error--text">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedLowStock.spoon.length > 0">
                <div class="cake-group-header">떠먹는케이크</div>
                <v-list-item v-for="cake in groupedLowStock.spoon" :key="cake.id" class="cake-list-item">
                  <div class="d-flex justify-space-between align-center">
                    <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    <span class="stock-value error--text">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>
            </v-list>
            <div v-else class="text-center pa-4 grey--text">
              부족 재고 항목이 없습니다
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
            <p>탈퇴 이후 복구는 문의바랍니다.</p>
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
import { ref, onMounted, computed } from 'vue';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 상태 관리
const storeInfo = ref({});
const deleteDialog = ref(false);
const isLoading = ref(false);
const authStore = useAuthStore();

const storeCakes = ref([]);

// 재고 많은 순으로 정렬된 케이크 목록
const sortedByStock = computed(() => {
  return [...storeCakes.value].sort((a, b) => b.stock - a.stock);
});

// 부족 재고 케이크 목록 (10개 미만)
const lowStockCakes = computed(() => {
  return storeCakes.value
    .filter(cake => cake.stock < 3)
    .sort((a, b) => a.stock - b.stock);
});

// 케이크 타입별로 분류하는 함수
const groupCakesByType = (cakes) => {
  return {
    piece: cakes.filter(cake => cake.cakeInfo.name.startsWith('p.')),
    spoon: cakes.filter(cake => cake.cakeInfo.name.startsWith('떠먹는')),
    whole: cakes.filter(cake => !cake.cakeInfo.name.startsWith('p.') && !cake.cakeInfo.name.startsWith('떠먹는'))
  };
};

// 각 섹션별 그룹화된 케이크 computed 속성
const groupedCakes = computed(() => groupCakesByType(storeCakes.value));
const groupedSortedByStock = computed(() => groupCakesByType(sortedByStock.value));
const groupedLowStock = computed(() => groupCakesByType(lowStockCakes.value));

// 매장 정보 가져오기
const fetchStoreInfo = async () => {
  try {
    isLoading.value = true;
    const response = await api.get('/stores');
    storeInfo.value = response.data;
    storeInfo.value.createdAt = storeInfo.value.createdAt.split('T')[0];
  } catch (error) {
    console.error('매장 정보를 가져오는 중 오류 발생:', error);
  } finally {
    isLoading.value = false;
  }
};

// 대시보드 데이터 가져오기
const fetchDashboardData = async () => {
  try {
    const response = await api.get('/storeCakes');
    storeCakes.value = response.data;
  } catch (error) {
    console.error('대시보드 데이터를 가져오는 중 오류 발생:', error);
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

// onMounted 수정
onMounted(async () => {
  await Promise.all([fetchStoreInfo(), fetchDashboardData()]);
});
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

.dashboard-card {
  transition: transform 0.2s;
  border-radius: 12px;
}

.dashboard-card:hover {
  transform: translateX(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dashboard-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.dashboard-icon.primary {
  background-color: var(--v-primary-base);
}

.dashboard-icon.success {
  background-color: var(--v-success-base);
}

.dashboard-icon.error {
  background-color: var(--v-error-base);
}

.dashboard-content {
  flex-grow: 1;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

@media (max-width: 600px) {
  .dashboard-card {
    margin-bottom: 1rem;
  }

  .dashboard-icon {
    width: 50px;
    height: 50px;
    margin-right: 15px;
  }
}

.dashboard-section {
  border-radius: 12px;
}

.cake-list-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
}

.cake-list-item:last-child {
  border-bottom: none;
}

.cake-name {
  font-weight: 500;
}

.stock-value {
  font-weight: bold;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 24px;
}

@media (max-width: 600px) {
  .cake-list-item {
    padding: 4px 8px;
  }

  .dashboard-icon {
    width: 50px;
    height: 50px;
    margin-right: 15px;
  }
}

@media (max-width: 600px) {
  .info-item {
    font-size: 1rem;
    line-height: 2;
    padding: 0.3rem 0;
  }

  .info-item strong {
    margin-right: 0.5rem;
  }

  .info-item .v-icon {
    margin-right: 0.5rem !important;
  }
}

.cake-group-header {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #424242;
  font-size: 0.95rem;
  padding: 8px 16px;
  text-transform: none;
  letter-spacing: normal;
}

@media (max-width: 600px) {
  .cake-group-header {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
}
</style>
