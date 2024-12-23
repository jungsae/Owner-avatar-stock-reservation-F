<template>
  <transition name="loading-overlay">
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>
  </transition>

  <v-container>
    <h1>예약 관리</h1>

    <v-snackbar v-model="snackbar" multi-line :color="snackbarColor" timeout="2500" class="custom-snackbar">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn text @click="snackbar = false">닫기</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          예약 삭제
        </v-card-title>
        <v-card-text>예약을 취소하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-btn text @click="deleteDialog = false">
            취소
          </v-btn>
          <v-btn color="error" @click="confirmDeleteReservation">
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- 예약 수정 모달 -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title>예약 수정</v-card-title>
        <v-card-text>
          <v-text-field v-model="editReservationData.customer_name" label="예약자 이름" outlined dense />

          <v-row dense>
            <v-col cols="4">
              <v-text-field v-model="editReservationData.phoneNumber.part1" label="앞자리" outlined dense maxlength="3" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="editReservationData.phoneNumber.part2" label="중간자리" outlined dense maxlength="4" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="editReservationData.phoneNumber.part3" label="뒷자리" outlined dense maxlength="4" />
            </v-col>
          </v-row>

          <v-divider></v-divider>

          <!-- 주문 날짜 추가 -->
          <v-row justify="center">
            <v-col cols="auto">
              <h3>주문 날짜</h3>
            </v-col>
          </v-row>
          <v-date-picker v-model="tempOrderDate" show-adjacent-months hide-header :max="today" color="primary"
            width="100%" dense outlined />

          <v-divider></v-divider>

          <!-- 픽업 날짜/시간 섹션 수정 -->
          <v-row justify="center">
            <v-col cols="auto">
              <h3>픽업 날짜/시간</h3>
            </v-col>
          </v-row>
          <v-date-picker v-model="tempPickupDate" show-adjacent-months hide-header first-day-of-week="0" :min="today"
            color="primary" width="100%" />

          <v-row dense>
            <v-col>
              <v-select v-model="editReservationData.pickup_hour" :items="hours" label="시간" dense outlined />
            </v-col>
            <v-col>
              <v-select v-model="editReservationData.pickup_minute" :items="minutes" label="분" dense outlined />
            </v-col>
          </v-row>

          <!-- 케이크 수정 -->
          <v-btn style="width: 100%;" color="primary" @click="openCakeSelectionModal()">
            케이크 수정
          </v-btn>

          <v-list dense>
            <v-row justify="start" no-gutters>
              <v-col v-for="(cake, index) in editReservationData.cakes" :key="index" cols="6" sm="6" md="4" lg="3"
                xl="2" class="cake-item">
                <v-sheet class="pa-1 ma-1">
                  <v-list-item-title>{{ cake.name }}</v-list-item-title>
                  <v-list-item-subtitle>수량: {{ cake.ReservationCake.quantity }}</v-list-item-subtitle>
                  <v-btn class="delete-btn" @click="removeCake(index)">
                    <v-icon color="error">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-list>

          <!-- 고객 요청사항 추가 -->
          <v-card-title>고객 요청사항</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6" md="4" v-for="item in customerRequest.items" :key="item.name">
                <v-card outlined class="pa-3">
                  <div class="d-flex justify-space-between align-center">
                    <span>{{ item.name }}</span>
                    <div class="d-flex align-center">
                      <v-btn icon small @click="decreaseQuantity(item)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                      <span class="mx-2">{{ item.quantity }}</span>
                      <v-btn icon small @click="increaseQuantity(item)">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- 추가 요청사항 -->
            <v-textarea v-model="editReservationData.request" label="추가 요청사항" outlined dense rows="2" />
          </v-card-text>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="editDialog = false">
            취소
          </v-btn>
          <v-btn color="primary" @click="confirmEditReservation">
            수정
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 예약 등록 모달 -->
    <v-dialog v-model="addDialog" max-width="800px">
      <v-card>
        <v-card-title>예약 등록</v-card-title>
        <v-card-text>
          <v-text-field v-model="newReservation.customer_name" label="예약자 이름" outlined dense />
          <!-- 전화번호 입력 -->
          <v-row dense>
            <v-col cols="4">
              <v-select v-model="newReservation.phoneNumber.part1" :items="['010', '011', '016', '017', '018', '019']"
                label="앞자리" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="newReservation.phoneNumber.part2" label="중간자리" outlined dense :disabled="isMasked"
                maxlength="4" @focus="clearMask" />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="newReservation.phoneNumber.part3" maxlength="4" label="뒷자리" outlined dense />
            </v-col>
          </v-row>
          <v-checkbox v-model="isMasked" label="중간 번호 마스킹 처리" dense hide-details @change="applyMask" />

          <v-divider></v-divider>

          <v-row justify="center">
            <v-col cols="auto">
              <h3>주문 날짜</h3>
            </v-col>
          </v-row>
          <v-date-picker v-model="newReservation.order_date" show-adjacent-months hide-header :max="today"
            color="primary" width="100%" dense outlined />

          <v-divider></v-divider>

          <v-row justify="center">
            <v-col cols="auto">
              <h3>픽업 날짜/시간</h3>
            </v-col>
          </v-row>
          <v-date-picker v-model="newReservation.pickup_date" show-adjacent-months first-day-of-week="0" hide-header
            :min="today" color="primary" width="100%" />

          <v-row dense>
            <v-col>
              <v-select v-model="newReservation.pickup_hour" :items="hours" label="시간" dense outlined
                :disabled="!newReservation.pickup_date" />
            </v-col>
            <v-col>
              <v-select v-model="newReservation.pickup_minute" :items="minutes" label="분" dense outlined
                :disabled="!newReservation.pickup_date" />
            </v-col>
          </v-row>

          <v-btn style="width: 100%;" color="primary" @click="openCakeSelectionModal()">
            케이크 선택
          </v-btn>

          <v-list dense>
            <v-row justify="start" no-gutters>
              <v-col v-for="(cake, index) in newReservation.cakes" :key="index" cols="6" sm="6" md="4" lg="3" xl="2"
                class="cake-item">
                <v-sheet class="pa-1 ma-1">
                  <v-list-item-title>{{ cake.name }}</v-list-item-title>
                  <v-list-item-subtitle>수량: {{ cake.quantity }}</v-list-item-subtitle>
                  <v-btn class="delete-btn" @click="removeCake(index)">
                    <v-icon color="error">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-list>

          <v-card-title>고객 요청사항</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6" md="4" v-for="item in customerRequest.items" :key="item.name">
                <v-card outlined class="pa-3">
                  <div class="d-flex justify-space-between align-center">
                    <span>{{ item.name }}</span>
                    <div class="d-flex align-center">
                      <v-btn icon small @click="decreaseQuantity(item)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                      <span class="mx-2">{{ item.quantity }}</span>
                      <v-btn icon small @click="increaseQuantity(item)">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-textarea v-model="newReservation.request" label="추가 요청사항" outlined dense rows="2" />
          </v-card-text>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="addDialog = false">
            취소
          </v-btn>
          <v-btn color="primary" @click="addReservation">
            등록
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 케이크 선택 모달 -->
    <v-dialog v-model="cakeSelectionDialog" max-width="800px">
      <v-card>
        <v-card-title>케이크 선택</v-card-title>
        <v-card-text>
          <v-text-field v-model="cakeSearchQuery" label="검색" outlined dense />
          <v-row>
            <v-col v-for="cake in filteredAvailableCakes" :key="cake.cake_id" cols="12" sm="4" md="3">
              <v-card :ripple="false" outlined class="cake-card" @click="selectCake(cake)">
                <v-img :src="getImageUrl(cake.cakeInfo.image_url.split('/').pop().split('.')[0])" class="cake-image" />
                <v-card-text>
                  <h4>{{ cake.cakeInfo.name }}</h4>
                  <div class="quantity-selector">
                    <v-select v-model="cake.quantity" :items="Array.from({ length: cake.stock }, (_, i) => i + 1)"
                      label="수량" outlined dense @click.stop />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn width="100%" @click="cakeSelectionDialog = false">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 예약 상세 모달 -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="reservation-header text-h6 font-weight-bold"
          style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>예약 내역 ({{ selectedDate }})</div>
          <div class="controls" style="display: flex; align-items: center; gap: 8px;">
            <v-checkbox v-model="hideCancelled" label="예약 취소 숨기기" @change="filterReservations" dense hide-details />
            <v-btn icon @click="toggleSortOrder">
              <v-icon>{{ sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <template v-if="filteredReservations.length">
            <!-- 데스크탑 뷰 -->
            <v-data-table v-if="!isMobile" density="compact" :headers="headers" :items="filteredReservations"
              :hide-default-footer="true">
              <v-row v-for="item in filteredReservations" :key="item.id" align="start" no-gutters
                class="reservation-item mb-4">

                <v-col cols="3">
                  <h3 class="font-weight-bold mb-2">{{ item.customer_name }}</h3>
                  <div class="text-subtitle-1">
                    <span class="text--secondary">주문 날짜:</span> {{ item.order_date.split('T')[0] }}
                  </div>
                  <div class="text-subtitle-1">
                    <span class="text-muted">픽업 시간:</span> {{ item.pickup_time || '미정' }}
                  </div>
                  <div class="status-label mt-1" :class="{
                    'text-success': item.pickup_status === 'picked_up',
                    'text-warning': item.pickup_status === 'pending',
                    'text-error': item.pickup_status === 'cancelled',
                  }">
                    {{ pickupStatusLabels[item.pickup_status] }}
                  </div>

                  <v-switch v-model="item.pickup_status" inset color="primary" :false-value="'pending'"
                    :true-value="'picked_up'" :disabled="item.pickup_status === 'cancelled'"
                    @change="updatePickupStatus(item)">
                  </v-switch>

                  <div class="d-flex flex-column" style="gap: 8px; max-width: 90%;">
                    <v-btn block :ripple="false" color="primary" :disabled="item.pickup_status === 'cancelled'"
                      @click="openEditReservationModal(item)">
                      예약수정
                    </v-btn>
                    <v-btn block :ripple="false" color="error" :disabled="item.pickup_status === 'cancelled'"
                      @click="promptDeleteReservation(item.id)">
                      예약취소
                    </v-btn>
                  </div>
                </v-col>

                <v-divider vertical thickness="20" color="white"></v-divider>

                <v-col cols="4">
                  <v-card outlined class="pa-2">
                    <h4 class="mb-2">요청사항</h4>
                    <v-row dense>
                      <v-col cols="6" v-for="supply in item.supplies.flat().filter(supply => supply.quantity > 0)"
                        :key="supply.name">
                        <div class="supply-item">
                          {{ supply.name }} x {{ supply.quantity }}
                        </div>
                      </v-col>
                    </v-row>

                    <template v-if="item.request">
                      <div class="additional-requests">
                        <h4 class="mb-2">추가 요청사항</h4>
                        <div class="additional-content">{{ item.request }}</div>
                      </div>
                    </template>
                  </v-card>
                </v-col>

                <v-divider vertical thickness="25" color="white"></v-divider>

                <v-col cols="4">
                  <v-card outlined class="pa-2">
                    <h4 class="mb-2">케이크 목록</h4>
                    <v-list dense>
                      <v-list-item v-for="cake in item.cakes" :key="cake.name">
                        <p style="font-size: small;">{{ cake.name }}</p>
                        <v-list-item-subtitle>수량: {{ cake.ReservationCake.quantity }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-col>
              </v-row>
            </v-data-table>

            <!-- 모바일 뷰 -->
            <div v-else>
              <transition-group name="fade" tag="div">
                <v-card v-for="item in filteredReservations" :key="item.id" class="reservation-card">
                  <v-row>
                    <v-col cols="6">
                      <div style="font-size: small;">주문 : {{ item.order_date.split('T')[0] }}</div>
                      <div class="customer-name">{{ item.customer_name }}</div>
                    </v-col>

                    <v-col cols="6" class="text-right pickup-time">
                      픽업 시간: {{ item.pickup_time || '미정' }}
                    </v-col>
                  </v-row>

                  <!-- 케이크 목록 -->
                  <div class="cake-list">
                    <span class="status-label" :class="{
                      'text-success': item.pickup_status === 'picked_up',
                      'text-warning': item.pickup_status === 'pending',
                      'text-error': item.pickup_status === 'cancelled',
                    }">
                      {{ pickupStatusLabels[item.pickup_status] }}
                    </span>
                    <div v-for="cake in item.cakes" :key="cake.name">
                      {{ cake.name }} x {{ cake.ReservationCake.quantity }}
                    </div>
                  </div>

                  <!-- 요청사항 목록 -->
                  <div class="supplies-list mt-2">
                    <v-divider class="my-2"></v-divider>
                    <div class="supplies-title">요청사항</div>
                    <v-row dense>
                      <v-col cols="4" v-for="supply in item.supplies.flat().filter(supply => supply.quantity > 0)"
                        :key="supply.name">
                        <v-chip size="medium" color="primary" variant="outlined" class="supply-chip" block>
                          {{ supply.name }} x {{ supply.quantity }}
                        </v-chip>
                      </v-col>
                    </v-row>
                    <div class="additional-requests mt-2">
                      <div class="additional-title">추가 요청사항</div>
                      <div class="additional-content">{{ item.request }}</div>
                    </div>
                  </div>

                  <!-- 상태 변경 -->
                  <v-row dense class="mt-2">
                    <v-switch v-model="item.pickup_status" :false-value="'pending'" :true-value="'picked_up'"
                      :disabled="item.pickup_status === 'cancelled'" inset color="primary"
                      @change="updatePickupStatus(item)" />
                  </v-row>

                  <!-- 작업 버튼 -->
                  <div class="actions">
                    <div class="icon-btn" :class="{ 'disabled-btn': item.pickup_status === 'cancelled' }"
                      @click="item.pickup_status !== 'cancelled' && openEditReservationModal(item)">
                      <v-icon>mdi-pencil</v-icon> 예약수정
                    </div>
                    <div class="icon-btn delete-btn" :class="{ 'disabled-btn': item.pickup_status === 'cancelled' }"
                      @click="item.pickup_status !== 'cancelled' && promptDeleteReservation(item.id)">
                      <v-icon>mdi-delete</v-icon> 예약취소
                    </div>
                  </div>
                </v-card>
              </transition-group>
            </div>
          </template>

          <template v-else>
            <p>예약 내역이 없습니다.</p>
          </template>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="dialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '@/plugins/axios';
import { getImageUrl } from '@/utils/imageLoader';

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        headerToolbar: {
          left: 'prev next',
          center: 'title',
          end: 'today,addReservation',
        },
        customButtons: {
          addReservation: {
            text: '예약추가',
            click: () => this.openAddReservationDialog(),
          },
        },
        locale: 'ko',
        aspectRatio: 1.5,
        dateClick: this.handleDateClick,
        eventContent: this.renderEventContent,
        dayMaxEvents: true,
      },
      headers: [
        { text: '예약자', value: 'customer_name' },
        { text: '케이크', value: 'cakes' },
        { text: '픽업 시간', value: 'pickup_time' },
        { text: '상태', value: 'pickup_status' },
        { text: '작업', value: 'actions', sortable: false },
      ],
      editDialog: false,
      editDialogContext: '',

      newReservation: {
        customer_name: '',
        customer_phone: '',
        phoneNumber: {
          part1: "010",
          part2: "",
          part3: "",
        },
        order_date: null,
        pickup_date: null,
        pickup_hour: '',
        pickup_minute: '',
        cakes: [],
        supplies: [],
        request: '',
      },

      editReservationData: {
        id: null,
        customer_name: '',
        customer_phone: '',
        phoneNumber: {
          part1: "010",
          part2: "****",
          part3: "",
        },
        order_date: null,
        pickup_date: null,
        pickup_hour: '',
        pickup_minute: '',
        cakes: [],
        supplies: [],
        request: '',
      },

      customerRequest: {
        items: [
          { name: "포크", quantity: 0 },
          { name: "케이크칼", quantity: 0 },
          { name: "성냥", quantity: 0 },
          { name: "큰 초", quantity: 0 },
          { name: "작은 초", quantity: 0 },
        ],
      },

      isMasked: true,
      tempPickupDate: null,
      tempOrderDate: null,
      originalReservationData: {},
      pickupStatusOptions: ['pending', 'picked_up', 'cancelled'],
      loading: true,
      dialog: false,
      addDialog: false,
      datePickerMenu: false,
      deleteDialog: false,
      selectedReservationId: null,
      today: new Date(),
      cakeSearchQuery: '',
      cakeSelectionDialog: false,
      availableCakes: [],
      tempAvailableCakes: [],
      hours: Array.from({ length: 14 }, (_, i) => i + 9),
      minutes: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: '',
      reservations: [],
      selectedDate: '',
      hideCancelled: true,
      selectedReservations: [],
      pickupStatusLabels: {
        pending: '픽업 대기',
        picked_up: '픽업 완료',
        cancelled: '예약 취소',
      },
      sortOrder: 'asc',
      isMobile: false,
    };
  },

  computed: {

    filteredAvailableCakes() {
      const query = this.cakeSearchQuery.toLowerCase().trim();
      return this.tempAvailableCakes.filter((cake) => {
        const matchesSearch = cake.cakeInfo.name.toLowerCase().includes(query);
        const hasStock = cake.stock > 0;
        return matchesSearch && hasStock;
      });
    },

    filteredReservations() {
      if (this.hideCancelled) {
        return this.selectedReservations.filter(
          (res) => res.pickup_status !== 'cancelled'
        );
      }
      return this.selectedReservations;
    },
  },

  watch: {
    addDialog(val) {
      if (!val) {
        this.resetNewReservation();
        this.resetCustomerRequest();
      }
    },
    cakeSelectionDialog(val) {
      if (!val) {
        this.resetCakeSelection();
      }
    },
  },

  mounted() {
    this.fetchReservations();
    this.fetchAvailableCakes();
    this.handleResize();
    this.checkScreenWidth();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener("resize", this.checkScreenWidth);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener("resize", this.checkScreenWidth);
  },

  methods: {
    decreaseQuantity(item) {
      if (item.quantity > 0) {
        item.quantity--;
      }
    },

    increaseQuantity(item) {
      item.quantity++;
    },

    clearMask() {
      if (this.isMasked && this.newReservation.phoneNumber.part2 === "****") {
        this.newReservation.phoneNumber.part2 = "";
      }
    },

    applyMask() {
      if (this.isMasked) {
        this.newReservation.phoneNumber.part2 = "****";
      }
    },

    formatPhoneNumber(phoneNumber) {
      return `${phoneNumber.part1}-${phoneNumber.part2}-${phoneNumber.part3}`;
    },

    resetCustomerRequest() {
      this.customerRequest.items.forEach((item) => {
        item.quantity = 0;
      });
      this.customerRequest.other = '';
    },

    async fetchAvailableCakes() {
      this.loading = true;
      try {
        const response = await api.get('/storeCakes');
        this.availableCakes = response.data.map(cake => ({
          ...cake,
          cakeInfo: {
            ...cake.cakeInfo,
            image_url: getImageUrl(cake.cakeInfo.image_url.split('/').pop().split('.')[0])
          }
        }));
      } catch (error) {
        console.error('Error fetching cakes:', error);
        this.showSnackbar('매장 케이크 정보를 불러오는데 실패했습니다.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async fetchReservations() {
      try {
        const response = await api.get('/reservations/store');
        this.reservations = response.data;

        const groupedReservations = this.reservations
          .filter((res) => res.pickup_status !== 'cancelled')
          .reduce((acc, reservation) => {
            const dateKey = new Date(reservation.pickup_date).toISOString().split('T')[0];
            const timeKey = reservation.pickup_time || '미정';
            const key = `${dateKey} ${timeKey}`;
            acc[key] = acc[key] || [];
            acc[key].push(reservation);
            return acc;
          }, {});

        this.calendarOptions.events = Object.entries(groupedReservations).map(([key, reservations]) => {
          const [date, time] = key.split(' ');
          const pickupTime = time !== '미정' ? time.padStart(5, '0') + ':00' : '00:00:00';

          return {
            title: `${time} ${reservations.length}건`,
            start: `${date}T${pickupTime}`,
            extendedProps: {
              reservations,
            },
          };
        });

        this.loading = false;
      } catch (error) {
        console.error('Error fetching reservations:', error);
        this.showSnackbar('예약 데이터를 불러오는데 실패했습니다.', 'error');
      }
    },

    filterReservations() {
      this.selectedReservations = this.reservations
        .filter((res) => res.pickup_date.split('T')[0] === this.selectedDate)
        .filter((res) => !this.hideCancelled || res.pickup_status !== 'cancelled');
      this.sortSelectedReservations();
    },

    checkScreenWidth() {
      this.isMobile = window.innerWidth <= 687;
    },

    resetNewReservation() {
      this.newReservation = {
        customer_name: '',
        customer_phone: '',
        pickup_date: null,
        pickup_hour: '',
        pickup_minute: '',
        cakes: [],
        supplies: [],
        request: '',
        order_date: null,
        phoneNumber: {
          part1: "010",
          part2: "",
          part3: "",
        },
      };
    },

    resetCakeSelection() {
      this.tempAvailableCakes.forEach((cake) => {
        delete cake.quantity;
      });
      this.tempAvailableCakes = [];
      this.cakeSearchQuery = '';
    },

    handleResize() {
      const width = window.innerWidth;
      if (width <= 540) {
        this.calendarOptions = {
          ...this.calendarOptions,
          height: '600px',
          aspectRatio: 0.7,
        };
      } else if (width <= 780) {
        this.calendarOptions = {
          ...this.calendarOptions,
          height: '700px',
          aspectRatio: 1.2,
        };
      } else {
        this.calendarOptions = {
          ...this.calendarOptions,
          height: '800px',
          aspectRatio: 1.8,
        };
      }
    },

    handleDateClick(info) {
      const clickedDate = new Date(info.dateStr).toISOString().split('T')[0];
      this.selectedDate = clickedDate;
      this.selectedReservations = this.reservations.filter(
        (res) =>
          res.pickup_date.split('T')[0] === info.dateStr
      );
      this.sortSelectedReservations();
      this.dialog = true;
    },

    promptDeleteReservation(reservationId) {
      this.selectedReservationId = reservationId;
      this.deleteDialog = true;
    },

    extractChangedData(original, updated) {
      const changes = {};

      if (original.customer_name !== updated.customer_name) {
        changes.customer_name = updated.customer_name;
      }

      const formattedPhone = this.formatPhoneNumber(updated.phoneNumber);
      if (original.customer_phone !== formattedPhone) {
        changes.customer_phone = formattedPhone;
      }

      let year = this.tempOrderDate.getFullYear();
      let month = String(this.tempOrderDate.getMonth() + 1).padStart(2, '0');
      let day = String(this.tempOrderDate.getDate()).padStart(2, '0');
      updated.order_date = `${year}-${month}-${day}`;

      if (original.order_date.split('T')[0] !== updated.order_date) {
        changes.order_date = updated.order_date;
      }

      year = this.tempPickupDate.getFullYear();
      month = String(this.tempPickupDate.getMonth() + 1).padStart(2, '0');
      day = String(this.tempPickupDate.getDate()).padStart(2, '0');
      updated.pickup_date = `${year}-${month}-${day}`;

      if (original.pickup_date.split('T')[0] !== updated.pickup_date) {
        changes.pickup_date = updated.pickup_date;
      }

      const updatedTime = `${updated.pickup_hour}:${updated.pickup_minute}`;
      if (original.pickup_time !== updatedTime) {
        changes.pickup_time = updatedTime;
      }

      const originalCakes = original.cakes || [];
      const updatedCakes = updated.cakes || [];
      if (JSON.stringify(originalCakes) !== JSON.stringify(updatedCakes)) {
        changes.cakes = updatedCakes.map((cake) => ({
          id: cake.id,
          quantity: cake.ReservationCake.quantity,
        }));
      }

      // supplies 변경 확인
      const updatedSupplies = this.customerRequest.items
        .filter(item => item.quantity > 0)
        .map(item => ({
          name: item.name,
          quantity: item.quantity
        }));

      if (JSON.stringify(original.supplies) !== JSON.stringify([updatedSupplies])) {
        changes.supplies = [updatedSupplies];
      }

      // request 변경 확인
      if (original.request !== updated.request) {
        changes.request = updated.request;
      }

      return changes;
    },

    openEditReservationModal(reservation) {
      this.editDialogContext = 'edit';
      this.originalReservationData = JSON.parse(JSON.stringify(reservation));

      const phoneParts = reservation.customer_phone
        ? reservation.customer_phone.split('-')
        : ['010', '', ''];

      if (reservation.supplies && reservation.supplies.length > 0) {
        const flatSupplies = reservation.supplies.flat();
        this.customerRequest.items.forEach(item => {
          const foundSupply = flatSupplies.find(supply => supply.name === item.name);
          item.quantity = foundSupply ? foundSupply.quantity : 0;
        });
      } else {
        this.customerRequest.items.forEach(item => {
          item.quantity = 0;
        });
      }

      this.editReservationData = {
        id: reservation.id,
        customer_name: reservation.customer_name,
        phoneNumber: {
          part1: phoneParts[0],
          part2: phoneParts[1],
          part3: phoneParts[2],
        },
        order_date: reservation.order_date,
        pickup_date: reservation.pickup_date,
        pickup_hour: reservation.pickup_time ? reservation.pickup_time.split(':')[0] : '',
        pickup_minute: reservation.pickup_time ? reservation.pickup_time.split(':')[1] : '',
        cakes: JSON.parse(JSON.stringify(reservation.cakes)),
        request: reservation.request || '',
      };

      this.tempPickupDate = new Date(reservation.pickup_date);
      this.tempOrderDate = new Date(reservation.order_date);
      this.editDialog = true;
    },

    async confirmEditReservation() {
      try {
        const changes = this.extractChangedData(this.originalReservationData, this.editReservationData);
        if (Object.keys(changes).length == 0) {
          this.showSnackbar('변경된 내용이 없습니다.', 'error');
          this.editDialog = false;
          return;
        }

        if (this.editReservationData.cakes.length == 0) {
          this.showSnackbar('1개 이상의 케이크를 등록해주세요!', 'error')
          return
        }

        await api.patch(`/reservations/${this.editReservationData.id}`, changes);

        this.showSnackbar('예약이 성공적으로 수정되었습니다.', 'success');
        this.editDialogContext = '';
        this.editDialog = false;
        this.dialog = false;
        this.fetchReservations();
        this.fetchAvailableCakes();
      } catch (error) {
        this.showSnackbar(`${error.response.data.message}`, 'error');
      }
    },

    async confirmDeleteReservation() {
      try {
        if (this.selectedReservationId) {
          await api.delete(`/reservations/${this.selectedReservationId}`);

          this.reservations = this.reservations.filter(
            (res) => res.id !== this.selectedReservationId
          );
          this.selectedReservations = this.selectedReservations.filter(
            (res) => res.id !== this.selectedReservationId
          );

          await this.fetchAvailableCakes();

          this.showSnackbar("예약이 삭제되었습니다.", "success");

          this.deleteDialog = false;
          this.selectedReservationId = null;
          await this.fetchReservations();
        }
      } catch (error) {
        this.showSnackbar("예약 삭제에 실패했습니다.", "error");
        console.error("삭제 중 오류:", error);
      }
    },

    async addReservation() {
      try {
        const fullPhoneNumber = `${this.newReservation.phoneNumber.part1}-${this.newReservation.phoneNumber.part2}-${this.newReservation.phoneNumber.part3}`;
        this.newReservation.customer_phone = fullPhoneNumber;
        const { customer_name, customer_phone, pickup_date, pickup_hour, pickup_minute, cakes, order_date, supplies, request } = this.newReservation;

        if (!customer_name || !customer_phone || !pickup_date || !order_date || !pickup_hour || !pickup_minute || !cakes.length) {
          this.showSnackbar('모든 필드를 입력해주세요.', 'error');
          return false;
        }

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        supplies.push(this.customerRequest.items.filter((item) => item.quantity > 0));

        const payload = {
          customer_name,
          customer_phone,
          pickup_date: formatDate(pickup_date),
          pickup_time: `${pickup_hour}:${pickup_minute}`,
          order_date: formatDate(order_date),
          request,
          supplies,
          cakes
        };

        await api.post('/reservations/', payload);
        this.showSnackbar('예약이 성공적으로 등록되었습니다.', 'success');

        this.addDialog = false;
        this.editDialogContext = '';
        this.resetCustomerRequest();
        this.resetNewReservation();
        await this.fetchReservations();
        await this.fetchAvailableCakes();

        this.newReservation = {
          customer_name: '',
          customer_phone: '',
          pickup_date: null,
          pickup_hour: '',
          pickup_minute: '',
          cakes: [],
          supplies: [],
          request: '',
          order_date: null,
          phoneNumber: {
            part1: "010",
            part2: "",
            part3: "",
          },
        };
      } catch (error) {
        console.error('Error adding reservation:', error);
        const responseError = error.response?.data?.error;
        if (responseError?.code === "STOCK_INSUFFICIENT") {
          this.showSnackbar(`${responseError.message}`, 'error');
          await this.fetchAvailableCakes();
        } else {
          this.showSnackbar('예약 등록 중 오류가 발생했습니다.', 'error');
        }
      }
    },

    async updatePickupStatus(reservation) {
      try {
        const newStatus = reservation.pickup_status;
        await api.patch(`/reservations/${reservation.id}/pickup-status`, { status: newStatus });

        this.showSnackbar(
          `${this.pickupStatusLabels[newStatus]} 상태로 변경되었습니다.`,
          'success'
        );
      } catch (error) {
        reservation.pickup_status =
          reservation.pickup_status === 'picked_up' ? 'pending' : 'picked_up';
        this.showSnackbar('상태 변경 중 오류가 발생했습니다.', 'error');
        console.error(error);
      }
    },

    selectCake(cake) {
      const selectedCake = this.tempAvailableCakes.find((c) => c.cake_id === cake.cake_id);
      if (!selectedCake) return;

      if (!cake.quantity || cake.quantity < 1 || selectedCake.stock < cake.quantity) {
        this.showSnackbar(`수량이 올바르지 않거나 재고가 부족합니다.`, 'error');
        return;
      }

      selectedCake.stock -= cake.quantity;

      // 추가 케이크 등록 로직
      if (this.editDialogContext === 'add') {
        const existingCake = this.newReservation.cakes.find((c) => c.id === cake.cake_id);
        if (existingCake) {
          existingCake.quantity += cake.quantity;
        } else {
          this.newReservation.cakes.push({
            id: cake.cake_id,
            name: cake.cakeInfo.name,
            quantity: cake.quantity,
          });
        }
      } else if (this.editDialogContext === 'edit') {
        const existingCake = this.editReservationData.cakes.find((c) => c.id === cake.cake_id);
        if (existingCake) {
          existingCake.ReservationCake.quantity += cake.quantity;
        } else {
          this.editReservationData.cakes.push({
            id: cake.cake_id,
            name: cake.cakeInfo.name,
            ReservationCake: { quantity: cake.quantity },
          });
        }
      }

      this.showSnackbar('케이크가 추가되었습니다.', 'success');
      this.cakeSelectionDialog = false;
    },

    removeCake(index) {
      let removedCake;
      if (this.editDialogContext === 'add') {
        removedCake = this.newReservation.cakes[index];
        const selectedCake = this.tempAvailableCakes.find((cake) => cake.cake_id === removedCake.id);
        if (selectedCake) {
          selectedCake.stock += removedCake.quantity;
          delete selectedCake.quantity; // 수량 초기화
        }
        this.newReservation.cakes.splice(index, 1);
      } else if (this.editDialogContext === 'edit') {
        removedCake = this.editReservationData.cakes[index];
        const selectedCake = this.tempAvailableCakes.find((cake) => cake.cake_id === removedCake.id);
        if (selectedCake) {
          selectedCake.stock += removedCake.ReservationCake.quantity;
          delete selectedCake.quantity; // 수량 초기화
        }
        this.editReservationData.cakes.splice(index, 1);
      }
      this.showSnackbar(`${removedCake.name}가(이) 삭제되었습니다.`, 'info');
    },

    enableTimeSelection() {
      this.datePickerMenu = false;
    },

    async openAddReservationDialog() {
      this.addDialog = true;
      this.loading = true;
      this.editDialogContext = 'add';
      this.loading = false;
    },

    async openCakeSelectionModal() {
      this.tempAvailableCakes = JSON.parse(JSON.stringify(this.availableCakes));

      const restoreStockForDeletedCakes = () => {
        if (this.editDialogContext === 'edit' && this.originalReservationData.cakes) {
          this.originalReservationData.cakes.forEach((originalCake) => {
            const tempCake = this.tempAvailableCakes.find((cake) => cake.cake_id === originalCake.id);
            if (tempCake) {
              tempCake.stock += originalCake.ReservationCake.quantity;
            }
          });
        }
      };

      const updateStockForSelectedCakes = (selectedCakes) => {
        const updatedCakes = new Set();
        selectedCakes.forEach((selectedCake) => {
          const existingCake = this.tempAvailableCakes.find((cake) => cake.cake_id === selectedCake.id);
          if (existingCake && !updatedCakes.has(selectedCake.id)) {
            existingCake.stock -= selectedCake.quantity || selectedCake.ReservationCake.quantity;
            if (existingCake.stock < 0) existingCake.stock = 0;
            updatedCakes.add(selectedCake.id);
          }
        });
      };

      restoreStockForDeletedCakes();

      if (this.editDialogContext === 'edit') {
        updateStockForSelectedCakes(this.editReservationData.cakes);
      } else if (this.editDialogContext === 'add') {
        updateStockForSelectedCakes(this.newReservation.cakes);
      }

      this.tempAvailableCakes.forEach((cake) => {
        delete cake.quantity;
      });

      this.cakeSearchQuery = '';
      this.cakeSelectionDialog = true;
    },

    closeCakeSelectionModal() {
      this.tempAvailableCakes = JSON.parse(JSON.stringify(this.availableCakes));

      this.tempAvailableCakes.forEach((cake) => {
        delete cake.quantity;
      });

      this.cakeSelectionDialog = false;
    },

    showSnackbar(message, type = 'info') {
      this.snackbarMessage = message;
      this.snackbarColor = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
      this.snackbar = true;
    },

    renderEventContent(eventInfo) {
      const title = eventInfo.event.title;
      const truncatedTitle = title.length > 10 ? `${title.substring(0, 10)}...` : title;
      return {
        html: `<i class="mdi mdi-calendar-check-outline"></i> ${truncatedTitle}`,
      };
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.sortSelectedReservations();
    },

    sortSelectedReservations() {
      this.selectedReservations.sort((a, b) => {
        const timeA = a.pickup_time ? this.timeToMinutes(a.pickup_time) : 1439;
        const timeB = b.pickup_time ? this.timeToMinutes(b.pickup_time) : 1439;
        return this.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
    },

    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    },
  },
};
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

.cake-item {
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

h1 {
  margin-bottom: 16px;
  text-align: center;
}

.calendar-container {
  margin: 0 auto;
  max-width: 100%;
}

.fc {
  font-size: 1rem;
}

.fc .fc-daygrid-day-number {
  font-size: 1.2rem;
  font-weight: bold;
}

.fc .fc-toolbar-title {
  font-size: 1.5rem;
}

.cake-card {
  cursor: pointer;
  text-align: center;
}

.cake-image {
  max-height: 100px;
  margin-bottom: 8px;
}

.quantity-selector {
  margin-top: 8px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.v-card-text {
  max-height: 600px;
  overflow-y: auto;
}

.reservation-card {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-label {
  font-size: 0.9rem;
  font-weight: bold;
}

.pickup-time {
  font-size: 1rem;
  color: #e00834;
  font-weight: bold;
  text-align: right;
}

.customer-name {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.cake-list {
  font-size: 1rem;
  color: #555;
  margin-top: 6px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1px;
}

.icon-btn {
  font-size: 0.8rem;
  color: #1976D2;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.delete-btn {
  color: #e53935;
}

.disabled-btn {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.custom-snackbar {
  top: calc(100vh * 7 / 8);
  bottom: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(120px);
}

@media (max-width: 600px) {
  .v-card-title {
    font-size: 1rem;
    text-align: left;
  }

  .v-card {
    margin: 1px 0;
  }

  .reservation-header {
    flex-direction: column;
    text-align: center;
  }

  .reservation-header .reservation-controls {
    justify-content: center;
    width: 100%;
  }

}

@media (max-width: 540px) {
  .fc {
    font-size: 0.7rem !important;
  }

  .fc .fc-daygrid-day-number {
    font-size: 0.9rem !important;
  }

  .fc .fc-toolbar-title {
    font-size: 1.1rem !important;
  }

  .fc-event-title {
    font-size: 0.65rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .fc-daygrid-event {
    padding: 1px !important;
    max-width: 90% !important;
    min-height: 16px !important;
  }
}

@media (max-width: 465px) {
  .fc {
    font-size: 0.6rem !important;
  }

  .fc .fc-daygrid-day-number {
    font-size: 0.8rem !important;
  }

  .fc .fc-toolbar-title {
    font-size: 1rem !important;
  }

  .fc-event-title {
    font-size: 0.55rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .fc-daygrid-event {
    padding: 0 1px !important;
    max-width: 85% !important;
    min-height: 14px !important;
  }

  .fc-daygrid-day-frame {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    overflow: hidden !important;
  }
}

.supplies-list {
  padding: 4px 0;
}

.supplies-title,
.additional-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
}

.additional-requests {
  border-top: 1px dashed #e0e0e0;
  padding-top: 8px;
}

.additional-content {
  font-size: 0.8rem;
  color: #333;
  white-space: pre-line;
  word-break: break-word;
}

.supply-chip {
  width: 100%;
  justify-content: center;
  font-size: 0.85rem;
  margin-bottom: 1px;
}

@media (max-width: 600px) {

  .supplies-title,
  .additional-title {
    font-size: 0.85rem;
  }

  .additional-content {
    font-size: 0.8rem;
  }
}

.supply-item {
  background-color: #f5f5f5;
  padding: 5px 3px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .supply-item {
    font-size: 0.75rem;
  }
}

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
</style>