<template>
  <transition name="loading-overlay">
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
  </transition>
  <v-container>
    <h1>
      재고 현황
    </h1>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2000">
      {{ snackbarMessage }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 검색 및 정렬 -->
    <div class="d-flex align-center justify-space-between search-container">
      <div class="search-field">
        <input v-model="searchQuery" placeholder="검색" class="search-input">
      </div>
      <v-btn class="add-button" height="46" rounded @click="openAddDialog">
        재고 등록
      </v-btn>
    </div>

    <!-- 섹션별 케이크 목록 -->
    <div v-for="(cakes, section) in groupedCakes" :key="section" class="section-box">
      <h2 class="section-title">
        {{ section }}
      </h2>
      <v-row dense>
        <v-col v-for="cake in cakes" :key="cake.id" cols="6" sm="4" md="3" lg="2" class="cake-column">
          <v-card outlined class="cake-card">
            <div class="card-content" @click="showCakeByReservation(cake)">
              <v-card-text>
                <h5>{{ cake.cakeInfo.name }}</h5>
                <h5><strong>재고:</strong> {{ cake.stock }}</h5>
              </v-card-text>
              <v-img :src="getImageUrl(cake.cakeInfo.image_url)" max-height="90" max-width="100%" class="cake-image" />
            </div>
            <v-card-actions class="action-buttons">
              <v-btn size="large" color="#7d95e3" @click.stop="openEditStockDialog(cake)">
                재고 수정
              </v-btn>
              <v-btn size="large" color="error" @click.stop="confirmRemoveCake(cake)">
                판매 중지
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 케이크 추가 다이얼로그 -->
    <v-dialog v-model="addDialog">
      <v-card>
        <div style="text-align: center; margin-bottom: 3%; background-color: #9e9e9e; color: aliceblue;">
          <v-card-title>재고 등록</v-card-title>
        </div>
        <v-card-text>
          <v-row dense>
            <v-col v-for="cake in availableCakes" :key="cake.id" cols="3" md="2" lg="2" xl="2">
              <v-card outlined max-height="95" max-width="120" variant="plain"
                class="d-flex flex-column align-center pa-1" :class="{ 'selected-cake': selectedCake === cake.id }"
                @click="selectCake(cake)">
                <img :src="getImageUrl(cake.image_url)" height="60" width="70">
                <div style="font-size: 60%; text-align: center; font-weight: bold;">
                  {{ cake.name }}
                </div>
              </v-card>
            </v-col>
          </v-row>
          <div style="margin-top: 20px;">
            <v-text-field v-model="newStock" label="재고수량" type="tel" inputmode="numeric" pattern="[0-9]*" outlined dense
              required style="max-width: 300px; margin: 20px auto;" class="custom-spinner"
              :rules="[v => /^\d+$/.test(v) || '숫자만 입력 가능합니다', v => Number(v) <= 1000 || '최대 1000까지 입력 가능합니다']"
              @input="validateNumberOnly" @keypress="event => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="addCake">
            추가
          </v-btn>
          <v-btn text @click="closeAddDialog">
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 재고 수정 다이얼로그 -->
    <v-dialog v-model="editStockDialog" max-width="300px">
      <v-card class="d-flex justify-space-between align-center">
        <v-card-title>재고 수정</v-card-title>
        <v-text-field v-model="updatedStock" label="재고" type="tel" inputmode="numeric" pattern="[0-9]*" :max="1000"
          outlined dense required style="width: 80%" :rules="[
            v => /^\d+$/.test(v) || '숫자만 입력 가능합니다',
            v => Number(v) <= 1000 || '최대 1000까지 입력 가능합니다'
          ]" @input="validateNumberOnly" @keypress="event => {
            if (!/[0-9]/.test(event.key)) {
              event.preventDefault();
            }
          }" />
        <v-card-actions>
          <v-btn color="primary" @click="updateStock">
            저장
          </v-btn>
          <v-btn text @click="closeEditStockDialog">
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="removeDialog" max-width="400px">
      <v-card>
        <v-card-title>판매 중지</v-card-title>
        <v-card-text>
          <p>{{ selectedCakeForRemove?.name }} 케이크를 판매 중지하시겠습니까?</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="removeCake">
            삭제
          </v-btn>
          <v-btn text @click="closeRemoveDialog">
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 예약 현황 모달 -->
    <v-dialog v-model="reservationDialog" max-width="500px" height="500px">
      <v-card>
        <v-card-title class="text-center" style="background-color: #f5f5f5; padding: 10px;">
          {{ selectedCakeForReservation.cakeInfo.name }} 예약 현황
        </v-card-title>
        <v-card-text>
          <div v-if="Array.isArray(reservationInfo) && reservationInfo.length > 0">
            <v-table density="compact" class="reservation-table">
              <thead>
                <tr>
                  <th class="text-caption text-center">예약자</th>
                  <th class="text-caption text-center">수량</th>
                  <th class="text-caption text-center">픽업날짜</th>
                  <th class="text-caption text-center">픽업시간</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reservation in reservationInfo" :key="reservation.id">
                  <td class="text-caption text-center">{{ maskName(reservation.customer_name) }}</td>
                  <td class="text-caption text-center">{{ reservation.ReservationCake.quantity }}개</td>
                  <td class="text-caption text-center">{{ formatDate(reservation.pickup_date) }}</td>
                  <td class="text-caption text-center">{{ reservation.pickup_time }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div v-else class="text-center mt-5">
            <p><strong>예약 없음</strong></p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn width="100%" height="50" color="primary" @click="reservationDialog = false">
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/plugins/axios';
import { getImageUrl } from '@/utils/imageLoader';

const storeCakes = ref([]); // 매장 케이크 목록
const availableCakes = ref([]); // 관리자가 등록한 케이크 목록
const isLoading = ref(false);

const addDialog = ref(false);
const editStockDialog = ref(false);
const removeDialog = ref(false);

const selectedCake = ref(null); // 선택된 케이크 ID
const newStock = ref(0);
const selectedCakeForEdit = ref(null);
const updatedStock = ref(0);
const selectedCakeForRemove = ref(null);

const searchQuery = ref(""); // 검색어

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

const reservationDialog = ref(false);
const selectedCakeForReservation = ref(null);
const reservationInfo = ref({});

const showSnackbar = (message, type = 'info') => {
  snackbarMessage.value = message;
  snackbarColor.value = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue-grey';
  snackbar.value = true;
};

// 검색 및 정렬된 케이크 목록 계산
const filteredCakes = computed(() => {
  let filtered = [...storeCakes.value];

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (cake) =>
        cake.cakeInfo.name.toLowerCase().includes(query) ||
        cake.cakeInfo.description.toLowerCase().includes(query)
    );
  }
  return filtered;
});

// 섹션별로 그룹화된 케이크 목록 계산
const groupedCakes = computed(() => {
  const sections = {
    케이크: [],
    떠먹는케이크: [],
    피스케이크: [],
  };

  filteredCakes.value.forEach((cake) => {
    if (!cake.cakeInfo?.image_url) return; // 이미지 URL이 없는 경우 스킵

    // 이미지 번호 추출
    const imageNumber = parseInt(cake.cakeInfo.image_url);

    // 유효한 이미지 번호인 경우에만 처리
    if (!isNaN(imageNumber)) {

      if (imageNumber >= 1 && imageNumber <= 49) {
        sections.케이크.push(cake);
      } else if (imageNumber >= 50 && imageNumber <= 99) {
        sections.떠먹는케이크.push(cake);
      } else if (imageNumber >= 100 && imageNumber <= 150) {
        sections.피스케이크.push(cake);
      }
    }
  });

  return sections;
});

// 매장 케이크 목록 가져오기
const fetchStoreCakes = async () => {
  try {
    isLoading.value = true;
    const response = await api.get('/storeCakes');
    storeCakes.value = response.data;
  } catch (error) {
    showSnackbar(`케이크 정보를 불러오지 못했습니다. 다시 시도해주세요. ${error.response.data.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 전체 케이크 목록 가져오기
const fetchAvailableCakes = async () => {
  try {
    const response = await api.get('/cakes');
    const allCakes = response.data;
    const registeredCakeIds = new Set(storeCakes.value.map((cake) => cake.cakeInfo.id));
    availableCakes.value = allCakes.filter((cake) => !registeredCakeIds.has(cake.id));
  } catch (error) {
    showSnackbar(`케이크 정보를 불러오지 못했습니다. 다시 시도해주세요. ${error.response.data.message}`, 'error');
  }
};

// 케이크 선택
const selectCake = (cake) => {
  selectedCake.value = cake.id;
};

// 다이얼로그 열기/닫기
const openAddDialog = () => {
  if (availableCakes.value.length === 0) {
    showSnackbar('재고를 등록할 케이크가 더 이상 없습니다!', 'info');
    return;
  }

  selectedCake.value = null;
  newStock.value = '';
  addDialog.value = true;
};
const closeAddDialog = () => {
  addDialog.value = false;
  selectedCake.value = null;
  newStock.value = '';
};

const openEditStockDialog = (cake) => {
  selectedCakeForEdit.value = cake;
  updatedStock.value = cake.stock;
  editStockDialog.value = true;
};
const closeEditStockDialog = () => {
  updatedStock.value = 0;
  editStockDialog.value = false;
  selectedCakeForEdit.value = null;
};

const confirmRemoveCake = (cake) => {
  selectedCakeForRemove.value = cake;
  removeDialog.value = true;
};
const closeRemoveDialog = () => {
  removeDialog.value = false;
  selectedCakeForRemove.value = null;
};

// 케이크 추가
const addCake = async () => {
  if (Number(newStock.value) < 0) {
    showSnackbar('올바른 수량을 입력해주세요!')
    return
  }

  if (isNaN(newStock.value)) {
    showSnackbar('숫자만 입력 가능합니다!')
    return
  }

  if (Number(newStock.value) > 1000) {
    showSnackbar('최대 1000까지 입력 가능합니다!')
    return
  }

  try {
    if (!selectedCake.value) {
      showSnackbar('등록할 케이크를 선택하세요!', 'error');
      return;
    }
    // 서버에 재고 추가 요청
    await api.post('/storeCakes', {
      cake_id: selectedCake.value,
      stock: newStock.value,
    });

    showSnackbar('재고가 성공적으로 등록되었습니다!', 'success');
    await fetchStoreCakes();
    await fetchAvailableCakes();

    closeAddDialog();
  } catch (error) {
    showSnackbar(`재고 등록 중 오류가 발생했습니다 ${error.response.data.message}`, 'error');
  }
};

// 재고 수정
const updateStock = async () => {
  if (Number(updatedStock.value) < 0) {
    showSnackbar('올바른 수량을 입력해주세요!')
    return
  }

  if (isNaN(updatedStock.value)) {
    showSnackbar('숫자만 입력 가능합니다!')
    return
  }

  if (Number(updatedStock.value) > 1000) {
    showSnackbar('최대 1000까지 입력 가능합니다!')
    return
  }

  try {
    isLoading.value = true;
    await api.put(`/storeCakes/${selectedCakeForEdit.value.id}`, {
      stock: updatedStock.value,
    });

    fetchStoreCakes();
    closeEditStockDialog();
    showSnackbar('재고가 수정되었습니다!', 'success');
    isLoading.value = false;
  } catch (error) {
    showSnackbar(`재고 수정 중 오류가 발생했습니다 ${error.response.data.message}`, 'error');
  }
};

// 케이크 삭제
const removeCake = async () => {
  try {
    isLoading.value = true;
    await api.delete(`/storeCakes/${selectedCakeForRemove.value.id}`);
    closeRemoveDialog();
    fetchStoreCakes();
    fetchAvailableCakes();
    isLoading.value = false;
  } catch (error) {
    showSnackbar('케이크 삭제에 실패했습니다', error.data.message);
  }
};

const showCakeByReservation = async (cake) => {
  try {
    isLoading.value = true;
    selectedCakeForReservation.value = cake;
    const response = await api.get(`/reservations/count/${cake.cake_id}`);
    const checkCake = response.data.cake.length > 0 ? response.data.cake : {};
    reservationInfo.value = checkCake;
    isLoading.value = false;
    reservationDialog.value = true;
  } catch (error) {
    showSnackbar('예약 정보를 불러오는데 실패했습니다', error.data.message);
  }
};

const maskName = (name) => {
  if (!name) return '';
  if (name.length <= 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  });
};

const validateNumberOnly = (event) => {
  event.target.value = event.target.value.replace(/[^\d]/g, '');
};

onMounted(async () => {
  await fetchStoreCakes();
  await fetchAvailableCakes();
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.loading-overlay-enter-from,
.loading-overlay-leave-to {
  opacity: 0;
  visibility: hidden;
}

.loading-overlay-enter-to,
.loading-overlay-leave-from {
  opacity: 1;
  visibility: visible;
}

.my-5 {
  margin: 1.5rem 0;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.selected-cake {
  font-size: 95%;
  border: 3px solid #0b0707;
  box-shadow: 0 0 10px rgba(6, 10, 12, 0.5);
}

.custom-spinner input[type="number"]::-webkit-inner-spin-button {
  display: inline-block;
}

.search-container {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-field {
  max-width: 300px;
  width: 100%;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-size: 16px;
  background-color: #fff;
}

.search-input:focus {
  border-color: #42a5f5;
  box-shadow: 0 0 8px rgba(66, 165, 245, 0.5);
}

.add-button {
  background-color: #2471e4 !important;
  color: white !important;
  font-size: 14px;
  font-weight: bold;
  text-transform: none;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.add-button:hover {
  background-color: #2471e4ba !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.section-box {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 20px;
  /* 섹션 간 간격 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* 그림자 */
}

.section-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.cake-column {
  margin-bottom: 5px;
}

.cake-card {
  text-align: center;
  max-width: 300px;
  min-height: auto;
  margin: auto;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 5px 6px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  background-color: #ffffff;
  border: 4px solid #27242440;
}

.cake-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cake-image {
  margin-bottom: 2px;
}

.v-btn {
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
}

@media (max-width: 539px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 1px;
  }

  .v-btn {
    text-align: center;
  }
}

@media (max-width: 694px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 1px;
  }

  .v-btn {
    text-align: center;
  }
}

.card-content {
  cursor: pointer;
  position: relative;
  padding-bottom: 0;
}

.card-content::after {
  content: "클릭하여 예약현황 보기";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(56, 65, 69, 0.775);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.card-content:hover::after {
  opacity: 1;
}

.cake-card {
  text-align: center;
  max-width: 300px;
  min-height: auto;
  margin: auto;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 5px 6px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  background-color: #ffffff;
  border: 4px solid #27242440;
}

.cake-card .card-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-buttons {
  padding-top: 0;
  margin-top: 8px;
}

.reservation-table :deep(td),
.reservation-table :deep(th) {
  padding: 4px !important;
  height: auto !important;
}
</style>