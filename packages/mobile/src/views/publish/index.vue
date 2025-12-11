<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCarStore } from '@/stores/car'
import { createCar, updateCar, getCarDetail } from '@/api/car'
import { uploadImage } from '@/api/upload'
import { showToast, showLoadingToast, closeToast } from 'vant'
import RegionPicker from '@/components/RegionPicker.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import AddressInput from '@/components/AddressInput.vue'
import { useImageManager } from '@/composables/useImageManager'
import type { ImageItem } from '@/types'
import { 
  CAR_CONFIG_OPTIONS, 
  USE_TYPE_OPTIONS, 
  EMISSION_STANDARD_OPTIONS,
  GEARBOX_OPTIONS 
} from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const carStore = useCarStore()

// 编辑模式
const isEditMode = computed(() => !!route.query.id)
const carId = computed(() => route.query.id ? Number(route.query.id) : null)
const loading = ref(false)

// 图片管理器
const imageManager = useImageManager()

// 表单数据
const form = ref({
  // 基本信息
  brandId: null as number | null,
  seriesId: null as number | null,
  brandName: '',
  seriesName: '',
  firstRegDate: '',
  
  // 车况信息
  mileage: '',
  price: '',
  originalPrice: '',
  gearbox: '',
  emissionStandard: '',
  useType: '',
  transferCount: 0,
  color: '',
  
  // 车辆标识
  vin: '',
  plateNumber: '',
  
  // 地理位置
  regionIds: [] as number[],
  regionNames: [] as string[],
  address: '',
  
  // 媒体
  video: '',
  videoThumbnail: '',
  
  // 联系方式
  contactPhone: '',
  usePlatformPhone: false,
  
  // 描述和配置
  highlightDesc: '',
  configs: [] as string[],
})

// 弹窗控制
const showBrandPicker = ref(false)
const showSeriesPicker = ref(false)
const showDatePicker = ref(false)
const showRegionPicker = ref(false)
const showGearboxPicker = ref(false)
const showEmissionPicker = ref(false)
const showUseTypePicker = ref(false)
const showConfigPicker = ref(false)
const submitting = ref(false)

// 当前步骤
const currentStep = ref(0)
const steps = ['基本信息', '车况详情', '图片视频', '联系方式']

// 配置选项显示文本
const configsText = computed(() => {
  if (form.value.configs.length === 0) return ''
  return form.value.configs
    .map(v => CAR_CONFIG_OPTIONS.find(o => o.value === v)?.label)
    .filter(Boolean)
    .join('、')
})

onMounted(async () => {
  carStore.fetchBrands()
  
  // 编辑模式：加载车辆数据
  if (isEditMode.value && carId.value) {
    await loadCarData(carId.value)
  }
})

// 加载车辆数据（编辑模式）
async function loadCarData(id: number) {
  loading.value = true
  try {
    const car = await getCarDetail(id)
    
    // 填充表单数据
    form.value.brandId = car.brandId
    form.value.brandName = car.brandName || ''
    form.value.seriesId = car.seriesId
    form.value.seriesName = car.seriesName || ''
    form.value.firstRegDate = car.firstRegDate || ''
    form.value.mileage = car.mileage?.toString() || ''
    form.value.price = car.price?.toString() || ''
    form.value.originalPrice = car.originalPrice?.toString() || ''
    form.value.gearbox = car.gearbox || ''
    form.value.emissionStandard = car.emissionStandard || ''
    form.value.useType = car.useType || ''
    form.value.transferCount = car.transferCount || 0
    form.value.color = car.color || ''
    form.value.vin = car.vin || ''
    form.value.plateNumber = car.plateNumber || ''
    form.value.address = car.address || ''
    form.value.video = car.video || ''
    form.value.videoThumbnail = car.videoThumbnail || ''
    form.value.contactPhone = car.contactPhone || ''
    form.value.usePlatformPhone = car.usePlatformPhone || false
    form.value.highlightDesc = car.highlightDesc || ''
    form.value.configs = car.configs || []
    
    // 地区信息
    if (car.provinceId || car.cityId || car.districtId) {
      form.value.regionIds = [car.provinceId, car.cityId, car.districtId].filter(Boolean) as number[]
      form.value.regionNames = [car.provinceName, car.cityName, car.districtName].filter(Boolean) as string[]
    }
    
    // 初始化图片管理器
    if (car.images && car.images.length > 0) {
      imageManager.initImages(car.images)
    }
    
    // 加载车系列表
    if (car.brandId) {
      await carStore.fetchSeries(car.brandId)
    }
  } catch (error: any) {
    showToast(error.message || '加载车辆信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

function checkLogin() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return false
  }
  return true
}

// 品牌选择
function onBrandConfirm({ selectedOptions }: any) {
  const brand = selectedOptions[0]
  form.value.brandId = brand.id
  form.value.brandName = brand.name
  form.value.seriesId = null
  form.value.seriesName = ''
  showBrandPicker.value = false
  carStore.fetchSeries(brand.id)
}

// 车系选择
function onSeriesConfirm({ selectedOptions }: any) {
  const series = selectedOptions[0]
  form.value.seriesId = series.id
  form.value.seriesName = series.name
  showSeriesPicker.value = false
}

// 日期选择
function onDateConfirm({ selectedValues }: any) {
  form.value.firstRegDate = selectedValues.join('-')
  showDatePicker.value = false
}

// 地区选择
function onRegionConfirm({ ids, names }: { ids: number[]; names: string[] }) {
  form.value.regionIds = ids
  form.value.regionNames = names
}

// 变速箱选择
function onGearboxConfirm({ selectedOptions }: any) {
  form.value.gearbox = selectedOptions[0].value
  showGearboxPicker.value = false
}

// 排放标准选择
function onEmissionConfirm({ selectedOptions }: any) {
  form.value.emissionStandard = selectedOptions[0].value
  showEmissionPicker.value = false
}

// 使用性质选择
function onUseTypeConfirm({ selectedOptions }: any) {
  form.value.useType = selectedOptions[0].value
  showUseTypePicker.value = false
}

// 配置选择
function onConfigToggle(value: string) {
  const index = form.value.configs.indexOf(value)
  if (index === -1) {
    form.value.configs.push(value)
  } else {
    form.value.configs.splice(index, 1)
  }
}

// 图片上传
async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const files = Array.from(input.files)
  for (const file of files) {
    // 检查图片数量限制
    if (imageManager.validCount.value >= 9) {
      showToast('最多上传9张图片')
      break
    }
    
    // 添加图片到管理器
    const item = imageManager.addImage(file)
    
    try {
      const res = await uploadImage(file)
      imageManager.markDone(item.id!, res.url)
    } catch {
      imageManager.markFailed(item.id!, '上传失败')
    }
  }
  
  // 清空 input
  input.value = ''
}

// 删除图片
function handleImageDelete(item: ImageItem) {
  imageManager.deleteImage(item.id!)
}

// 下一步
function nextStep() {
  if (currentStep.value === 0) {
    if (!form.value.brandId || !form.value.seriesId || !form.value.firstRegDate) {
      showToast('请填写完整基本信息')
      return
    }
  } else if (currentStep.value === 1) {
    if (!form.value.price || !form.value.mileage) {
      showToast('请填写售价和里程')
      return
    }
  } else if (currentStep.value === 2) {
    if (imageManager.validCount.value === 0) {
      showToast('请上传至少一张车辆图片')
      return
    }
    if (imageManager.isUploading.value) {
      showToast('请等待图片上传完成')
      return
    }
  }
  currentStep.value++
}

// 上一步
function prevStep() {
  currentStep.value--
}

// 提交表单
async function handleSubmit() {
  if (!checkLogin()) return
  
  // 最终验证
  if (!form.value.brandId || !form.value.seriesId || !form.value.price || !form.value.firstRegDate) {
    showToast('请填写完整信息')
    return
  }

  const imageData = imageManager.getSubmitData()
  if (imageData.all.length === 0) {
    showToast('请上传车辆图片')
    return
  }

  if (imageManager.isUploading.value) {
    showToast('请等待图片上传完成')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    const carData = {
      brandId: form.value.brandId,
      seriesId: form.value.seriesId,
      firstRegDate: form.value.firstRegDate,
      mileage: Number(form.value.mileage) || 0,
      price: Number(form.value.price),
      originalPrice: form.value.originalPrice ? Number(form.value.originalPrice) : undefined,
      gearbox: form.value.gearbox || undefined,
      emissionStandard: form.value.emissionStandard || undefined,
      useType: form.value.useType || undefined,
      transferCount: form.value.transferCount || 0,
      color: form.value.color || undefined,
      highlightDesc: form.value.highlightDesc,
      images: imageData.all,
      video: form.value.video || undefined,
      videoThumbnail: form.value.videoThumbnail || undefined,
      vin: form.value.vin || undefined,
      plateNumber: form.value.plateNumber || undefined,
      provinceId: form.value.regionIds[0] || undefined,
      cityId: form.value.regionIds[1] || undefined,
      districtId: form.value.regionIds[2] || undefined,
      address: form.value.address || undefined,
      contactPhone: form.value.usePlatformPhone ? undefined : form.value.contactPhone,
      usePlatformPhone: form.value.usePlatformPhone,
      configs: form.value.configs.length > 0 ? form.value.configs : undefined,
    }

    if (isEditMode.value && carId.value) {
      await updateCar(carId.value, carData)
      closeToast()
      showToast('修改成功')
    } else {
      await createCar(carData)
      closeToast()
      showToast('发布成功，等待审核')
    }
    router.push('/my-cars')
  } catch (error: any) {
    closeToast()
    showToast(error.message || (isEditMode.value ? '修改失败' : '发布失败'))
  } finally {
    submitting.value = false
  }
}

// 获取选项显示文本
function getOptionLabel(options: readonly { value: string; label: string }[], value: string) {
  return options.find(o => o.value === value)?.label || ''
}
</script>

<template>
  <div class="publish-page">
    <van-nav-bar :title="isEditMode ? '编辑车源' : '发布车源'" left-arrow @click-left="router.back()" />
    
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="page-loading" size="36px" vertical>加载中...</van-loading>
    
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <van-steps :active="currentStep" active-color="#1989fa">
        <van-step v-for="(step, index) in steps" :key="index">{{ step }}</van-step>
      </van-steps>
    </div>
    
    <van-form class="publish-form">
      <!-- 步骤1：基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
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
      </div>

      <!-- 步骤2：车况详情 -->
      <div v-show="currentStep === 1" class="step-content">
        <van-cell-group inset title="价格信息">
          <van-field
            v-model="form.price"
            type="number"
            label="¥ 售价"
            placeholder="请输入售价"
            required
          >
            <template #button><span class="unit-text">万</span></template>
          </van-field>
          <van-field
            v-model="form.originalPrice"
            type="number"
            label="新车指导价"
            placeholder="选填"
          >
            <template #button><span class="unit-text">万</span></template>
          </van-field>
        </van-cell-group>

        <van-cell-group inset title="车况信息">
          <van-field
            v-model="form.mileage"
            type="number"
            label="行驶里程"
            placeholder="请输入里程数"
            required
          >
            <template #button><span class="unit-text">万公里</span></template>
          </van-field>
          <van-field
            :model-value="getOptionLabel(GEARBOX_OPTIONS, form.gearbox)"
            label="变速箱"
            placeholder="请选择"
            is-link
            readonly
            @click="showGearboxPicker = true"
          />
          <van-field
            :model-value="getOptionLabel(EMISSION_STANDARD_OPTIONS, form.emissionStandard)"
            label="排放标准"
            placeholder="请选择"
            is-link
            readonly
            @click="showEmissionPicker = true"
          />
          <van-field
            :model-value="getOptionLabel(USE_TYPE_OPTIONS, form.useType)"
            label="使用性质"
            placeholder="请选择"
            is-link
            readonly
            @click="showUseTypePicker = true"
          />
          <van-field
            v-model="form.transferCount"
            type="digit"
            label="过户次数"
            placeholder="0"
          >
            <template #button><span class="unit-text">次</span></template>
          </van-field>
          <van-field
            v-model="form.color"
            label="车身颜色"
            placeholder="如：白色、黑色"
          />
        </van-cell-group>

        <van-cell-group inset title="车辆标识">
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
        </van-cell-group>

        <van-cell-group inset title="车辆所在地">
          <van-field
            :model-value="form.regionNames.join(' ')"
            label="省市区"
            placeholder="请选择地区"
            is-link
            readonly
            @click="showRegionPicker = true"
          />
          <AddressInput
            v-model="form.address"
            label="详细地址"
            placeholder="请输入详细地址（选填）"
          />
        </van-cell-group>

        <van-cell-group inset title="车辆配置">
          <van-field
            :model-value="configsText"
            label="配置"
            placeholder="请选择车辆配置"
            is-link
            readonly
            @click="showConfigPicker = true"
          />
        </van-cell-group>
      </div>

      <!-- 步骤3：图片视频 -->
      <div v-show="currentStep === 2" class="step-content">
        <van-cell-group inset title="车辆图片">
          <van-cell>
            <div class="image-uploader">
              <!-- 图片列表 -->
              <div class="image-list">
                <div 
                  v-for="item in imageManager.displayImages.value" 
                  :key="item.id" 
                  class="image-item"
                  :class="{ 'is-uploading': item.status === 'uploading', 'is-failed': item.status === 'failed' }"
                >
                  <img :src="item.url" alt="车辆图片" />
                  <div v-if="item.status === 'uploading'" class="image-loading">
                    <van-loading size="24px" color="#fff" />
                    <span>上传中...</span>
                  </div>
                  <div v-if="item.status === 'failed'" class="image-failed">
                    <van-icon name="warning-o" />
                    <span>{{ item.message || '上传失败' }}</span>
                  </div>
                  <van-icon 
                    name="cross" 
                    class="image-delete" 
                    @click="handleImageDelete(item)"
                  />
                  <div v-if="item.status === 'existing'" class="image-badge">已有</div>
                </div>
                
                <!-- 添加按钮 -->
                <div v-if="imageManager.validCount.value < 9" class="image-add">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    @change="handleImageSelect"
                  />
                  <van-icon name="plus" />
                  <span>{{ imageManager.validCount.value }}/9</span>
                </div>
              </div>
            </div>
            <p class="upload-tip">最多上传9张图片，建议上传车辆外观、内饰、发动机等照片</p>
          </van-cell>
        </van-cell-group>

        <van-cell-group inset title="车辆视频">
          <van-cell>
            <VideoUploader
              v-model="form.video"
              :thumbnail="form.videoThumbnail"
              @update:thumbnail="form.videoThumbnail = $event"
            />
            <p class="upload-tip">上传车辆介绍视频，让买家更直观了解车况（选填）</p>
          </van-cell>
        </van-cell-group>

        <van-cell-group inset title="车辆描述">
          <van-field
            v-model="form.highlightDesc"
            type="textarea"
            label="车辆亮点"
            placeholder="请描述车辆亮点，如保养记录、车况等"
            rows="3"
            autosize
            maxlength="500"
            show-word-limit
          />
        </van-cell-group>
      </div>

      <!-- 步骤4：联系方式 -->
      <div v-show="currentStep === 3" class="step-content">
        <van-cell-group inset title="联系方式">
          <van-cell>
            <van-checkbox v-model="form.usePlatformPhone">
              使用平台销售电话（保护个人隐私）
            </van-checkbox>
          </van-cell>
          <van-field
            v-if="!form.usePlatformPhone"
            v-model="form.contactPhone"
            type="tel"
            label="联系电话"
            placeholder="请输入联系电话"
            maxlength="11"
          />
          <van-cell v-if="form.usePlatformPhone" class="privacy-tip">
            <van-icon name="info-o" />
            <span>选择此选项后，买家将通过平台客服联系您，保护您的个人隐私</span>
          </van-cell>
        </van-cell-group>

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

      <!-- 操作按钮 -->
      <div class="form-actions">
        <van-button v-if="currentStep > 0" @click="prevStep">上一步</van-button>
        <van-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</van-button>
        <van-button 
          v-if="currentStep === 3" 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEditMode ? '保存修改' : '提交发布' }}
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
        :columns-type="['year', 'month']"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 变速箱选择器 -->
    <van-popup v-model:show="showGearboxPicker" position="bottom">
      <van-picker
        :columns="GEARBOX_OPTIONS.map(o => ({ text: o.label, value: o.value }))"
        @confirm="onGearboxConfirm"
        @cancel="showGearboxPicker = false"
      />
    </van-popup>

    <!-- 排放标准选择器 -->
    <van-popup v-model:show="showEmissionPicker" position="bottom">
      <van-picker
        :columns="EMISSION_STANDARD_OPTIONS.map(o => ({ text: o.label, value: o.value }))"
        @confirm="onEmissionConfirm"
        @cancel="showEmissionPicker = false"
      />
    </van-popup>

    <!-- 使用性质选择器 -->
    <van-popup v-model:show="showUseTypePicker" position="bottom">
      <van-picker
        :columns="USE_TYPE_OPTIONS.map(o => ({ text: o.label, value: o.value }))"
        @confirm="onUseTypeConfirm"
        @cancel="showUseTypePicker = false"
      />
    </van-popup>

    <!-- 配置选择器 -->
    <van-popup v-model:show="showConfigPicker" position="bottom" :style="{ maxHeight: '60%' }">
      <div class="config-picker">
        <div class="config-header">
          <span>选择车辆配置</span>
          <van-button size="small" type="primary" @click="showConfigPicker = false">确定</van-button>
        </div>
        <div class="config-list">
          <van-checkbox-group v-model="form.configs">
            <van-cell-group>
              <van-cell
                v-for="config in CAR_CONFIG_OPTIONS"
                :key="config.value"
                :title="config.label"
                clickable
                @click="onConfigToggle(config.value)"
              >
                <template #right-icon>
                  <van-checkbox :name="config.value" @click.stop />
                </template>
              </van-cell>
            </van-cell-group>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>

    <!-- 地区选择器 -->
    <RegionPicker
      v-model="form.regionIds"
      :show="showRegionPicker"
      @update:show="showRegionPicker = $event"
      @confirm="onRegionConfirm"
    />
  </div>
</template>

<style scoped>
/* 页面容器 - 居中布局 */
.publish-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f5ff 0%, #f7f8fa 100%);
  padding-bottom: 100px;
}

/* 步骤指示器容器 - 优化样式 */
.steps-container {
  background: #fff;
  padding: 20px 16px;
  margin-bottom: 16px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 步骤指示器自定义样式 */
.steps-container :deep(.van-steps) {
  padding: 0;
}

.steps-container :deep(.van-step__title) {
  font-size: 13px;
  font-weight: 500;
}

.steps-container :deep(.van-step--finish .van-step__title) {
  color: #1989fa;
}

.steps-container :deep(.van-step__circle) {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

/* 表单容器 - 居中布局 */
.publish-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 12px;
}

/* 步骤内容区域 */
.step-content {
  min-height: 300px;
}

/* 表单区块统一间距 */
.step-content :deep(.van-cell-group) {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-content :deep(.van-cell-group__title) {
  padding: 16px 16px 8px;
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.step-content :deep(.van-field__label) {
  width: 90px;
  font-weight: 500;
}

.step-content :deep(.van-field__control) {
  font-size: 15px;
}

/* 单位文本样式 */
.unit-text {
  color: #666;
  font-size: 14px;
  padding-left: 8px;
}

/* 上传提示文本 */
.upload-tip {
  font-size: 12px;
  color: #969799;
  margin-top: 12px;
  line-height: 1.6;
}

/* 隐私提示样式 */
.privacy-tip {
  font-size: 13px;
  color: #1989fa;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 16px;
  background: #f0f7ff;
  border-radius: 8px;
  margin: 8px 16px;
}

.privacy-tip .van-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* 操作按钮区域 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 16px;
  max-width: 800px;
  margin: 0 auto;
}

.form-actions .van-button {
  min-width: 140px;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
}

/* 发布须知样式 */
.publish-tips {
  padding: 16px;
  margin: 0 16px;
  background: #fffbe8;
  border-radius: 8px;
  color: #646566;
  font-size: 13px;
}

.publish-tips p {
  margin-bottom: 10px;
  font-weight: 600;
  color: #ed6a0c;
}

.publish-tips ul {
  padding-left: 18px;
  margin: 0;
}

.publish-tips li {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* 配置选择器样式 */
.config-picker {
  padding-bottom: env(safe-area-inset-bottom);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #ebedf0;
  font-size: 16px;
  font-weight: 600;
  background: #fff;
}

.config-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 页面加载状态 */
.page-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 响应式适配 */
@media (min-width: 768px) {
  .publish-page {
    padding-top: 20px;
  }
  
  .steps-container {
    border-radius: 12px;
    margin: 0 auto 20px;
  }
  
  .publish-form {
    padding: 0 20px;
  }
  
  .step-content :deep(.van-cell-group) {
    margin-bottom: 20px;
  }
  
  .form-actions {
    padding: 32px 20px;
  }
  
  .form-actions .van-button {
    min-width: 160px;
  }
}

/* 图片上传组件样式 */
.image-uploader {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background: #f7f8fa;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item.is-uploading img,
.image-item.is-failed img {
  opacity: 0.5;
}

.image-loading,
.image-failed {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
}

.image-failed {
  background: rgba(238, 10, 36, 0.7);
}

.image-delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.image-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(25, 137, 250, 0.8);
  color: #fff;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
}

.image-add {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdee0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #969799;
  cursor: pointer;
  background: #f7f8fa;
}

.image-add input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-add .van-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.image-add span {
  font-size: 12px;
}
</style>
