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
                <v-icon large color="white">mdi-view-dashboard</v-icon>
              </div>
              <div class="dashboard-content">
                <div class="d-flex align-center">
                  <h3 class="text-h6 mb-1">오늘의 예약</h3>
                  <v-chip class="ml-4" color="primary" small>
                    {{ todayReservations.length }}건
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="mb-3" />

            <v-expansion-panels v-if="todayReservations.length > 0">
              <template v-for="reservation in todayReservations" :key="reservation.id">
                <v-expansion-panel>
                  <template #title>
                    <div class="d-flex justify-space-between align-center">
                      <span>{{ reservation.customer_name }} - {{ formatTime(reservation.pickup_time) }}</span>
                      <v-chip small :color="getStatusColor(reservation.status)" dark>
                        {{ getStatusText(reservation.status) }}
                      </v-chip>
                    </div>
                  </template>
                  <template #text>
                    <v-list dense>
                      <v-list-item>
                        <div>
                          <div class="text-subtitle-1">주문 케이크</div>
                          <div class="text-body-2 grey--text">{{ reservation.cake_name }}</div>
                        </div>
                      </v-list-item>
                      <v-list-item>
                        <div>
                          <div class="text-subtitle-1">연락처</div>
                          <div class="text-body-2 grey--text">{{ reservation.phone }}</div>
                        </div>
                      </v-list-item>
                      <v-list-item>
                        <div>
                          <div class="text-subtitle-1">픽업 시간</div>
                          <div class="text-body-2 grey--text">{{ formatDateTime(reservation.pickup_time) }}</div>
                        </div>
                      </v-list-item>
                      <v-list-item v-if="reservation.memo">
                        <div>
                          <div class="text-subtitle-1">메모</div>
                          <div class="text-body-2 grey--text">{{ reservation.memo }}</div>
                        </div>
                      </v-list-item>
                    </v-list>
                  </template>
                </v-expansion-panel>
              </template>
            </v-expansion-panels>
            <div v-else class="text-center pa-4 grey--text">
              오늘의 예약이 없습니다
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
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
                <v-list-item v-for="cake in groupedSortedByStock.whole" :key="cake.id" :class="[
                  'cake-list-item',
                  { 'low-stock-warning': cake.stock <= 5 }
                ]">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-icon v-if="cake.stock <= 5" color="error" small class="mr-2">
                        mdi-bell-alert
                      </v-icon>
                      <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    </div>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedSortedByStock.piece.length > 0">
                <div class="cake-group-header">피스케이크</div>
                <v-list-item v-for="cake in groupedSortedByStock.piece" :key="cake.id" :class="[
                  'cake-list-item',
                  { 'low-stock-warning': cake.stock <= 5 }
                ]">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-icon v-if="cake.stock <= 5" color="error" small class="mr-2">
                        mdi-bell-alert
                      </v-icon>
                      <span class="cake-name">{{ cake.cakeInfo.name.substring(2) }}</span>
                    </div>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>

              <template v-if="groupedSortedByStock.spoon.length > 0">
                <div class="cake-group-header">떠먹는케이크</div>
                <v-list-item v-for="cake in groupedSortedByStock.spoon" :key="cake.id" :class="[
                  'cake-list-item',
                  { 'low-stock-warning': cake.stock <= 5 }
                ]">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-icon v-if="cake.stock <= 5" color="error" small class="mr-2">
                        mdi-bell-alert
                      </v-icon>
                      <span class="cake-name">{{ cake.cakeInfo.name }}</span>
                    </div>
                    <span class="stock-value">{{ cake.stock }}개</span>
                  </div>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="dashboard-section">
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <div class="dashboard-icon error">
                <v-icon large color="white">mdi-alert-circle-outline</v-icon>
              </div>
              <div class="dashboard-content">
                <h3 class="text-h6 mb-1">0개 이하</h3>
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
              항목이 없습니다
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

// 재고 많은 순으로 정렬된 케이크 목록 (재고가 0인 항목 제외)
const sortedByStock = computed(() => {
  return [...storeCakes.value]
    .filter(cake => cake.stock > 0)  // 재고가 0보다 큰 항목만 필터링
    .sort((a, b) => b.stock - a.stock);
});

// 부족 재고 케이크 목록 (0개)
const lowStockCakes = computed(() => {
  return storeCakes.value
    .filter(cake => cake.stock < 1)  // 이미 0개 포함
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
    const [cakesResponse, reservationsResponse] = await Promise.all([
      api.get('/storeCakes'),
      api.get('/reservations/store')
    ]);
    storeCakes.value = cakesResponse.data;
    reservations.value = reservationsResponse.data;
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

const reservations = ref([]);

// 오늘 날짜의 예약만 필터링
const todayReservations = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return reservations.value.filter(reservation =>
    reservation.pickup_time.startsWith(today)
  );
});

// 시간 포맷 함수
const formatTime = (datetime) => {
  return new Date(datetime).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 예약 상태에 따른 색상
const getStatusColor = (status) => {
  const colors = {
    'pending': 'warning',
    'confirmed': 'success',
    'completed': 'info',
    'cancelled': 'error'
  };
  return colors[status] || 'grey';
};

// 예약 상태 텍스트
const getStatusText = (status) => {
  const statusText = {
    'pending': '대기중',
    'confirmed': '확정',
    'completed': '완료',
    'cancelled': '취소'
  };
  return statusText[status] || '알 수 없음';
};
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
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
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

.low-stock-warning {
  background-color: rgba(244, 67, 54, 0.05) !important;
}

.cake-list-item {
  transition: all 0.3s ease;
}
</style>
