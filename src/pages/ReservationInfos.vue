<template>
  <!-- 로딩 오버레이 추가 -->
  <transition name="loading-overlay">
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
  </transition>

  <div class="reservation-infos">
    <v-container class="print-container">
      <h1 class="text-center mb-4">예약 현황</h1>

      <v-snackbar v-model="snackbar" multi-line :color="snackbarColor" timeout="2500" class="custom-snackbar">
        {{ snackbarMessage }}
        <template #actions>
          <v-btn text @click="snackbar = false">닫기</v-btn>
        </template>
      </v-snackbar>

      <div class="d-sm-none no-print mb-2 d-flex gap-2">
        <v-btn variant="outlined" @click="showMobileFilter = !showMobileFilter" class="filter-toggle-btn flex-grow-1">
          <v-icon :icon="showMobileFilter ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="mr-2" />
          필터 {{ showMobileFilter ? '접기' : '펼치기' }}
        </v-btn>
        <v-btn variant="outlined" @click="toggleSort" class="sort-btn" :color="sortAscending ? 'primary' : 'default'">
          <v-icon :icon="sortAscending ? 'mdi-sort-clock-ascending' : 'mdi-sort-clock-descending'" class="mr-2" />
          {{ sortAscending ? '오름차순' : '내림차순' }}
        </v-btn>
      </div>

      <!-- 필터 섹션 -->
      <transition name="slide-fade">
        <div v-show="showMobileFilter || !isMobile" class="no-print filter-section">
          <v-card class="mb-4 pa-4">
            <v-form ref="form">
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-select v-model="filters.status" :items="statusOptions" label="예약 상태" clearable
                    density="comfortable" variant="outlined" hide-details class="filter-select" />
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="filters.searchQuery" label="예약자명 검색" clearable append-inner-icon="mdi-magnify"
                    density="comfortable" variant="outlined" hide-details class="filter-input" />
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" sm="6" md="3">
                  <v-text-field v-model="filters.startDate" label="시작일" type="date" clearable density="comfortable"
                    variant="outlined" hide-details class="filter-input" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field v-model="filters.endDate" label="종료일" type="date" clearable density="comfortable"
                    variant="outlined" hide-details class="filter-input" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="filters.startTime" :items="timeOptions" label="시작 시간" clearable
                    density="comfortable" variant="outlined" hide-details class="filter-select" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="filters.endTime" :items="timeOptions" label="종료 시간" clearable density="comfortable"
                    variant="outlined" hide-details class="filter-select" />
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col cols="12" class="d-flex flex-wrap gap-2">
                  <div class="d-flex gap-1 flex-grow-1">
                    <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel"
                      :loading="exporting" class="excel-button flex-grow-1">
                      엑셀 다운로드
                    </v-btn>
                    <v-btn color="grey-lighten-3" variant="elevated" :ripple="false" @click="resetFilters"
                      class="filter-button flex-grow-1">
                      초기화
                    </v-btn>
                    <v-btn color="primary" variant="elevated" :ripple="false" @click="fetchReservations"
                      :loading="loading" class="filter-button flex-grow-1">
                      검색
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </div>
      </transition>

      <!-- 데스크톱 뷰 -->
      <div class="d-none d-sm-block">
        <div class="table-container">
          <v-data-table :items="reservations" :headers="headers" :loading="loading" class="reservation-table">
            <template #[`item.cakes`]="{ item }">
              <div class="cake-list">
                <div v-for="cake in item.cakes" :key="cake.id" class="cake-item">
                  {{ cake.name }} x {{ cake.ReservationCake.quantity }}
                </div>
              </div>
            </template>
            <template #[`item.request`]="{ item }">
              <div class="request-list">
                <div v-if="item.supplies?.[0]?.length" class="supplies-list">
                  <div v-for="supply in item.supplies[0]" :key="supply.name" class="supply-item">
                    {{ supply.name }} x {{ supply.quantity }}
                  </div>
                </div>
                <div v-if="item.request" class="request-text">
                  {{ item.request }}
                </div>
              </div>
            </template>

            <template #[`item.pickup_status`]="{ item }">
              <v-chip :color="getStatusColor(item.pickup_status)" :text="getStatusText(item.pickup_status)"
                size="small" />
            </template>

            <template #[`item.pickup_time`]="{ item }">
              <div>{{ item.pickup_date?.split('T')[0] }}</div>
              <div>{{ item.pickup_time }}</div>
            </template>

            <!-- 전화번호 마스킹 추가 -->
            <template #[`item.customer_phone`]="{ item }">
              {{ maskPhoneNumber(item.customer_phone) }}
            </template>

            <template #[`item.pickup_date`]="{ item }">
              {{ item.pickup_date?.split('T')[0] }}
            </template>

            <template #[`item.created_at`]="{ item }">
              {{ item.created_at?.split('T')[0] }}
            </template>

            <!-- 주문 날짜 포맷 -->
            <template #[`item.order_date`]="{ item }">
              {{ item.order_date?.split('T')[0] }}
            </template>

            <!-- 픽업 날짜 포맷 -->
            <template #[`item.pickup_date`]="{ item }">
              {{ item.pickup_date?.split('T')[0] }}
            </template>

            <!-- 픽업 시간 포맷 -->
            <template #[`item.pickup_time`]="{ item }">
              {{ item.pickup_time }}
            </template>
          </v-data-table>
        </div>
      </div>

      <!-- 모바일 뷰 -->
      <div class="d-sm-none">
        <v-row>
          <v-col cols="12" v-for="item in reservations" :key="item.id">
            <v-card class="reservation-item">
              <v-card-text>
                <p class="mb-1 text-caption"> {{ item.order_date?.split('T')[0] }}</p>
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ item.customer_name }}
                  </div>
                  <v-chip :color="getStatusColor(item.pickup_status)" :text="getStatusText(item.pickup_status)"
                    size="small" />
                </div>

                <div class="text-body-1 mb-1">
                  {{ maskPhoneNumber(item.customer_phone) }}
                </div>

                <div class="text-body-2 mb-3">
                  <p class="mb-1">픽업 날짜: {{ item.pickup_date?.split('T')[0] }}</p>
                  <p class="mb-1">픽업 시간: {{ item.pickup_time }}</p>
                </div>

                <div class="cakes-section mb-3" v-if="item.cakes?.length">
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip v-for="cake in item.cakes" :key="cake.id" class="cake-chip">
                      {{ cake.name }} x {{ cake.ReservationCake.quantity }}
                    </v-chip>
                  </div>
                </div>

                <div class="supplies-section mb-3" v-if="item.supplies?.[0]?.length">
                  <div class="section-title mb-1">추가 요청</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip v-for="supply in item.supplies[0]" :key="supply.name" size="small" variant="outlined">
                      {{ supply.name }} x {{ supply.quantity }}
                    </v-chip>
                  </div>
                </div>

                <div class="request-section" v-if="item.request">
                  <div class="section-title mb-1">요청사항</div>
                  <div class="request-text">{{ item.request }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import * as XLSX from 'xlsx'

const statusOptions = [
  { title: '전체', value: '' },
  { title: '대기중', value: 'pending' },
  { title: '픽업 완료', value: 'picked_up' },
  { title: '예약취소', value: 'cancelled' }
]

const headers = [
  { title: '이름', key: 'customer_name', width: '160px', align: 'start' },
  { title: '연락처', key: 'customer_phone', width: '250px', align: 'start' },
  { title: '주문 날짜', key: 'order_date', width: '260px', align: 'start' },
  { title: '픽업 날짜', key: 'pickup_date', width: '260px', align: 'start' },
  { title: '픽업 시간', key: 'pickup_time', width: '160px', align: 'start' },
  { title: '케이크', key: 'cakes', width: '400px', align: 'start' },
  { title: '요청사항', key: 'request', width: '400px', align: 'start' },
  { title: '상태', key: 'pickup_status', width: '150px', align: 'start' }
]

const koreanDate = new Date().toLocaleString('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).split('.')
const today = `${koreanDate[0].trim()}-${koreanDate[1].trim().padStart(2, '0')}-${koreanDate[2].trim().padStart(2, '0')}`
const filters = ref({
  status: '',
  searchQuery: '',
  startDate: today,
  endDate: today,
  startTime: '',
  endTime: ''
})

const loading = ref(false)
const reservations = ref([])
const form = ref(null)

// 전화번호 마스킹 함수 추가
const maskPhoneNumber = (phone) => {
  if (!phone) return ''

  const parts = phone.split('-')
  if (parts.length !== 3) return phone

  const middlePart = parts[1].trim() === '' ? '****' : parts[1]

  return `${parts[0]}-${middlePart}-${parts[2]}`
}

const resetFilters = () => {
  filters.value = {
    status: '',
    searchQuery: '',
    startDate: today,
    endDate: today,
    startTime: '',
    endTime: ''
  }
}

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const showError = (message) => {
  snackbarMessage.value = message
  snackbarColor.value = 'error'
  snackbar.value = true
}

async function fetchReservations() {
  loading.value = true
  try {
    const params = new URLSearchParams()

    if (filters.value.status) {
      params.append('status', filters.value.status)
    }
    if (filters.value.searchQuery) {
      params.append('customer_name', filters.value.searchQuery)
    }
    if (filters.value.startDate) {
      params.append('startDate', filters.value.startDate)
    }
    if (filters.value.endDate) {
      params.append('endDate', filters.value.endDate)
    }
    if (filters.value.startTime) {
      params.append('startTime', filters.value.startTime)
    }
    if (filters.value.endTime) {
      params.append('endTime', filters.value.endTime)
    }

    const response = await api.get(`/reservations/sort?${params.toString()}`)
    reservations.value = response.data || []

    if (isMobile.value) {
      showMobileFilter.value = false
    }
  } catch (error) {
    console.error('예약 데이터 로딩 실패:', error)
    showError('예약 데이터를 불러오는데 실패했습니다.')
    reservations.value = []
  } finally {
    loading.value = false
  }
}

// 상태 텍스트 변환 함수
const getStatusText = (status) => {
  const texts = {
    'pending': '대기중',
    'picked_up': '픽업 완료',
    'cancelled': '예약취소'
  }
  return texts[status] || '알 수 없음'
}

// 상태 색상 함수
const getStatusColor = (status) => {
  const colors = {
    'pending': 'warning',
    'picked_up': 'success',
    'cancelled': 'error'
  }
  return colors[status] || 'grey'
}

const timeOptions = ref([])
for (let hour = 9; hour <= 22; hour++) {
  for (let minute = 0; minute < 60; minute += 10) {
    const formattedHour = hour.toString().padStart(2, '0')
    const formattedMinute = minute.toString().padStart(2, '0')
    timeOptions.value.push(`${formattedHour}:${formattedMinute}`)
  }
}

const showMobileFilter = ref(true)

const isMobile = computed(() => {
  return window.innerWidth < 600
})

window.addEventListener('resize', () => {
  if (!isMobile.value) {
    showMobileFilter.value = false
  } else {
    showMobileFilter.value = true
  }
})

const sortAscending = ref(true)

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
  reservations.value = reservations.value.sort((a, b) => {
    const [dateA, timeA] = [a.pickup_date?.split('T')[0], a.pickup_time]
    const [dateB, timeB] = [b.pickup_date?.split('T')[0], b.pickup_time]

    if (dateA === dateB) {
      const [hoursA, minutesA] = timeA.split(':').map(Number)
      const [hoursB, minutesB] = timeB.split(':').map(Number)
      const timeValueA = hoursA * 60 + minutesA
      const timeValueB = hoursB * 60 + minutesB
      return sortAscending.value ? timeValueA - timeValueB : timeValueB - timeValueA
    }

    return sortAscending.value
      ? new Date(dateA) - new Date(dateB)
      : new Date(dateB) - new Date(dateA)
  })
}

const exporting = ref(false)

const exportToExcel = async () => {
  try {
    exporting.value = true

    const exportData = filteredReservations.value.map(reservation => ({
      '예약자': reservation.customer_name,
      '연락처': reservation.customer_phone,
      '주문일': reservation.order_date.split('T')[0],
      '픽업일': reservation.pickup_date.split('T')[0],
      '픽업시간': reservation.pickup_time || '미정',
      '상태': pickupStatusLabels[reservation.pickup_status],
      '케이크': reservation.cakes.map(cake => `${cake.name}(${cake.ReservationCake.quantity}개)`).join(', '),
      '요청사항': reservation.supplies
        .flat()
        .filter(supply => supply.quantity > 0)
        .map(supply => `${supply.name}(${supply.quantity})`).join(', '),
      '추가요청': reservation.request || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 40 },
      { wch: 30 },
      { wch: 40 },
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, '예약 목록')

    // 파일 다운로드
    const today = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')
    XLSX.writeFile(wb, `예약목록_${today}.xlsx`)

    exporting.value = false
  } catch (error) {
    console.error('엑셀 내보내기 실패:', error)
    exporting.value = false
  }
}

const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => {
    const matchesStatus = !filters.value.status || reservation.pickup_status === filters.value.status
    const matchesSearch = !filters.value.searchQuery ||
      reservation.customer_name.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const pickupStatusLabels = {
  'pending': '대기중',
  'picked_up': '픽업 완료',
  'cancelled': '취소됨'
}

onMounted(() => {
  showMobileFilter.value = true
  fetchReservations()
})
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: opacity 0.3s;
}

.loading-overlay-enter-from,
.loading-overlay-leave-to {
  opacity: 0;
}

.custom-snackbar {
  top: calc(100vh * 7 / 8);
  bottom: auto;
}

h1 {
  margin-bottom: 16px;
  text-align: center;
}

.gap-2 {
  gap: 8px;
}

/* 모바일 뷰 스타일 */
.reservation-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.reservation-item:hover {
  border-color: #bdbdbd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.cake-chip {
  font-size: 0.8rem;
}

.gap-1 {
  gap: 4px;
}

@media (max-width: 600px) {
  .section-title {
    font-size: 0.85rem;
  }

  .text-body-2 {
    font-size: 0.875rem;
  }
}

/* 필터 섹션 스타일 */
.filter-section {
  position: relative;
  z-index: 1;
}

.filter-section :deep(.v-field) {
  border-radius: 8px;
}

.filter-section :deep(.v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
}

.filter-button {
  min-width: 100px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.filter-button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.filter-select :deep(.v-field.v-field--variant-outlined) {
  --v-field-border-width: 1px;
}

.filter-input :deep(.v-field.v-field--variant-outlined) {
  --v-field-border-width: 1px;
}

/* 반응형 조정 */
@media (max-width: 600px) {
  .filter-section {
    margin-bottom: 16px;
  }

  .filter-button {
    width: 100%;
  }

  .v-col {
    padding: 8px;
  }
}

/* 데스크톱 뷰의 테이블 셀 내용 스타일 */
.cake-list,
.supplies-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cake-item,
.supply-item {
  padding: 1px 1px 1px 1px;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.request-text {
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-line;
  color: #333;
}

/* 필터 토글 버튼 스타일 */
.filter-toggle-btn {
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-toggle-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* 아이콘 회전 효과 */
.filter-toggle-btn .v-icon {
  transition: transform 0.3s ease;
}

.filter-toggle-btn:hover .v-icon {
  transform: translateY(2px);
}

@media (min-width: 600px) {
  .filter-toggle-btn {
    display: none;
  }

  .filter-section {
    display: block !important;
  }
}

.sort-btn {
  min-width: 120px;
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 400px) {
  .sort-btn {
    min-width: auto;
  }

  .sort-btn .v-btn__content span {
    display: none;
  }
}

/* 버튼 반응형 스타일 */
.filter-button,
.excel-button {
  min-width: 60px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 600px) {

  .filter-button,
  .excel-button {
    width: auto;
    min-height: 40px;
  }

  .gap-2 {
    gap: 8px !important;
  }
}

.cake-item,
.supply-item,
.request-text {
  font-size: 1rem;
  line-height: 1.4;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

.reservation-table {
  border: 1px solid #ddd;
  width: 100%;
}
</style>
