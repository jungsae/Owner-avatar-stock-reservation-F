<template>
  <v-container>
    <h1 style="text-align: center;">
      케이크 관리
    </h1>


    <!-- 케이크 목록 -->
    <v-btn color="#B71C1C" class="mb-1" @click="openAddDialog">
      새로운 케이크 추가
    </v-btn>
    <div v-if="groupedCakes.length === 0">
      <p style="text-align: center;">
        표시할 케이크가 없습니다.
      </p>
    </div>
    <v-card v-for="(group, index) in groupedCakes" :key="index" class="mb-3">
      <v-card-title style="border: 1px solid;" class="d-flex justify-center mb-1">
        {{ group.title }}
      </v-card-title>
      <v-row v-if="group.items.length > 0" dense>
        <v-col v-for="cake in group.items" :key="cake.id" cols="12" sm="3" md="3" lg="2" xl="2"
          class="d-flex justify-center mb-1">
          <v-card outlined style="border: 0.1px solid;" class="d-flex flex-column align-center pa-2">
            <div class="text-6 text-center">
              {{ cake.name }}
            </div>
            <v-img :width="100" :src="getImageUrl(cake.image_url.split('/').pop().split('.')[0])" />
            <div class="d-flex justify-center">
              <v-row class="justify-center">
                <v-col cols="12" md="5">
                  <v-btn small color="primary" class="mr-1" @click="openEditDialog(cake)">
                    수정
                  </v-btn>
                  <v-btn small color="error" class="mr-1" @click="confirmDelete(cake)">
                    삭제
                  </v-btn>
                  <v-btn small color="info" class="mr-1" @click="openDetailDialog(cake)">
                    상세정보
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <div v-else>
        <p style="text-align: center;">
          표시할 케이크가 없습니다.
        </p>
      </div>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>
          삭제 확인
        </v-card-title>
        <v-card-text>
          <p>정말 삭제하시겠습니까?</p>
          <p>삭제 후에는 복구할 수 없습니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="deleteConfirmedCake">
            삭제
          </v-btn>
          <v-btn text @click="closeDeleteDialog">
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 케이크 추가/수정 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span v-if="editMode">케이크 수정</span>
          <span v-else>케이크 추가</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-btn text color="info" @click="openNameSelectDialog">
              이름 선택
            </v-btn>
            <v-text-field v-model="form.name" label="케이크 이름" outlined dense required readonly />
            <v-img v-if="form.image_url" :src="displayImageUrl" max-height="180" max-width="500" class="mx-0" />
            <v-text-field v-model="form.price" label="가격" type="number" outlined dense required />
            <v-textarea v-model="form.description" label="설명" outlined dense required />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveCake">
            저장
          </v-btn>
          <v-btn text @click="closeDialog">
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 케이크 자세히 보기 다이얼로그 -->
    <v-dialog v-model="detailDialog" max-width="400px">
      <v-card class="mx-auto">
        <v-card-title>{{ selectedCake.name }}</v-card-title>
        <v-card-text>
          <v-img :src="selectedCake.image_url" max-width="180" class="mx-auto" />
          <div><strong>가격:</strong> {{ selectedCake.price }}원</div>
          <div><strong>설명:</strong> {{ selectedCake.description }}</div>
          <div><strong>등록일:</strong> {{ new Date(selectedCake.createdAt).toLocaleString('ko-KR', {
            timeZone:
              'Asia/Seoul'
          }) }}</div>
          <div><strong>수정일:</strong> {{ new Date(selectedCake.updatedAt).toLocaleString('ko-KR', {
            timeZone:
              'Asia/Seoul'
          }) }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="closeDetailDialog">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 이름 선택 모달 -->
    <v-dialog v-model="nameSelectDialog" max-width="800px">
      <v-card>
        <v-card-title>케이크 선택</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col v-for="cake in cakes" :key="cake.name" cols="6" md="4" lg="3" class="d-flex align-center mb-2">
              <v-card outlined class="d-flex flex-column align-center pa-2" @click="selectName(cake)">
                <v-img :src="cake.image || '/placeholder.png'" max-height="100" max-width="100" class="mb-2" />
                <div class="text-h6 text-center">
                  {{ cake.name }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="closeNameSelectDialog">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/axios';
import cakes from '@/data/cakes';
import { getImageUrl } from '@/utils/imageLoader';

const cakesInDatabase = ref([]);
const dialog = ref(false);
const nameSelectDialog = ref(false);
const detailDialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const selectedCake = ref('')
const cakeToDelete = ref(null);

const form = ref({
  id: null,
  name: '',
  price: '',
  description: '',
  image_url: '',
});

const groupedCakes = computed(() => {
  const extractNumberFromFilename = (filename) => {
    const match = filename.match(/\d+/); // 숫자 추출
    return match ? parseInt(match[0], 10) : null;
  };

  return [
    {
      title: '홀케이크',
      items: cakesInDatabase.value.filter((cake) => {
        const number = extractNumberFromFilename(cake.image_url);
        return number !== null && number >= 0 && number <= 49;
      }),
    },
    {
      title: '떠먹는 케이크',
      items: cakesInDatabase.value.filter((cake) => {
        const number = extractNumberFromFilename(cake.image_url);
        return number !== null && number >= 50 && number <= 99;
      }),
    },
    {
      title: '조각케이크',
      items: cakesInDatabase.value.filter((cake) => {
        const number = extractNumberFromFilename(cake.image_url);
        return number !== null && number >= 100 && number <= 150;
      }),
    },
  ];
});

const fetchCakesFromDatabase = async () => {
  try {
    const response = await api.get('/cakes');
    cakesInDatabase.value = response.data || [];
  } catch (error) {
    console.error('케이크 데이터를 가져오는 중 오류 발생:', error);
  }
};

const openAddDialog = () => {
  editMode.value = false;
  form.value = { id: null, name: '', price: '', description: '', image_url: '' };
  dialog.value = true;
};

const openEditDialog = (cake) => {
  editMode.value = true;
  form.value = { ...cake };
  dialog.value = true;
};

const openDetailDialog = (cake) => {
  selectedCake.value = cake;
  detailDialog.value = true;
};

const closeDetailDialog = () => {
  detailDialog.value = false;
};

const closeDialog = () => {
  dialog.value = false;
};

const openNameSelectDialog = () => {
  nameSelectDialog.value = true;
};

const closeNameSelectDialog = () => {
  nameSelectDialog.value = false;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  cakeToDelete.value = null;
};

const confirmDelete = (cake) => {
  cakeToDelete.value = cake;
  deleteDialog.value = true;
};

const selectName = (cake) => {
  form.value.name = cake.name;
  const imageNumber = cake.image.match(/\d+/)[0];
  form.value.image_url = imageNumber;
  closeNameSelectDialog();
};

const displayImageUrl = computed(() => {
  if (!form.value.image_url) return '';
  const imageNumber = String(form.value.image_url).match(/\d+/)?.[0] || '';
  if (!imageNumber) return '';

  return getImageUrl(imageNumber);
});

const saveCake = async () => {
  try {
    if (editMode.value) {
      await api.put(`/cakes/${form.value.id}`, form.value);
    } else {
      await api.post('/cakes', form.value);
    }
    closeDialog();
    fetchCakesFromDatabase();
  } catch (error) {
    alert('케이크 저장 중 오류 발생:', error.response.data.message);
  }
};

const deleteConfirmedCake = async () => {
  try {
    if (cakeToDelete.value) {
      await api.delete(`/cakes/${cakeToDelete.value.id}`);
      fetchCakesFromDatabase();
    }
  } catch (error) {
    console.error('케이크 삭제 중 오류 발생:', error);
  } finally {
    closeDeleteDialog();
  }
};

onMounted(fetchCakesFromDatabase);
</script>

<style scoped>
.text-h6 {
  font-size: 1rem;
  font-weight: bold;
}

.my-3 {
  margin: 1rem 0;
}

.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
