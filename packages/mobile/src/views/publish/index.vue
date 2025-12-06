<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCarStore } from '@/stores/car'
import { createCar } from '@/api/car'
import { uploadImage } from '@/api/upload'
import { showToast, showLoadingToast, closeToast } from 'vant'
import type { UploaderFileListItem } from 'vant'
import RegionPicker from '@/components/RegionPicker.vue'

const router = useRouter()
const userStore = useUserStore()
const carStore = useCarStore()

const form = ref({
  brandId: null as number | null,
  seriesId: null as number | null,
  brandName: '',
  seriesName: '',
  firstRegDate: '',
  mileage: '',
  price: '',
  highlightDesc: '',
  images: [] as UploaderFileListItem[],
  vin: '',
  plateNumber: '',
  regionIds: [] as number[],
  regionNames: [] as string[],
})

const showBrandPicker = ref(false)
const showSeriesPicker = ref(false)
const showDatePicker = ref(false)
const showRegionPicker = ref(false)
const submitting = ref(false)

onMounted(() => {
  carStore.fetchBrands()
})

function checkLogin() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return false
  }
  return true
}

function onBrandConfirm({ selectedOptions }: any) {
  const brand = selectedOptions[0]
  form.value.brandId = brand.id
  form.value.brandName = brand.name
  form.value.seriesId = null
  form.value.seriesName = ''
  showBrandPicker.value = false
  carStore.fetchSeries(brand.id)
}

function onSeriesConfirm({ selectedOptions }: any) {
  const series = selectedOptions[0]
  form.value.seriesId = series.id
  form.value.seriesName = series.name
  showSeriesPicker.value = false
}

function onDateConfirm({ selectedValues }: any) {
  form.value.firstRegDate = selectedValues.join('-')
  showDatePicker.value = false
}

function onRegionConfirm({ ids, names }: { ids: number[]; names: string[] }) {
  form.value.regionIds = ids
  form.value.regionNames = names
}

async function afterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const files = Array.isArray(file) ? file : [file]
  for (const f of files) {
    if (f.file) {
      f.status = 'uploading'
      f.message = '上传中...'
      try {
        const res = await uploadImage(f.file)
        f.url = res.url
        f.status = 'done'
        f.message = ''
      } catch {
        f.status = 'failed'
        f.message = '上传失败'
      }
    }
  }
}

async function handleSubmit() {
  if (!checkLogin()) return
  
  if (!form.value.brandId || !form.value.seriesId || !form.value.price || !form.value.firstRegDate) {
    showToast('请填写完整信息')
    return
  }

  if (form.value.images.length === 0) {
    showToast('请上传车辆图片')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    const images = form.value.images.filter(f => f.url).map(f => f.url!)
    await createCar({
      brandId: form.value.brandId,
      seriesId: form.value.seriesId,
      firstRegDate: form.value.firstRegDate,
      mileage: Number(form.value.mileage) || 0,
      price: Number(form.value.price),
      highlightDesc: form.value.highlightDesc,
      images,
      vin: form.value.vin || undefined,
      plateNumber: form.value.plateNumber || undefined,
      provinceId: form.value.regionIds[0] || undefined,
      cityId: form.value.regionIds[1] || undefined,
      districtId: form.value.regionIds[2] || undefined,
    })
    closeToast()
    showToast('发布成功，等待审核')
    router.push('/my-cars')
  } catch (error: any) {
    closeToast()
    showToast(error.message || '发布失败')
  } finally {
    submitting.value = false
  }
}


</script>

<template>
  <div class="publish-page">
    <van-nav-bar title="发布车源" left-arrow @click-left="router.back()" />
    
    <van-form @submit="handleSubmit">
      <van-cell-group inset title="基本信息">
        <van-field
          v-model="form.brandName"
          label="品牌"
          placeholder="请选择品牌"
          is-link
          readonly
          required
          @click="showBrandPicker = true"
        />
        <van-field
          v-model="form.seriesName"
          label="车系"
          placeholder="请选择车系"
          is-link
          readonly
          required
          :disabled="!form.brandId"
          @click="form.brandId && (showSeriesPicker = true)"
        />
        <van-field
          v-model="form.firstRegDate"
          label="上牌时间"
          placeholder="请选择上牌时间"
          is-link
          readonly
          required
          @click="showDatePicker = true"
        />
      </van-cell-group>

      <van-cell-group inset title="车况信息">
        <van-field
          v-model="form.mileage"
          type="number"
          label="行驶里程"
          placeholder="请输入里程数"
          required
        >
          <template #button>万公里</template>
        </van-field>
        <van-field
          v-model="form.price"
          type="number"
          label="期望售价"
          placeholder="请输入售价"
          required
        >
          <template #button>万元</template>
        </van-field>
        <van-field
          v-model="form.vin"
          label="车架号"
          placeholder="17位VIN码（选填）"
          maxlength="17"
        />
        <van-field
          v-model="form.plateNumber"
          label="车牌号"
          placeholder="如：京A12345（选填）"
        />
        <van-field
          :model-value="form.regionNames.join(' ')"
          label="车辆所在地"
          placeholder="请选择地区"
          is-link
          readonly
          @click="showRegionPicker = true"
        />
      </van-cell-group>

      <van-cell-group inset title="车辆描述">
        <van-field
          v-model="form.highlightDesc"
          type="textarea"
          label="车辆亮点"
          placeholder="请描述车辆亮点，如保养记录、车况等"
          rows="3"
          autosize
        />
      </van-cell-group>

      <van-cell-group inset title="车辆图片">
        <van-cell>
          <van-uploader
            v-model="form.images"
            multiple
            :max-count="9"
            :after-read="afterRead"
          />
        </van-cell>
      </van-cell-group>

      <div class="submit-btn">
        <van-button type="primary" block native-type="submit" :loading="submitting">
          提交发布
        </van-button>
      </div>
    </van-form>

    <!-- 品牌选择器 -->
    <van-popup v-model:show="showBrandPicker" position="bottom">
      <van-picker
        :columns="carStore.brands.map(b => ({ text: b.name, id: b.id, name: b.name }))"
        @confirm="onBrandConfirm"
        @cancel="showBrandPicker = false"
      />
    </van-popup>

    <!-- 车系选择器 -->
    <van-popup v-model:show="showSeriesPicker" position="bottom">
      <van-picker
        :columns="carStore.series.map(s => ({ text: s.name, id: s.id, name: s.name }))"
        @confirm="onSeriesConfirm"
        @cancel="showSeriesPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        title="选择上牌时间"
        :min-date="new Date(2000, 0, 1)"
        :max-date="new Date()"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 地区选择器 -->
    <RegionPicker
      v-model="form.regionIds"
      :show="showRegionPicker"
      @update:show="showRegionPicker = $event"
      @confirm="onRegionConfirm"
    />

    <div class="publish-tips">
      <p>发布须知：</p>
      <ul>
        <li>请如实填写车辆信息</li>
        <li>上传清晰的车辆照片</li>
        <li>发布后需等待平台审核</li>
        <li>审核通过后将自动上架</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 100px;
}

.submit-btn {
  padding: 16px;
}

.publish-tips {
  padding: 0 16px;
  color: #999;
  font-size: 12px;
}

.publish-tips p {
  margin-bottom: 8px;
}

.publish-tips ul {
  padding-left: 16px;
}

.publish-tips li {
  margin-bottom: 4px;
}
</style>
